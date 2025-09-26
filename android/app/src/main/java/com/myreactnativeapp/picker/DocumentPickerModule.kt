package com.bmeUday.documentpicker

import android.app.Activity
import android.content.ContentResolver
import android.content.ContentUris
import android.content.Intent
import android.database.Cursor
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.media.ThumbnailUtils
import android.net.Uri
import android.os.Build
import android.provider.MediaStore
import android.provider.OpenableColumns
import android.util.Base64
import android.util.Size
import androidx.activity.ComponentActivity
import androidx.activity.result.ActivityResult
import androidx.activity.result.ActivityResultLauncher
import androidx.activity.result.contract.ActivityResultContracts
import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import okhttp3.*
import okio.BufferedSink
import java.io.BufferedInputStream
import java.io.ByteArrayOutputStream
import java.security.MessageDigest
import java.util.concurrent.Executors
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import java.io.File
import android.media.MediaMetadataRetriever
import android.util.Log

class DocumentPickerModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "DocumentPicker"

    private var pickPromise: Promise? = null
    private var documentLauncher: ActivityResultLauncher<Intent>? = null
    private val executor = Executors.newSingleThreadExecutor()
    private val client = OkHttpClient()

    /** -------------------- PICK DOCUMENT -------------------- **/
    
    @ReactMethod
    fun pick(options: ReadableMap, promise: Promise) {
        pickPromise = promise
        val activity = reactContext.currentActivity as? ComponentActivity

        if (activity == null) {
            promise.reject("E_ACTIVITY_NULL", "Current activity is null or not ComponentActivity")
            return
        }

        // Register launcher if not already
        if (documentLauncher == null) {
            documentLauncher = activity.activityResultRegistry.register(
                "document_picker_launcher",
                ActivityResultContracts.StartActivityForResult()
            ) { result: ActivityResult ->
                handleActivityResult(result)
            }
        }

        val allowMultiple = options.getBoolean("allowMultiple")

        // Check if JS passed "type" (array of MIME types)
        val typeArray: Array<String>? = if (options.hasKey("type")) {
            options.getArray("type")?.toArrayList()?.map { it.toString() }?.toTypedArray()
        } else null

        val intent = Intent(Intent.ACTION_OPEN_DOCUMENT).apply {
            addCategory(Intent.CATEGORY_OPENABLE)
            putExtra(Intent.EXTRA_ALLOW_MULTIPLE, allowMultiple)

            if (typeArray != null && typeArray.isNotEmpty()) {
                // Use explicit MIME types from JS
                if (typeArray.size == 1) {
                    type = typeArray[0]
                } else {
                    type = "*/*"
                    putExtra(Intent.EXTRA_MIME_TYPES, typeArray)
                }
            } else {
                // Fallback to category
                val category = options.getString("category") ?: "all"
                val mimeTypes = mimeTypesForCategory(category)
                if (mimeTypes.size == 1) type = mimeTypes[0]
                else {
                    type = "*/*"
                    putExtra(Intent.EXTRA_MIME_TYPES, mimeTypes)
                }
            }
        }

        documentLauncher?.launch(intent)
    }


    private fun handleActivityResult(result: ActivityResult) {
        val data: Intent? = result.data
        if (result.resultCode == Activity.RESULT_OK && data != null) {
            try {
                val uris = mutableListOf<Uri>()
                data.clipData?.let { clip ->
                    for (i in 0 until clip.itemCount) uris.add(clip.getItemAt(i).uri)
                } ?: data.data?.let { uris.add(it) }

                val results = Arguments.createArray()
                uris.forEach { uri ->
                    try {
                        val takeFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION or Intent.FLAG_GRANT_WRITE_URI_PERMISSION
                        reactContext.contentResolver.takePersistableUriPermission(uri, takeFlags)
                    } catch (_: Exception) {}

                    val fileObj = buildPickedFile(uri)
                    results.pushMap(fileObj)
                }
                pickPromise?.resolve(results)
            } catch (e: Exception) {
                pickPromise?.reject("E_PICKER_FAILED", e.message)
            } finally {
                pickPromise = null
            }
        } else {
            pickPromise?.reject("E_PICKER_CANCELLED", "User cancelled")
            pickPromise = null
        }
    }

    private fun mimeTypesForCategory(category: String): Array<String> = when (category) {
        "images" -> arrayOf("image/*")
        "videos" -> arrayOf("video/*")
        "media" -> arrayOf("image/*", "video/*", "audio/*")
        "docs" -> arrayOf(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/zip",
            "text/plain"
        )
        else -> arrayOf("*/*")
    }

