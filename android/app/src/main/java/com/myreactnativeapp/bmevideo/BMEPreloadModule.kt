package com.bmebharat.newapp.bmevideoplayer

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.util.Log

class BMEPreloadModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName() = "BMEPreloadModule"

    @ReactMethod
    fun preload(url: String) {
        try {
            PreloadManager.preload(reactApplicationContext, url)
        } catch (e: Exception) {
            // best-effort
        }
    }

    @ReactMethod
    fun cancel(url: String) {
        try {
            PreloadManager.cancelPreload(url)
        } catch (e: Exception) { Log.e("BMEVideoPlayer", "Exception", e) }
    }
}
