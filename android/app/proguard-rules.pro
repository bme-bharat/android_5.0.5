# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:
# ---------------------------
# Keep all Razorpay classes
# ---------------------------
-keep class com.razorpay.** { *; }
-dontwarn com.razorpay.**

# ---------------------------
# Keep Proguard annotations
# ---------------------------
-keep class proguard.annotation.** { *; }
-dontwarn proguard.annotation.**

# ---------------------------
# Keep all React Native classes (optional, but safer)
# ---------------------------
-keep class com.facebook.react.** { *; }
-dontwarn com.facebook.react.**

# ---------------------------
# Keep MainApplication & MainActivity (avoid stripping)
# ---------------------------
-keep class com.bmebharat.newapp.MainApplication { *; }
-keep class com.bmebharat.newapp.MainActivity { *; }

# ---------------------------
# Keep react-native-screens classes
# ---------------------------
-keep class com.swmansion.rnscreens.** { *; }
-dontwarn com.swmansion.rnscreens.**

# Keep androidx.fragment (used by screens)
-keep class androidx.fragment.app.** { *; }
-dontwarn androidx.fragment.app.**
