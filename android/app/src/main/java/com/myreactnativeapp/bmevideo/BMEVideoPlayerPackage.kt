package com.bmebharat.newapp.bmevideoplayer

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class BMEVideoPlayerPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(BMEPreloadModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        // If BMEVideoPlayerManager takes no args:
        return listOf(BMEVideoPlayerManager())
        // If you want it to take reactContext:
        // return listOf(BMEVideoPlayerManager(reactContext))
    }
}
