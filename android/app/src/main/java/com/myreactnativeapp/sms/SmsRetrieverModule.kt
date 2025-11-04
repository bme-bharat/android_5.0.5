package com.bmebharat.newapp.sms

import android.content.IntentFilter
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.google.android.gms.auth.api.phone.SmsRetriever
import com.google.android.gms.tasks.OnFailureListener
import com.google.android.gms.tasks.OnSuccessListener

class SmsRetrieverModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

    private var receiver: SmsBroadcastReceiver? = null

    override fun getName(): String = "SmsRetrieverModule"

    init {
        Log.d("SmsRetrieverModule", "Module initialized")
        reactContext.addLifecycleEventListener(this)
    }

    @ReactMethod
    fun startSmsListener(promise: Promise) {
        Log.d("SmsRetrieverModule", "startSmsListener called")
        try {
            // Clean up any previous receiver
            receiver?.let {
                try {
                    Log.d("SmsRetrieverModule", "Unregistering previous receiver")
                    reactContext.unregisterReceiver(it)
                } catch (ex: Exception) {
                    Log.e("SmsRetrieverModule", "Error unregistering receiver: ${ex.localizedMessage}")
                }
            }

            // Attach React context to static companion in receiver
            SmsBroadcastReceiver.reactContext = reactContext
            Log.d("SmsRetrieverModule", "Attached ReactContext to receiver")

            // Create and register new receiver
            receiver = SmsBroadcastReceiver()
            val intentFilter = IntentFilter(SmsRetriever.SMS_RETRIEVED_ACTION)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                reactContext.registerReceiver(
                    receiver,
                    intentFilter,
                    android.content.Context.RECEIVER_EXPORTED
                )
            } else {
                @Suppress("UnspecifiedRegisterReceiverFlag")
                reactContext.registerReceiver(receiver, intentFilter)
            }

            Log.d("SmsRetrieverModule", "Receiver registered")

            // Start SMS retriever
            val client = SmsRetriever.getClient(reactContext)
            val task = client.startSmsRetriever()

            task.addOnSuccessListener(OnSuccessListener<Void> {
                Log.d("SmsRetrieverModule", "SMS Retriever started successfully")
                promise.resolve("started")
            })

            task.addOnFailureListener(OnFailureListener { e ->
                Log.e("SmsRetrieverModule", "SMS Retriever start failed: ${e.localizedMessage}")
                promise.reject("START_FAILED", e.localizedMessage)
            })

        } catch (e: Exception) {
            Log.e("SmsRetrieverModule", "Exception in startSmsListener: ${e.localizedMessage}")
            promise.reject("START_ERROR", e.localizedMessage)
        }
    }

    fun sendEvent(eventName: String, params: WritableMap) {
        try {
            if (reactContext.hasActiveCatalystInstance()) {
                Log.d("SmsRetrieverModule", "Sending event $eventName to JS")
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(eventName, params)
            }
        } catch (e: Exception) {
            Log.e("SmsRetrieverModule", "Error sending event $eventName: ${e.localizedMessage}")
        }
    }

    override fun onHostResume() {
        Log.d("SmsRetrieverModule", "onHostResume")
    }

    override fun onHostPause() {
        Log.d("SmsRetrieverModule", "onHostPause")
    }

    override fun onHostDestroy() {
        Log.d("SmsRetrieverModule", "onHostDestroy")
        try {
            receiver?.let { 
                Log.d("SmsRetrieverModule", "Unregistering receiver on destroy")
                reactContext.unregisterReceiver(it) 
            }
            receiver = null
        } catch (e: Exception) {
            Log.e("SmsRetrieverModule", "Error unregistering receiver: ${e.localizedMessage}")
        }
    }
}
