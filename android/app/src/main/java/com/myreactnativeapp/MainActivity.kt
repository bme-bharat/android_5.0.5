package com.bmebharat.newapp

import android.content.pm.ActivityInfo
import android.os.Bundle
import android.content.Intent
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.lifecycle.lifecycleScope
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.swmansion.rnscreens.fragment.restoration.RNScreensFragmentFactory
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import android.util.Log
import com.bmebharat.newapp.phonehint.PhoneHintModule

class MainActivity : ReactActivity() {
    private var keepSplash = true

    override fun onCreate(savedInstanceState: Bundle?) {
        // Install splash screen
        val splashScreen = installSplashScreen()
        splashScreen.setKeepOnScreenCondition { keepSplash }

        // Fix for ScreenFragment crash
        supportFragmentManager.fragmentFactory = RNScreensFragmentFactory()

        super.onCreate(null)

        // Keep splash for 2 seconds
        lifecycleScope.launch {
            delay(2000)
            keepSplash = false
        }

        // Lock orientation
        requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT

       // val appHashes = AppSignatureHelper(this).getAppSignatures()
      //  Log.d("MainActivity", "App hashes: $appHashes")

    }

    override fun getMainComponentName(): String = "MyReactNativeApp"

    override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

}
