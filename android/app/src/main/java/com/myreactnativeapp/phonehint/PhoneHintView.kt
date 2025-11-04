package com.bmebharat.newapp.phonehint

import android.app.Activity
import android.content.Intent
import android.content.IntentSender
import android.util.Log
import android.view.View
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.facebook.react.bridge.LifecycleEventListener
import com.google.android.gms.auth.api.identity.GetPhoneNumberHintIntentRequest
import com.google.android.gms.auth.api.identity.Identity

class PhoneHintView(private val reactContext: ReactContext) {

    private val RC_HINT = 1001

    fun requestPhoneNumber() {
        val activity = reactContext.currentActivity ?: run {
            emitEvent("error", "Activity is null")
            return
        }

        try {
            val request = GetPhoneNumberHintIntentRequest.builder().build()
            val client = Identity.getSignInClient(activity)

            client.getPhoneNumberHintIntent(request)
                .addOnSuccessListener { pendingIntent ->
                    try {
                        activity.startIntentSenderForResult(
                            pendingIntent.intentSender,
                            RC_HINT,
                            null,
                            0,
                            0,
                            0
                        )
                        emitEvent("started")
                    } catch (e: IntentSender.SendIntentException) {
                        emitEvent("error", e.message)
                    }
                }
                .addOnFailureListener { e ->
                    emitEvent("error", e.message)
                }
        } catch (e: Exception) {
            emitEvent("error", e.message)
        }
    }

    fun handleActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
    if (requestCode != RC_HINT) return

    val activity = reactContext.currentActivity
    if (resultCode == Activity.RESULT_OK && data != null && activity != null) {
        try {
            val phoneNumber = Identity.getSignInClient(activity)
                .getPhoneNumberFromIntent(data)
            // emit event to JS
            emitEvent("success", phoneNumber)
        } catch (e: Exception) {
            emitEvent("error", e.message)
        }
    } else {
        emitEvent("canceled")
    }
}


    private fun emitEvent(status: String, value: String? = null) {
        val map = Arguments.createMap().apply {
            putString("status", status)
            value?.let { putString("value", it) }
        }
        try {
            reactContext
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                .emit("PhoneHintEvent", map)
        } catch (e: Exception) {
            Log.w("PhoneHintView", "emitEvent failed: ${e.message}")
        }
    }
}

