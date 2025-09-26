package com.bmebharat.newapp.bmevideoplayer

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.net.Uri
import android.os.Handler
import android.os.Looper
import android.view.View
import android.widget.FrameLayout
import android.widget.ImageView
import androidx.core.view.ViewCompat
import androidx.core.view.isVisible
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.common.PlaybackException
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import com.bumptech.glide.Glide
import com.bumptech.glide.request.target.CustomTarget
import com.bumptech.glide.request.transition.Transition
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlin.math.roundToLong
import com.facebook.react.uimanager.UIManagerModule
import com.facebook.react.uimanager.events.Event
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableNativeMap


class BMEVideoPlayerView(context: Context) : FrameLayout(context) {

    private val playerView: PlayerView = PlayerView(context)
    private val posterView: ImageView = ImageView(context)
    private var exoPlayer: ExoPlayer? = null
    private var playerListener: Player.Listener? = null

    private var repeat: Boolean = false
    private var paused: Boolean = false
    private var currentSource: String? = null
    private var lastPosterUrl: String? = null
    private var isPosterFading = false
    private var isSeekable: Boolean = true

    private val mainHandler = Handler(Looper.getMainLooper())
    private var progressRunnable: Runnable? = null

    init {
        layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
        setBackgroundColor(Color.WHITE)

        // Player setup
        playerView.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
        playerView.useController = false
        playerView.resizeMode = AspectRatioFrameLayout.RESIZE_MODE_ZOOM
        playerView.setBackgroundColor(Color.TRANSPARENT)
        addView(playerView)

        // Poster overlay
        posterView.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
        posterView.scaleType = ImageView.ScaleType.CENTER_CROP
        posterView.setBackgroundColor(Color.WHITE)
        posterView.alpha = 1f
        addView(posterView)
    }

    /* -------------------------
       Event / progress helpers
       ------------------------- */

    private fun emitPlayback(
    eventName: String,
    position: Long? = null,
    duration: Long? = null,
    error: String? = null
) {
    val reactContext = context as? ReactContext
    if (reactContext == null) {
        android.util.Log.w("BMEVideoPlayerView", "emitPlayback: context is not ReactContext")
        return
    }

    val map: WritableMap = Arguments.createMap().apply {
        putString("status", eventName)
        position?.let { putDouble("position", it.toDouble() / 1000) }
        duration?.let { putDouble("duration", it.toDouble() / 1000) }
        error?.let { putString("error", it) }
    }

    try {
        reactContext.getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(id, "onPlaybackStatus", map)
    } catch (e: Exception) {
        android.util.Log.w("BMEVideoPlayerView", "emitPlayback: failed to send event: ${e.message}")
    }
}

    private fun startProgressUpdates() {
        if (progressRunnable != null) return
        progressRunnable = object : Runnable {
            override fun run() {
                val p = exoPlayer ?: return
                val dur = if (p.duration > 0) p.duration else 0L
                val pos = p.currentPosition
                emitPlayback("progress", pos, dur, null)
                mainHandler.postDelayed(this, 250)
            }
        }
        mainHandler.post(progressRunnable!!)
    }

    private fun stopProgressUpdates() {
        progressRunnable?.let { mainHandler.removeCallbacks(it) }
        progressRunnable = null
    }

    /* -------------------------
       Public API (invoked from manager / JS)
       ------------------------- */

    fun setMuted(value: Boolean) {
        exoPlayer?.volume = if (value) 0f else 1f
    }

