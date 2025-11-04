package com.bmebharat.newapp.phonehint

import android.app.Activity
import android.content.Intent
import android.util.Log
import com.facebook.react.bridge.*

class PhoneHintModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), ActivityEventListener {

    private val hintView = PhoneHintView(reactContext)
    private var promise: Promise? = null

    init {
        reactContext.addActivityEventListener(this)
    }

    override fun getName() = "PhoneHintModule"

    @ReactMethod
    fun requestPhoneNumber(promise: Promise) {
        this.promise = promise
        hintView.requestPhoneNumber()
    }

    // Must include Activity parameter!
    override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
        try {
            if (requestCode == 1001) { // RC_HINT
                hintView.handleActivityResult(requestCode, resultCode, data)
                // Optionally resolve/reject promise here if needed
            }
        } catch (e: Exception) {
            Log.e("PhoneHintModule", "Error handling phone hint result: ${e.message}")
            promise?.reject("PHONE_HINT_ERROR", e)
        } finally {
            promise = null
        }
    }

    override fun onNewIntent(intent: Intent) {
        // No-op
    }
}
