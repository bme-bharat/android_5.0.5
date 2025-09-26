package com.bmebharat.newapp.bmevideoplayer

import android.content.Context
import android.media.AudioAttributes 
import androidx.media3.common.C
import androidx.media3.exoplayer.ExoPlayer
import java.util.ArrayDeque

object PlayerPool {
    private val pool = ArrayDeque<ExoPlayer>()
    private const val MAX_POOL = 3

    fun getPlayer(context: Context): ExoPlayer {
        synchronized(pool) {
            return if (pool.isNotEmpty()) {
                pool.pop()
            } else {
                createPlayer(context)
            }
        }
    }

    fun releasePlayer(player: ExoPlayer?) {
        player ?: return
        try {
            player.playWhenReady = false
            player.seekToDefaultPosition()
        } catch (e: Exception) {
            // ignore
        }
        synchronized(pool) {
            if (pool.size < MAX_POOL) {
                pool.push(player)
            } else {
                player.release()
            }
        }
    }

    fun createPreloadPlayer(context: Context): ExoPlayer {
        val p = createPlayer(context)
        p.playWhenReady = false
        return p
    }

 private fun createPlayer(context: Context): ExoPlayer {
    val audioAttrs = AudioAttributes.Builder()
        .setContentType(AudioAttributes.CONTENT_TYPE_MOVIE) // ✅ now resolves
        .setUsage(android.media.AudioAttributes.USAGE_MEDIA)
        .build()

    return ExoPlayer.Builder(context)
        .setAudioAttributes(
            androidx.media3.common.AudioAttributes.Builder()
                .setContentType(androidx.media3.common.C.AUDIO_CONTENT_TYPE_MOVIE)
                .setUsage(androidx.media3.common.C.USAGE_MEDIA)
                .build(),
            true
        )
        .build()
}


}
