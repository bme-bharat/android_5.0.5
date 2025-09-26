package com.bmebharat.newapp

import android.content.pm.ActivityInfo
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.swmansion.rnscreens.fragment.restoration.RNScreensFragmentFactory

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    // 👇 This is the important fix for ScreenFragment crash
    supportFragmentManager.fragmentFactory = RNScreensFragmentFactory()

    // Call super after setting the fragment factory
    super.onCreate(null)

    requestedOrientation = ActivityInfo.SCREEN_ORIENTATION_PORTRAIT
  }

  override fun getMainComponentName(): String = "MyReactNativeApp"

  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
