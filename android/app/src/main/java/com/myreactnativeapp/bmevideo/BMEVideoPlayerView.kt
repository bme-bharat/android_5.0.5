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
import com.facebook.react.bridge.LifecycleEventListener
import android.os.SystemClock
import android.widget.SeekBar
import android.widget.ProgressBar
import android.widget.LinearLayout


class BMEVideoPlayerView(context: Context) : FrameLayout(context),LifecycleEventListener {

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
    private var nextSource: String? = null
    private var firstFrameBitmap: Bitmap? = null
    private val progressBar: SeekBar = SeekBar(context)
    private lateinit var progressContainer: LinearLayout

    private val mainHandler = Handler(Looper.getMainLooper())
    private var progressRunnable: Runnable? = null

    private var backgroundPaused = false // paused because app went to background

    private var isUserSeeking = false
    private var lastUserProgress = 0

    init {
        layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
        setBackgroundColor(Color.WHITE)

        // Player setup
        playerView.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
        playerView.useController = false
        playerView.resizeMode = AspectRatioFrameLayout.RESIZE_MODE_ZOOM
        playerView.setBackgroundColor(Color.WHITE)
        addView(playerView)

        // Poster overlay
        posterView.layoutParams = LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT)
        posterView.scaleType = ImageView.ScaleType.CENTER_CROP
        posterView.setBackgroundColor(Color.WHITE)
        posterView.alpha = 1f
        addView(posterView)

        // if using media3 PlayerView API names:
        playerView.setKeepContentOnPlayerReset(true)
        playerView.setShutterBackgroundColor(Color.TRANSPARENT)

// --- Custom Progress Container (light + minimal) ---
progressContainer = LinearLayout(context).apply {
    orientation = LinearLayout.VERTICAL
    layoutParams = LayoutParams(
        LayoutParams.MATCH_PARENT,
        LayoutParams.WRAP_CONTENT,
        android.view.Gravity.BOTTOM
    )
    setPadding(0, 0, 0, 0)
    elevation = 3f
    visibility = View.GONE
}


// --- SeekBar Styling ---
        progressBar.layoutParams = LayoutParams(
            LayoutParams.MATCH_PARENT,
            (3 * resources.displayMetrics.density).toInt() // thinner bar
        )
        progressBar.setPadding(0, 0, 0, 0)
        progressBar.max = 1000
        progressBar.progress = 0
        progressBar.thumb = null
        progressBar.alpha = 1f

        progressBar.progressDrawable = context.getDrawable(android.R.drawable.progress_horizontal)?.mutate()?.apply {
            setTintMode(android.graphics.PorterDuff.Mode.SRC_IN)
            setTint(Color.parseColor("#FFFFFF"))
        }
        progressBar.progressBackgroundTintList = android.content.res.ColorStateList.valueOf(Color.parseColor("#DADADA"))

        progressContainer.addView(progressBar)
        addView(progressContainer)



progressBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
    override fun onProgressChanged(seekBar: SeekBar?, progress: Int, fromUser: Boolean) {
        if (fromUser) {
            lastUserProgress = progress
        }
    }

    override fun onStartTrackingTouch(seekBar: SeekBar?) {
        isUserSeeking = true
        stopProgressUpdates() // pause UI updates while user drags
    }

    override fun onStopTrackingTouch(seekBar: SeekBar?) {
        val player = exoPlayer ?: return
        val dur = player.duration.takeIf { it > 0 } ?: return
        val seekToMs = (dur * (lastUserProgress / 1000.0)).toLong()
        player.seekTo(seekToMs)
        player.playWhenReady = !paused && !backgroundPaused
        isUserSeeking = false
        startProgressUpdates()
    }
})


        if (context is ReactContext) {
            context.addLifecycleEventListener(this)
        }
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

private var frameCallback: android.view.Choreographer.FrameCallback? = null

private fun startProgressUpdates() {
    stopProgressUpdates()

    val player = exoPlayer ?: return
    var lastUpdateTime = SystemClock.elapsedRealtime()
    var lastPlayerTime = player.currentPosition
    var lastDuration = player.duration.takeIf { it > 0 } ?: 0L

    val choreographer = android.view.Choreographer.getInstance()
    frameCallback = object : android.view.Choreographer.FrameCallback {
        override fun doFrame(frameTimeNanos: Long) {
            val p = exoPlayer ?: return
            if (isUserSeeking || !p.isPlaying) {
                choreographer.postFrameCallback(this)
                return
            }

            val now = SystemClock.elapsedRealtime()
            val elapsed = now - lastUpdateTime

            // refresh every 250 ms
            if (elapsed >= 250) {
                lastUpdateTime = now
                lastPlayerTime = p.currentPosition
                lastDuration = p.duration.takeIf { it > 0 } ?: lastDuration
            }

            // interpolate smoothly
            val predicted = lastPlayerTime + (SystemClock.elapsedRealtime() - lastUpdateTime)
            if (lastDuration > 0) {
                val progress = ((predicted.toFloat() / lastDuration) * 1000)
                    .toInt()
                    .coerceIn(0, 1000)
                progressBar.progress = progress
            }

            choreographer.postFrameCallback(this)
        }
    }

    choreographer.postFrameCallback(frameCallback!!)
}


    private fun stopProgressUpdates() {
    progressRunnable?.let { mainHandler.removeCallbacks(it) }
    progressRunnable = null
    frameCallback?.let {
        android.view.Choreographer.getInstance().removeFrameCallback(it)
    }
    frameCallback = null
}

