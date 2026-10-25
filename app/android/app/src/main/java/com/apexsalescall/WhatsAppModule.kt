package com.apexsalescall

import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.ViewManager

class WhatsAppModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = moduleName

    private fun resolveChosenPackageName(chosenApp: String): String? {
        val chosenPackageName: String? = when (chosenApp) {
            whatsappAppChoice -> whatsappPackageName
            businessAppChoice -> businessPackageName
            else -> null
        }
        return chosenPackageName
    }

    private fun isChosenAppInstalled(chosenPackageName: String): Boolean {
        val launchIntent: Intent? =
            reactApplicationContext.packageManager.getLaunchIntentForPackage(chosenPackageName)
        return launchIntent != null
    }

    private fun readNumberDigits(internationalNumber: String): String =
        internationalNumber.filter { character -> character.isDigit() }

    private fun buildChatUri(numberDigits: String, firstMessage: String): Uri {
        val chatUriBuilder: Uri.Builder = Uri.Builder()
            .scheme("https")
            .authority(chatUriHost)
            .appendPath(numberDigits)
        if (firstMessage.isNotEmpty()) {
            chatUriBuilder.appendQueryParameter(messageQueryKey, firstMessage)
        }
        val chatUri: Uri = chatUriBuilder.build()
        return chatUri
    }

    private fun showNotInstalledToast() {
        Toast.makeText(reactApplicationContext, notInstalledMessage, Toast.LENGTH_SHORT).show()
    }

    private fun openChatInChosenApp(chosenPackageName: String, chatUri: Uri) {
        val chatIntent = Intent(Intent.ACTION_VIEW)
        chatIntent.data = chatUri
        chatIntent.setPackage(chosenPackageName)
        chatIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(chatIntent)
    }

    @ReactMethod
    fun openChat(chosenApp: String, internationalNumber: String, firstMessage: String, promise: Promise) {
        val chosenPackageName: String? = resolveChosenPackageName(chosenApp)
        if (chosenPackageName == null) {
            promise.reject(unknownAppCode, unknownAppMessage)
            return
        }
        if (!isChosenAppInstalled(chosenPackageName)) {
            showNotInstalledToast()
            promise.resolve(chatDidNotOpen)
            return
        }
        val numberDigits: String = readNumberDigits(internationalNumber)
        if (numberDigits.isEmpty()) {
            promise.reject(invalidNumberCode, invalidNumberMessage)
            return
        }
        val chatUri: Uri = buildChatUri(numberDigits, firstMessage)
        try {
            openChatInChosenApp(chosenPackageName, chatUri)
        } catch (appMissingError: ActivityNotFoundException) {
            showNotInstalledToast()
            promise.resolve(chatDidNotOpen)
            return
        } catch (openError: Exception) {
            promise.reject(openFailedCode, openFailedMessage, openError)
            return
        }
        val chatOpened = true
        promise.resolve(chatOpened)
    }

    companion object {
        private const val moduleName = "WhatsApp"
        private const val whatsappAppChoice = "whatsapp"
        private const val businessAppChoice = "business"
        private const val whatsappPackageName = "com.whatsapp"
        private const val businessPackageName = "com.whatsapp.w4b"
        private const val chatUriHost = "wa.me"
        private const val messageQueryKey = "text"
        private const val notInstalledMessage = "WhatsApp is not installed."
        private const val chatDidNotOpen = false
        private const val unknownAppCode = "UNKNOWN_WHATSAPP_APP"
        private const val unknownAppMessage = "That WhatsApp app is not known."
        private const val invalidNumberCode = "INVALID_PHONE_NUMBER"
        private const val invalidNumberMessage = "This number cannot open a chat."
        private const val openFailedCode = "WHATSAPP_OPEN_FAILED"
        private const val openFailedMessage = "Could not open WhatsApp."
    }
}

class WhatsAppPackage : ReactPackage {

    override fun createNativeModules(
        reactContext: ReactApplicationContext,
    ): List<NativeModule> = listOf<NativeModule>(WhatsAppModule(reactContext))

    override fun createViewManagers(
        reactContext: ReactApplicationContext,
    ): List<ViewManager<*, *>> = emptyList()
}