    fun stopPlayer() {
        exoPlayer?.pause()
        exoPlayer?.seekTo(0)
        emitPlayback("paused", 0L, exoPlayer?.duration ?: 0L)
        stopProgressUpdates()
        showPosterImmediately()
    }

fun setSource(url: String) {
    currentSource = url

    if (exoPlayer == null) {
        exoPlayer = ExoPlayer.Builder(context)
            .setAudioAttributes(
                androidx.media3.common.AudioAttributes.Builder()
                    .setUsage(androidx.media3.common.C.USAGE_MEDIA)
                    .setContentType(androidx.media3.common.C.AUDIO_CONTENT_TYPE_MOVIE)
                    .build(),
                /* handleAudioFocus = */ true
            )
            .build()
        playerView.player = exoPlayer
    }

    // remove previous listener if any
    playerListener?.let { exoPlayer?.removeListener(it) }

    val mediaItem = MediaItem.fromUri(Uri.parse(url))
    exoPlayer?.setMediaItem(mediaItem)
    exoPlayer?.prepare()
    exoPlayer?.repeatMode = if (repeat) Player.REPEAT_MODE_ONE else Player.REPEAT_MODE_OFF
    exoPlayer?.playWhenReady = !paused

    // create and attach a listener object and keep reference for removal
    playerListener = object : Player.Listener {
        override fun onPlaybackStateChanged(playbackState: Int) {
            when (playbackState) {
                Player.STATE_BUFFERING -> {
                    emitPlayback("buffering", exoPlayer?.currentPosition, exoPlayer?.duration)
                }
                Player.STATE_READY -> {
                    if (exoPlayer?.isPlaying == true) {
                        fadeOutPoster()
                        emitPlayback("playing", exoPlayer?.currentPosition, exoPlayer?.duration)
                        startProgressUpdates()
                        // 🔑 ensure only one active player at a time
                        setActivePlayer(this@BMEVideoPlayerView)
                        
                                val seekableWindow = exoPlayer?.currentTimeline?.getWindow(0, androidx.media3.common.Timeline.Window())
        isSeekable = seekableWindow?.isSeekable ?: true

        // emit event if not seekable
        if (!isSeekable) {
            emitPlayback("notSeekable", exoPlayer?.currentPosition, exoPlayer?.duration)
        }


                    } else {
                        emitPlayback("paused", exoPlayer?.currentPosition, exoPlayer?.duration)
                        stopProgressUpdates()
                    }
                }
                Player.STATE_ENDED -> {
                    showPosterImmediately()
                    emitPlayback("ended", exoPlayer?.duration, exoPlayer?.duration)
                    emitEndReachedEvent()   
                    stopProgressUpdates()
                }
                Player.STATE_IDLE -> {
                    emitPlayback("idle")
                    stopProgressUpdates()
                }
            }
        }

        override fun onIsPlayingChanged(isPlaying: Boolean) {
            if (exoPlayer?.playbackState == Player.STATE_READY && isPlaying) {
                fadeOutPoster()
                emitPlayback("playing", exoPlayer?.currentPosition, exoPlayer?.duration)
                startProgressUpdates()
                // 🔑 ensure only one active player at a time
                setActivePlayer(this@BMEVideoPlayerView)
            } else {
                emitPlayback("paused", exoPlayer?.currentPosition, exoPlayer?.duration)
                stopProgressUpdates()
            }
        }

        override fun onPlayerError(error: PlaybackException) {
            showPosterImmediately()
            emitPlayback("error", exoPlayer?.currentPosition, exoPlayer?.duration, error.localizedMessage)
            stopProgressUpdates()
        }
    }

    exoPlayer?.addListener(playerListener!!)
}



    fun setResizeMode(mode: String?) {
    playerView.resizeMode = when (mode) {
        "cover" -> AspectRatioFrameLayout.RESIZE_MODE_ZOOM
        "contain" -> AspectRatioFrameLayout.RESIZE_MODE_FIT
        "stretch" -> AspectRatioFrameLayout.RESIZE_MODE_FILL
        else -> AspectRatioFrameLayout.RESIZE_MODE_FIT
    }

    // Force PlayerView to re-layout
    playerView.requestLayout()
}


    fun setPoster(url: String?) {
        lastPosterUrl = url
        if (url.isNullOrBlank()) {
            posterView.setImageDrawable(null)
            posterView.setBackgroundColor(Color.WHITE)
            posterView.alpha = 1f
            posterView.visibility = View.VISIBLE
        } else {
            posterView.alpha = 1f
            posterView.visibility = View.VISIBLE
            Glide.with(context).load(url).into(posterView)

            // preload artwork for smoother transition
            Glide.with(context)
                .asBitmap()
                .load(url)
                .into(object : CustomTarget<Bitmap>() {
                    override fun onResourceReady(resource: Bitmap, transition: Transition<in Bitmap>?) {
                        try {
                            playerView.defaultArtwork = BitmapDrawable(resources, resource)
                        } catch (e: Exception) {
                            // ignore
                        }
                    }

                    override fun onLoadCleared(placeholder: Drawable?) {}
                })
        }
    }

    fun setPosterResizeMode(resizeMode: String?) {
        posterView.scaleType = when (resizeMode) {
            "cover" -> ImageView.ScaleType.CENTER_CROP
            "contain" -> ImageView.ScaleType.FIT_CENTER
            "stretch" -> ImageView.ScaleType.FIT_XY
            else -> ImageView.ScaleType.CENTER_CROP
        }
    }

    fun setRepeat(repeat: Boolean) {
        this.repeat = repeat
        exoPlayer?.repeatMode = if (repeat) Player.REPEAT_MODE_ONE else Player.REPEAT_MODE_OFF
    }

    fun setPaused(paused: Boolean) {
    this.paused = paused
    exoPlayer?.let { player ->
        if (player.playbackState == Player.STATE_READY) {
            player.playWhenReady = !paused
        } // else we rely on listener to update when ready
    }

    if (paused) {
        emitPlayback("paused", exoPlayer?.currentPosition, exoPlayer?.duration)
        stopProgressUpdates()
        
    } else {
        if (exoPlayer?.playbackState == Player.STATE_READY && exoPlayer?.isPlaying == true) {
            fadeOutPoster()
            startProgressUpdates()
        }
    }
}


