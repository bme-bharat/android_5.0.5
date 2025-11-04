package com.bmebharat.newapp

import android.content.Context
import android.content.pm.PackageManager
import android.util.Base64
import android.util.Log
import java.nio.charset.StandardCharsets
import java.security.MessageDigest

class AppSignatureHelper(private val context: Context) {

    companion object {
        private const val TAG = "AppSignatureHelper"
    }

    fun getAppSignatures(): List<String> {
        val appCodes = mutableListOf<String>()
        try {
            val packageName = context.packageName
            val packageManager = context.packageManager
            val packageInfo = packageManager.getPackageInfo(packageName, PackageManager.GET_SIGNING_CERTIFICATES)

            // ✅ Safely handle nullable signingInfo
            val signingInfo = packageInfo.signingInfo
            val signatures = signingInfo?.apkContentsSigners

            if (signatures != null && signatures.isNotEmpty()) {
                for (signature in signatures) {
                    val hash = hash(packageName, signature.toCharsString())
                    if (hash != null) {
                        appCodes.add(hash)
                        Log.d(TAG, "App hash: $hash")
                    }
                }
            } else {
                Log.e(TAG, "No signatures found for package $packageName")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting signature hash", e)
        }
        return appCodes
    }

    private fun hash(packageName: String, signature: String): String? {
        return try {
            val appInfo = "$packageName $signature"
            val messageDigest = MessageDigest.getInstance("SHA-256")
            messageDigest.update(appInfo.toByteArray(StandardCharsets.UTF_8))
            val hashSignature = messageDigest.digest()

            // Truncate to 9 bytes → Base64 → take first 11 chars
            val truncated = hashSignature.copyOfRange(0, 9)
            val base64Hash = Base64.encodeToString(truncated, Base64.NO_PADDING or Base64.NO_WRAP)
                .substring(0, 11)
            base64Hash
        } catch (e: Exception) {
            Log.e(TAG, "Hash generation failed", e)
            null
        }
    }
}
