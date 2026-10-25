package com.apexsalescall

import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.ViewManager

class TappedNumberModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = moduleName

    private fun buildTappedNumberIntent(): Intent {
        val tappedNumberIntent = Intent(Intent.ACTION_VIEW)
        val tappedNumberUri: Uri = Uri.parse(telProbeUri)
        tappedNumberIntent.data = tappedNumberUri
        return tappedNumberIntent
    }

    private fun readHandlerPackageName(): String? {
        val packageManager = reactApplicationContext.packageManager
        val handlerInfo = packageManager.resolveActivity(
            buildTappedNumberIntent(),
            PackageManager.MATCH_DEFAULT_ONLY,
        )
        return handlerInfo?.activityInfo?.packageName
    }

    @ReactMethod
    fun isTappedNumberHandler(promise: Promise) {
        val ourPackageName: String = reactApplicationContext.packageName
        val handlerPackageName: String? = readHandlerPackageName()
        val isHandlerOurs: Boolean = handlerPackageName == ourPackageName
        promise.resolve(isHandlerOurs)
    }

    companion object {
        private const val moduleName = "TappedNumber"
        private const val telProbeUri = "tel:"
    }
}

class TappedNumberPackage : ReactPackage {

    override fun createNativeModules(
        reactContext: ReactApplicationContext,
    ): List<NativeModule> = listOf<NativeModule>(TappedNumberModule(reactContext))

    override fun createViewManagers(
        reactContext: ReactApplicationContext,
    ): List<ViewManager<*, *>> = emptyList()
}