private fun buildPickedFile(uri: Uri): WritableMap {
    val map = Arguments.createMap()
    val cr = reactContext.contentResolver

    var displayName: String? = null
    var size: Long? = null
    var mime: String? = null

    // Get basic info from SAF
    try {
        cr.query(uri, null, null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) {
                val nameIdx = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                val sizeIdx = cursor.getColumnIndex(OpenableColumns.SIZE)
                if (nameIdx != -1) displayName = cursor.getString(nameIdx)
                if (sizeIdx != -1) size = cursor.getLong(sizeIdx)
            }
        }
        mime = cr.getType(uri)
    } catch (e: Exception) {
        Log.e("DocumentPicker", "Failed to get file info", e)
    }

    val safeName = displayName ?: "temp_${System.currentTimeMillis()}"
    val cachedFile = File(reactContext.cacheDir, safeName)

    // Copy SAF content to cache
    try {
        cr.openInputStream(uri)?.use { input ->
            cachedFile.outputStream().use { output ->
                input.copyTo(output)
            }
        }
    } catch (e: Exception) {
        Log.e("DocumentPicker", "Failed to copy file to cache", e)
    }

    map.putString("uri", "file://${cachedFile.absolutePath}")
    map.putString("name", safeName)
    map.putString("mime", mime ?: "application/octet-stream")
    map.putDouble("size", size?.toDouble() ?: 0.0)
    map.putString("source", "saf")
    map.putString("id", stableIdFromUri(uri))

    try {
        when {
            mime?.startsWith("image") == true -> {
                val bmp = BitmapFactory.decodeFile(cachedFile.absolutePath)
                map.putInt("width", bmp.width)
                map.putInt("height", bmp.height)

                // Optional Base64 thumbnail
                val thumbOut = ByteArrayOutputStream()
                bmp.compress(Bitmap.CompressFormat.JPEG, 70, thumbOut)
                map.putString(
                    "thumbnailBase64",
                    Base64.encodeToString(thumbOut.toByteArray(), Base64.NO_WRAP)
                )
            }

            mime?.startsWith("video") == true -> {
                map.putDouble("duration", 0.0)
                map.putInt("width", 0)
                map.putInt("height", 0)

            }
        }
    } catch (e: Exception) {
        Log.e("DocumentPicker", "Failed to process media metadata", e)
    }

    return map
}



    private fun stableIdFromUri(uri: Uri): String {
        val md = MessageDigest.getInstance("MD5")
        md.update(uri.toString().toByteArray())
        return md.digest().joinToString("") { "%02x".format(it) }
    }

    private fun generateThumbnailBase64(uri: Uri): String? {
        return try {
            val cr = reactContext.contentResolver
            val bmp: Bitmap? = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                cr.loadThumbnail(uri, Size(200, 200), null)
            } else {
                val mime = cr.getType(uri) ?: ""
                when {
                    mime.startsWith("image") -> cr.openInputStream(uri)?.use {
                        BitmapFactory.decodeStream(it)?.let { bmp ->
                            ThumbnailUtils.extractThumbnail(bmp, 200, 200)
                        }
                    }
                    mime.startsWith("video") -> {
                        val mmr = android.media.MediaMetadataRetriever()
                        cr.openFileDescriptor(uri, "r")?.fileDescriptor?.let { fd ->
                            mmr.setDataSource(fd)
                            mmr.frameAtTime?.let { frame ->
                                ThumbnailUtils.extractThumbnail(frame, 200, 200)
                            }
                        }
                    }
                    else -> null
                }
            }

            bmp?.let {
                val output = ByteArrayOutputStream()
                it.compress(Bitmap.CompressFormat.JPEG, 70, output)
                Base64.encodeToString(output.toByteArray(), Base64.NO_WRAP)
            }
        } catch (_: Exception) { null }
    }

    /** -------------------- MEDIA SCANNING -------------------- **/
    @ReactMethod
    fun scanMedia(options: ReadableMap, promise: Promise) {
        val category = options.getString("category") ?: "images"
        val page = if (options.hasKey("page")) options.getInt("page") else 0
        val pageSize = if (options.hasKey("pageSize")) options.getInt("pageSize") else 50

        executor.execute {
            try {
                val results = queryMediaStore(category, page, pageSize)
                val arr = Arguments.createArray()
                results.forEach { arr.pushMap(it) }
                promise.resolve(arr)
            } catch (e: Exception) {
                promise.reject("E_SCAN_FAILED", e.message)
            }
        }
    }

    private fun queryMediaStore(category: String, page: Int, pageSize: Int): List<WritableMap> {
        val results = mutableListOf<WritableMap>()
        val cr = reactContext.contentResolver
        val uri = if (category == "videos") MediaStore.Video.Media.EXTERNAL_CONTENT_URI
                  else MediaStore.Images.Media.EXTERNAL_CONTENT_URI

        val projection = arrayOf(
            MediaStore.MediaColumns._ID,
            MediaStore.MediaColumns.DISPLAY_NAME,
            MediaStore.MediaColumns.MIME_TYPE,
            MediaStore.MediaColumns.SIZE,
            MediaStore.MediaColumns.WIDTH,
            MediaStore.MediaColumns.HEIGHT,
            MediaStore.MediaColumns.DATE_ADDED
        )
        val sort = "${MediaStore.MediaColumns.DATE_ADDED} DESC"
        val cursor = cr.query(uri, projection, null, null, sort)

        cursor?.use {
            val idIdx = it.getColumnIndexOrThrow(MediaStore.MediaColumns._ID)
            val nameIdx = it.getColumnIndexOrThrow(MediaStore.MediaColumns.DISPLAY_NAME)
            val mimeIdx = it.getColumnIndexOrThrow(MediaStore.MediaColumns.MIME_TYPE)
            val sizeIdx = it.getColumnIndexOrThrow(MediaStore.MediaColumns.SIZE)
            val widthIdx = it.getColumnIndexOrThrow(MediaStore.MediaColumns.WIDTH)
            val heightIdx = it.getColumnIndexOrThrow(MediaStore.MediaColumns.HEIGHT)

            val skip = page * pageSize
            var count = 0
            while (it.moveToNext()) {
                if (count++ < skip) continue
                if (results.size >= pageSize) break

                val id = it.getLong(idIdx)
                val contentUri = ContentUris.withAppendedId(uri, id)
                val map = Arguments.createMap()
                map.putString("id", id.toString())
                map.putString("uri", contentUri.toString())
                map.putString("name", it.getString(nameIdx))
                map.putString("mime", it.getString(mimeIdx))
                map.putDouble("size", it.getLong(sizeIdx).toDouble())
                map.putInt("width", it.getInt(widthIdx))
                map.putInt("height", it.getInt(heightIdx))
                map.putString("source", "mediastore")
                map.putString("thumbnailUri", contentUri.toString())
                results.add(map)
            }
        }
        return results
    }

    /** -------------------- UPLOAD FILE -------------------- **/
    @ReactMethod
    fun upload(uriStr: String, uploadUrl: String, headers: ReadableMap?, promise: Promise) {
        executor.execute {
            try {
                val uri = Uri.parse(uriStr)
                val cr = reactContext.contentResolver
                val reqBody = StreamRequestBody(cr, uri) { written, total ->
                    val progress = if (total > 0) (written * 100 / total).toInt() else -1
                    sendEvent("DocumentPicker:onUploadProgress", Arguments.createMap().apply {
                        putString("uri", uriStr)
                        putInt("progress", progress)
                    })
                }

                val requestBuilder = Request.Builder().url(uploadUrl).post(reqBody)
                headers?.let {
                    val keys = it.keySetIterator()
                    while (keys.hasNextKey()) {
                        val key = keys.nextKey()
                        requestBuilder.addHeader(key, it.getString(key) ?: "")
                    }
                }

                val resp = client.newCall(requestBuilder.build()).execute()
                if (!resp.isSuccessful) {
                    promise.reject("E_UPLOAD_FAILED", "Status: ${resp.code}")
                } else {
                    promise.resolve(resp.body?.string())
                }
            } catch (e: Exception) {
                promise.reject("E_UPLOAD_FAILED", e.message)
            }
        }
    }

    private fun sendEvent(eventName: String, params: WritableMap) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }

    /** -------------------- STREAM REQUEST BODY -------------------- **/
    private class StreamRequestBody(
        private val resolver: ContentResolver,
        private val uri: Uri,
        private val listener: (written: Long, total: Long) -> Unit
    ) : RequestBody() {

        override fun contentType(): MediaType? = resolver.getType(uri)?.toMediaTypeOrNull()

        override fun contentLength(): Long = try {
            resolver.openFileDescriptor(uri, "r")?.statSize ?: -1L
        } catch (_: Exception) { -1L }

        override fun writeTo(sink: BufferedSink) {
            resolver.openInputStream(uri)?.use { input ->
                val buf = ByteArray(8 * 1024)
                var read: Int
                var totalWritten = 0L
                val total = contentLength()
                val bis = BufferedInputStream(input)
                while (bis.read(buf).also { read = it } != -1) {
                    sink.write(buf, 0, read)
                    totalWritten += read
                    listener(totalWritten, total)
                }
            }
        }
    }

    /** -------------------- REQUIRED RN EVENT SUBSCRIPTION -------------------- **/
    @ReactMethod fun addListener(eventName: String) {}
    @ReactMethod fun removeListeners(count: Int) {}
}
