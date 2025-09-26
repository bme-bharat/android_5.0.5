package com.bmebharat.newapp.bmevideoplayer

import android.content.Context
import android.util.Log
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.common.MediaItem
import java.util.concurrent.ConcurrentHashMap

/**
 * PreloadManager - manages a pool of preloaded ExoPlayers keyed by URL.
 * Players are muted and prepared in advance (playWhenReady = false).
 */
object PreloadManager {
    private val pool = ConcurrentHashMap<String, ExoPlayer>()

    fun preload(context: Context, url: String) {
        try {
            if (pool.containsKey(url)) return
            val player = ExoPlayer.Builder(context).build()
            val mediaItem = MediaItem.fromUri(url)
            player.setMediaItem(mediaItem, /* resetPosition= */ true)
            player.playWhenReady = false
            player.volume = 0f // mute while preloading
            player.prepare()
            pool[url] = player
            Log.i("PreloadManager", "preloaded: $url")
        } catch (e: Exception) {
            Log.w("PreloadManager", "preload failed: ${e.message}")
        }
    }

    fun takePreloaded(url: String): ExoPlayer? {
        return pool.remove(url)
    }

    fun cancelPreload(url: String) {
        pool.remove(url)?.let { player ->
            try {
                player.release()
                Log.i("PreloadManager", "cancelled preload: $url")
            } catch (e: Exception) {
                Log.w("PreloadManager", "failed to cancel preload: ${e.message}")
            }
        }
    }

    fun clearAll() {
        pool.values.forEach {
            try { it.release() } catch (_: Exception) {}
        }
        pool.clear()
        Log.i("PreloadManager", "cleared all preloads")
    }
}
