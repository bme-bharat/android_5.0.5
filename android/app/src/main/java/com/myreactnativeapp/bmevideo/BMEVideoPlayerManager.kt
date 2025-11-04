package com.bmebharat.newapp.bmevideoplayer

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.common.MapBuilder 

class BMEVideoPlayerManager : SimpleViewManager<BMEVideoPlayerView>() {

    override fun getName(): String = "BMEVideoPlayer"

    override fun createViewInstance(reactContext: ThemedReactContext): BMEVideoPlayerView {
        return BMEVideoPlayerView(reactContext)
    }

    override fun getCommandsMap(): Map<String, Int> {
        return mapOf(
            "play" to 1,
            "pause" to 2,
            "seekTo" to 3,
            "release" to 4,
            "stop" to 5
        )
    }

    override fun receiveCommand(
        root: BMEVideoPlayerView,
        commandId: Int,
        args: ReadableArray?
    ) {
        when (commandId) {
            1 -> root.setPaused(false)
            2 -> root.setPaused(true)
            3 -> {
                val pos = args?.getDouble(0) ?: 0.0
                root.seekTo(pos)
            }
            4 -> root.releasePlayer()
            5 -> root.stopPlayer()
        }
    }

    // Props
    @ReactProp(name = "source")
    fun setSource(view: BMEVideoPlayerView, source: String) {
        view.setSource(source)
    }

    @ReactProp(name = "resizeMode")
    fun setResizeMode(view: BMEVideoPlayerView, resizeMode: String?) {
        view.setResizeMode(resizeMode)
    }

    @ReactProp(name = "muted", defaultBoolean = false)
    fun setMuted(view: BMEVideoPlayerView, muted: Boolean) {
        view.setMuted(muted)
    }

    @ReactProp(name = "poster")
    fun setPoster(view: BMEVideoPlayerView, poster: String?) {
        view.setPoster(poster)
    }

    @ReactProp(name = "posterResizeMode")
    fun setPosterResizeMode(view: BMEVideoPlayerView, posterResizeMode: String?) {
        view.setPosterResizeMode(posterResizeMode)
    }

    @ReactProp(name = "repeat", defaultBoolean = false)
    fun setRepeat(view: BMEVideoPlayerView, repeat: Boolean) {
        view.setRepeat(repeat)
    }

    @ReactProp(name = "paused", defaultBoolean = false)
    fun setPaused(view: BMEVideoPlayerView, paused: Boolean) {
        view.setPaused(paused)
    }

    // register direct event so JS prop `onPlaybackStatus` will receive events
  override fun getExportedCustomDirectEventTypeConstants(): MutableMap<String, Any> {
    return MapBuilder.of(
        "onPlaybackStatus", MapBuilder.of("registrationName", "onPlaybackStatus"),
        "onSeek", MapBuilder.of("registrationName", "onSeek"),  
        "onEndReached", MapBuilder.of("registrationName", "onEndReached")
    )
}

@ReactProp(name = "showProgressBar", defaultBoolean = false)
fun setShowProgressBar(view: BMEVideoPlayerView, show: Boolean) {
    view.setShowProgressBar(show)
}

    override fun onDropViewInstance(view: BMEVideoPlayerView) {
    try {
        view.releasePlayer()
        // If the view registered lifecycle listeners, remove them here (if implemented)
    } catch (e: Exception) {
        android.util.Log.e("BMEVideoPlayerManager", "onDropViewInstance error", e)
    }
    super.onDropViewInstance(view)
}

}
