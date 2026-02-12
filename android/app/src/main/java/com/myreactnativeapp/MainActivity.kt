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
import com.google.firebase.analytics.FirebaseAnalytics

class MainActivity : ReactActivity() {
    
    private lateinit var firebaseAnalytics: FirebaseAnalytics

    private var keepSplash = true

    override fun onCreate(savedInstanceState: Bundle?) {
        // Install splash screen
        val splashScreen = installSplashScreen()
        splashScreen.setKeepOnScreenCondition { keepSplash }

        // Fix for ScreenFragment crash
        supportFragmentManager.fragmentFactory = RNScreensFragmentFactory()

        super.onCreate(null)
        
    // 🔥 Initialize Firebase Analytics
        firebaseAnalytics = FirebaseAnalytics.getInstance(this)
        Log.d("Firebase", "Firebase Analytics initialized")

        // Keep splash for 1 seconds
        lifecycleScope.launch {
            delay(1000)
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