    fun attachPlayer(player: ExoPlayer, posterUrl: String? = null) {
        // remove listener from old player if present
        exoPlayer?.let { old ->
            playerListener?.let { old.removeListener(it) }
        }

        exoPlayer = player
        playerView.player = player

        // attach a listener to the provided player
        playerListener = object : Player.Listener {
            override fun onPlaybackStateChanged(playbackState: Int) {
                if (playbackState == Player.STATE_READY && player.isPlaying) {
                    fadeOutPoster()
                    emitPlayback("playing", player.currentPosition, player.duration)
                    startProgressUpdates()
                }
            }

            override fun onIsPlayingChanged(isPlaying: Boolean) {
                if (player.playbackState == Player.STATE_READY && isPlaying) {
                    fadeOutPoster()
                    emitPlayback("playing", player.currentPosition, player.duration)
                    startProgressUpdates()
                } else {
                    emitPlayback("paused", player.currentPosition, player.duration)
                    stopProgressUpdates()
                }
            }

            override fun onPlayerError(error: PlaybackException) {
                showPosterImmediately()
                emitPlayback("error", player.currentPosition, player.duration, error.localizedMessage)
                stopProgressUpdates()
            }
        }
        player.addListener(playerListener!!)

        if (!posterUrl.isNullOrBlank()) setPoster(posterUrl)
        else if (!lastPosterUrl.isNullOrBlank()) setPoster(lastPosterUrl)
    }


fun seekTo(seconds: Double) {
    if (!isSeekable) {
        // optional: emit event to notify JS that seek was blocked
        emitPlayback("seekBlocked", exoPlayer?.currentPosition, exoPlayer?.duration)
        return
    }

    val player = exoPlayer ?: return
    val targetMs = (seconds * 1000).roundToLong()

    // Helper function to perform safe seek
    fun doSeek() {
        val duration = if (player.duration > 0) player.duration else Long.MAX_VALUE
        val safeTarget = targetMs.coerceIn(0, duration)
        player.seekTo(safeTarget)
        player.playWhenReady = !paused

        mainHandler.postDelayed({
            emitSeekEvent(player.currentPosition)
        }, 50)
    }

    // If player is ready and has duration → seek immediately
    if (player.playbackState == Player.STATE_READY && player.duration > 0) {
        doSeek()
        return
    }

    // Otherwise wait for player to be ready
    val listener = object : Player.Listener {
        override fun onPlaybackStateChanged(state: Int) {
            if (state == Player.STATE_READY) {
                doSeek()
                player.removeListener(this)
            }
        }
    }
    player.addListener(listener)
}


// Helper to emit seek event to JS
private fun emitSeekEvent(positionMs: Long) {
    val reactContext = context as? ReactContext ?: return
    val eventMap = Arguments.createMap().apply {
        putDouble("position", positionMs / 1000.0)
    }

    try {
        reactContext.getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(id, "onSeek", eventMap)
    } catch (e: Exception) {
        android.util.Log.w("BMEVideoPlayerView", "emitSeekEvent: ${e.message}")
    }
}


    fun releasePlayer() {
        stopProgressUpdates()
        playerListener?.let { exoPlayer?.removeListener(it) }
        playerListener = null
        exoPlayer?.release()
        exoPlayer = null
    }

    private fun fadeOutPoster() {
    if (!posterView.isVisible || isPosterFading) return
    isPosterFading = true
    val player = exoPlayer
    if (player == null || player.playbackState != Player.STATE_READY || !player.isPlaying) {
        isPosterFading = false
        return
    }
    posterView.animate()
        .alpha(0f)
        .setDuration(100)
        .withEndAction {
            posterView.visibility = View.GONE
            isPosterFading = false
        }
        .start()
}


    private fun showPosterImmediately() {
        if (!lastPosterUrl.isNullOrBlank()) setPoster(lastPosterUrl)
        posterView.alpha = 1f
        posterView.visibility = View.VISIBLE
        isPosterFading = false
    }
    
        companion object {
        private var activePlayer: BMEVideoPlayerView? = null

        fun setActivePlayer(player: BMEVideoPlayerView) {
            activePlayer?.pauseIfNotThis(player)
            activePlayer = player
        }
    }

    private fun pauseIfNotThis(other: BMEVideoPlayerView) {
        if (this != other) {
            this.setPaused(true)
        }
    }

   private fun emitEndReachedEvent() {
    val reactContext = context as? ReactContext ?: return
    try {
        reactContext.getJSModule(RCTEventEmitter::class.java)
            .receiveEvent(id, "onEndReached", Arguments.createMap())
    } catch (e: Exception) {
        android.util.Log.w("BMEVideoPlayerView", "emitEndReachedEvent: ${e.message}")
    }
}



}