fun setShowProgressBar(show: Boolean) {
    progressContainer.visibility = if (show) View.VISIBLE else View.GONE
    progressBar.isEnabled = show
    progressBar.isClickable = show
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
        progressBar.progress = 0
        
    }

fun setSource(url: String) {
    currentSource = url

    val player = PlayerPool.getPlayer(context)
    val mediaItem = MediaItem.fromUri(url)
    player.setMediaItem(mediaItem)
    player.prepare()
    player.playWhenReady = false

    attachPlayer(player)
    player.seekTo(0)
}



fun play() {
    setPaused(false)
}


fun preloadNext(url: String) {
    nextSource = url
    PlayerPool.preloadPlayer(context, url) // background prepare
}

override fun onHostResume() {
    if (backgroundPaused) {
        backgroundPaused = false
        if (!paused) {
            exoPlayer?.playWhenReady = true
            startProgressUpdates()
        }
    }
}



override fun onHostPause() {
    if (exoPlayer?.isPlaying == true) {
        backgroundPaused = true
        exoPlayer?.playWhenReady = false
        emitPlayback("paused", exoPlayer?.currentPosition, exoPlayer?.duration)
        stopProgressUpdates()
        showPosterImmediately()
    }
}



    override fun onHostDestroy() {
        // Release player if the view is destroyed
        releasePlayer()
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
        exoPlayer?.playWhenReady = !paused && !backgroundPaused

        if (paused) {
            emitPlayback("paused", exoPlayer?.currentPosition, exoPlayer?.duration)
            stopProgressUpdates()
            showPosterImmediately()
        } else {
            if (exoPlayer?.playbackState == Player.STATE_READY) {
                exoPlayer?.playWhenReady = true
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

        playerListener = object : Player.Listener {

    override fun onPlaybackStateChanged(state: Int) {
        when (state) {
            Player.STATE_BUFFERING -> emitPlayback("buffering", player.currentPosition, player.duration)

            Player.STATE_READY -> {
    if (!paused) {
        player.playWhenReady = true
        fadeOutPoster()
        emitPlayback("playing", player.currentPosition, player.duration)
        startProgressUpdates()
    } else {
        player.playWhenReady = false
        emitPlayback("loaded", player.currentPosition, player.duration)
    }
}


            Player.STATE_ENDED -> {
                emitPlayback("ended", player.duration, player.duration)
                emitEndReachedEvent()
                stopProgressUpdates()
                player.seekTo(0)
                player.playWhenReady = false
                progressBar.progress = 1000

            }

            Player.STATE_IDLE -> {
                // 🔹 Add this here — treat it like "onLoadStart" for JS
                emitPlayback("loading", 0L, 0L)
                stopProgressUpdates()
            }
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

        override fun onRenderedFirstFrame() {
    // safe place to fade out the poster because the player actually painted a frame
    mainHandler.post {
        fadeOutPoster()
        startProgressUpdates()
    }
}

        override fun onPlayerError(error: PlaybackException) {
            mainHandler.postDelayed({
                val url = currentSource ?: return@postDelayed
                val mediaItem = MediaItem.fromUri(url)
                exoPlayer?.setMediaItem(mediaItem)
                exoPlayer?.prepare()
                exoPlayer?.playWhenReady = !paused && !backgroundPaused

            }, 1000)
        }

        }
        player.addListener(playerListener!!)

        if (!posterUrl.isNullOrBlank()) setPoster(posterUrl)
        else if (!lastPosterUrl.isNullOrBlank()) setPoster(lastPosterUrl)
    }


private fun captureFirstFrame(videoUrl: String?) {
    if (videoUrl.isNullOrBlank()) return

    Thread {
        try {
            val retriever = android.media.MediaMetadataRetriever()
            retriever.setDataSource(context, Uri.parse(videoUrl))
            val frame = retriever.getFrameAtTime(0, android.media.MediaMetadataRetriever.OPTION_CLOSEST_SYNC)
            retriever.release()

            frame?.let {
                firstFrameBitmap = it
                Handler(Looper.getMainLooper()).post {
                    posterView.setImageBitmap(it)
                    posterView.alpha = 1f
                    posterView.visibility = View.VISIBLE
                }
            }
        } catch (e: Exception) {
            android.util.Log.e("BMEVideoPlayerView", "Failed to capture first frame: ${e.message}")
        }
    }.start()
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
    exoPlayer?.let { PlayerPool.releasePlayer(it) }
    playerListener = null
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