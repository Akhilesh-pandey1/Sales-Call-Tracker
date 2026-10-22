package com.apexsalescall

import android.Manifest
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.telecom.PhoneAccountHandle
import android.telecom.TelecomManager
import android.telephony.SubscriptionInfo
import android.telephony.SubscriptionManager
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.ViewManager

class SimCallModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = moduleName

    private fun isSimChoosingSupported(): Boolean =
        Build.VERSION.SDK_INT >= Build.VERSION_CODES.O

    private fun hasPermission(permission: String): Boolean {
        val isGranted: Int = reactApplicationContext.checkSelfPermission(permission)
        val permissionGranted: Int = PackageManager.PERMISSION_GRANTED
        return isGranted == permissionGranted
    }

    private fun currentTelecomManager(): TelecomManager? =
        reactApplicationContext.getSystemService(TelecomManager::class.java)

    private fun currentSubscriptionManager(): SubscriptionManager? =
        reactApplicationContext.getSystemService(SubscriptionManager::class.java)

    private fun readActiveSubscriptions(): List<SubscriptionInfo> {
        if (!hasPermission(Manifest.permission.READ_PHONE_STATE)) {
            return emptyList()
        }
        val subscriptionManager: SubscriptionManager? = currentSubscriptionManager()
        if (subscriptionManager == null) {
            return emptyList()
        }
        val activeSubscriptions: List<SubscriptionInfo>? =
            subscriptionManager.activeSubscriptionInfoList
        return activeSubscriptions ?: emptyList()
    }

    private fun toComparableDigits(rawNumber: String): String {
        val digitsOnly: String = rawNumber.filter { character -> character.isDigit() }
        val comparableDigits: String = digitsOnly.removePrefix(trunkPrefix)
        return comparableDigits
    }

    private fun isSamePhoneNumber(firstNumber: String, secondNumber: String): Boolean {
        val firstDigits: String = toComparableDigits(firstNumber)
        val secondDigits: String = toComparableDigits(secondNumber)
        if (
            firstDigits.length < minimumComparableDigits ||
            secondDigits.length < minimumComparableDigits
        ) {
            return false
        }
        val isSameNumber: Boolean =
            firstDigits.endsWith(secondDigits) || secondDigits.endsWith(firstDigits)
        return isSameNumber
    }

    private fun findSubscriptionMatchingNumber(rawPhoneNumber: String): SubscriptionInfo? {
        val activeSubscriptions: List<SubscriptionInfo> = readActiveSubscriptions()
        val matchingSubscription: SubscriptionInfo? = activeSubscriptions.firstOrNull {
            subscription ->
            val simNumber: String? = subscription.number
            simNumber != null && isSamePhoneNumber(simNumber, rawPhoneNumber)
        }
        return matchingSubscription
    }

    private fun findAccountHandle(
        telecomManager: TelecomManager,
        subscriptionId: Int,
    ): PhoneAccountHandle? {
        val capableAccounts: List<PhoneAccountHandle> = telecomManager.callCapablePhoneAccounts
        val expectedHandleId: String = subscriptionId.toString()
        val matchingAccount: PhoneAccountHandle? = capableAccounts.firstOrNull { account ->
            account.id == expectedHandleId
        }
        return matchingAccount
    }

    private fun placeCallOnSlot(
        telecomManager: TelecomManager,
        accountHandle: PhoneAccountHandle,
        phoneNumber: String,
    ) {
        val callUri: Uri = Uri.parse("tel:$phoneNumber")
        val callExtras = Bundle()
        callExtras.putParcelable(TelecomManager.EXTRA_PHONE_ACCOUNT_HANDLE, accountHandle)
        telecomManager.placeCall(callUri, callExtras)
    }

    private fun toSimList(activeSubscriptions: List<SubscriptionInfo>): WritableArray {
        val simList: WritableArray = Arguments.createArray()
        for (subscription in activeSubscriptions) {
            val simNumber: String? = subscription.number
            if (simNumber == null || simNumber.isBlank()) {
                continue
            }
            val simDetails: WritableMap = Arguments.createMap()
            simDetails.putString(simNumberKey, simNumber)
            simDetails.putString(simCarrierNameKey, subscription.carrierName?.toString() ?: "")
            simList.pushMap(simDetails)
        }
        return simList
    }

    @ReactMethod
    fun readSimNumbers(promise: Promise) {
        if (!isSimChoosingSupported() || !hasPermission(Manifest.permission.READ_PHONE_STATE)) {
            val emptySimList: WritableArray = Arguments.createArray()
            promise.resolve(emptySimList)
            return
        }
        val activeSubscriptions: List<SubscriptionInfo> = readActiveSubscriptions()
        val simList: WritableArray = toSimList(activeSubscriptions)
        promise.resolve(simList)
    }

    @ReactMethod
    fun placeCallOnMatchingSim(dialedPhoneNumber: String, simPhoneNumber: String, promise: Promise) {
        if (!isSimChoosingSupported()) {
            promise.reject(simUnsupportedCode, simUnsupportedMessage)
            return
        }
        if (!hasPermission(Manifest.permission.CALL_PHONE)) {
            promise.reject(callPermissionCode, callPermissionMessage)
            return
        }
        if (!hasPermission(Manifest.permission.READ_PHONE_STATE)) {
            promise.reject(phoneStatePermissionCode, phoneStatePermissionMessage)
            return
        }
        val dialedDigitCount: Int = dialedPhoneNumber.count { character -> character.isDigit() }
        if (
            dialedDigitCount < minimumDialedDigitCount ||
            dialedDigitCount > maximumDialedDigitCount
        ) {
            promise.reject(invalidNumberCode, invalidNumberMessage)
            return
        }
        val telecomManager: TelecomManager? = currentTelecomManager()
        if (telecomManager == null) {
            promise.reject(simUnsupportedCode, simUnsupportedMessage)
            return
        }
        val matchingSubscription: SubscriptionInfo? =
            findSubscriptionMatchingNumber(simPhoneNumber)
        if (matchingSubscription == null) {
            promise.reject(simNotFoundCode, simNotFoundMessage)
            return
        }
        val accountHandle: PhoneAccountHandle? =
            findAccountHandle(telecomManager, matchingSubscription.subscriptionId)
        if (accountHandle == null) {
            promise.reject(simSlotNotFoundCode, simSlotNotFoundMessage)
            return
        }
        try {
            placeCallOnSlot(telecomManager, accountHandle, dialedPhoneNumber)
        } catch (callError: Exception) {
            promise.reject(callFailedCode, callFailedMessage, callError)
            return
        }
        val callPlaced = true
        promise.resolve(callPlaced)
    }

    companion object {
        private const val moduleName = "SimCall"
        private const val simNumberKey = "number"
        private const val simCarrierNameKey = "carrierName"
        private const val trunkPrefix = "0"
        private const val minimumComparableDigits = 8
        private const val minimumDialedDigitCount = 8
        private const val maximumDialedDigitCount = 15
        private const val simUnsupportedCode = "SIM_CALL_UNSUPPORTED"
        private const val simUnsupportedMessage =
            "This phone cannot place calls on a chosen SIM."
        private const val callPermissionCode = "CALL_PERMISSION_MISSING"
        private const val callPermissionMessage =
            "Allow the Calls permission to place calls."
        private const val phoneStatePermissionCode = "PHONE_STATE_PERMISSION_MISSING"
        private const val phoneStatePermissionMessage =
            "Allow the Phone permission to read SIM numbers."
        private const val invalidNumberCode = "INVALID_PHONE_NUMBER"
        private const val invalidNumberMessage = "This number cannot be dialed."
        private const val simNotFoundCode = "SIM_NUMBER_NOT_FOUND"
        private const val simNotFoundMessage = "This SIM number is not in the phone."
        private const val simSlotNotFoundCode = "SIM_SLOT_NOT_FOUND"
        private const val simSlotNotFoundMessage = "Could not place the call on this SIM."
        private const val callFailedCode = "CALL_PLACEMENT_FAILED"
        private const val callFailedMessage = "Could not place the call. Please try again."
    }
}

class SimCallPackage : ReactPackage {

    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> =
        listOf<NativeModule>(SimCallModule(reactContext))

    override fun createViewManagers(
        reactContext: ReactApplicationContext,
    ): List<ViewManager<*, *>> = emptyList()
}
