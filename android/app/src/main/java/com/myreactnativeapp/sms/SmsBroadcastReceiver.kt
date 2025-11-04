package com.bmebharat.newapp.sms

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.auth.api.phone.SmsRetriever

class SmsBroadcastReceiver : BroadcastReceiver() {

    companion object {
        var reactContext: ReactApplicationContext? = null
    }

    override fun onReceive(context: Context, intent: Intent) {
        Log.d("SmsBroadcastReceiver", "onReceive called")
        val extras = intent.extras
        if (extras == null) {
            Log.w("SmsBroadcastReceiver", "No extras found in intent")
            return
        }

        val status = extras.get(SmsRetriever.EXTRA_STATUS)
        Log.d("SmsBroadcastReceiver", "Status received: $status")

        val message = extras.getString(SmsRetriever.EXTRA_SMS_MESSAGE)
        Log.d("SmsBroadcastReceiver", "SMS message received: $message")

        val otp = message?.let { extractOtp(it) }
        Log.d("SmsBroadcastReceiver", "Extracted OTP: $otp")

        val data = Arguments.createMap().apply {
            putString("message", message ?: "No message received")
            putString("otp", otp ?: "No OTP found")
        }

        try {
            val ctx = reactContext
            if (ctx != null && ctx.hasActiveCatalystInstance()) {
             
                ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit("onSmsReceived", data)
            } else {
                Log.w("SmsBroadcastReceiver", "React context not active, cannot send event")
            }
        } catch (e: Exception) {
            Log.e("SmsBroadcastReceiver", "Error emitting event: ${e.localizedMessage}")
        }
    }

    private fun extractOtp(message: String): String? {
        val regex = Regex("\\b\\d{4,8}\\b")
        val found = regex.find(message)?.value
        Log.d("SmsBroadcastReceiver", "extractOtp result: $found")
        return found
    }
}
