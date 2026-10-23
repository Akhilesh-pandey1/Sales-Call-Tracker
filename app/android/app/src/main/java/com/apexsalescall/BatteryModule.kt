package com.apexsalescall

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.PowerManager
import android.provider.Settings
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.ViewManager

class BatteryModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = moduleName

    private fun currentPowerManager(): PowerManager? =
        reactApplicationContext.getSystemService(PowerManager::class.java)

    private fun isAppIgnoringBatteryOptimization(): Boolean {
        val powerManager: PowerManager? = currentPowerManager()
        if (powerManager == null) {
            return false
        }
        val applicationId: String = reactApplicationContext.packageName
        val isIgnoring: Boolean = powerManager.isIgnoringBatteryOptimizations(applicationId)
        return isIgnoring
    }

    private fun buildExemptionRequestIntent(): Intent {
        val requestAction: String = Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS
        val exemptionRequestIntent = Intent(requestAction)
        val appPackageUri: Uri = Uri.parse("package:${reactApplicationContext.packageName}")
        exemptionRequestIntent.data = appPackageUri
        exemptionRequestIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        return exemptionRequestIntent
    }

    @ReactMethod
    fun isBatteryOptimizationEnabled(promise: Promise) {
        val isOptimizationEnabled: Boolean = !isAppIgnoringBatteryOptimization()
        promise.resolve(isOptimizationEnabled)
    }

    @ReactMethod
    fun requestIgnoreBatteryOptimization(promise: Promise) {
        val isAlreadyExempt: Boolean = isAppIgnoringBatteryOptimization()
        if (isAlreadyExempt) {
            val alreadyExempt = true
            promise.resolve(alreadyExempt)
            return
        }
        val exemptionRequestIntent: Intent = buildExemptionRequestIntent()
        try {
            reactApplicationContext.startActivity(exemptionRequestIntent)
        } catch (startError: ActivityNotFoundException) {
            promise.reject(dialogUnavailableCode, dialogUnavailableMessage, startError)
            return
        }
        val requestWasOpened = true
        promise.resolve(requestWasOpened)
    }

    companion object {
        private const val moduleName = "Battery"
        private const val dialogUnavailableCode = "BATTERY_DIALOG_UNAVAILABLE"
        private const val dialogUnavailableMessage =
            "This phone cannot show the battery exemption dialog."
    }
}

class BatteryPackage : ReactPackage {

    override fun createNativeModules(
        reactContext: ReactApplicationContext,
    ): List<NativeModule> = listOf<NativeModule>(BatteryModule(reactContext))

    override fun createViewManagers(
        reactContext: ReactApplicationContext,
    ): List<ViewManager<*, *>> = emptyList()
}
