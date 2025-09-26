package com.bmebharat.newapp.bmevideoplayer

import android.util.Log
import androidx.media3.common.PlaybackException
import androidx.media3.common.Player

class PlayerEventListener(private val statusCallback: (String) -> Unit) : Player.Listener {

    override fun onPlaybackStateChanged(playbackState: Int) {
        when (playbackState) {
            Player.STATE_BUFFERING -> statusCallback("buffering")
            Player.STATE_READY -> statusCallback("ready")
            Player.STATE_ENDED -> statusCallback("ended")
            Player.STATE_IDLE -> statusCallback("idle")
            else -> statusCallback("unknown")
        }
    }

    override fun onIsPlayingChanged(isPlaying: Boolean) {
        statusCallback(if (isPlaying) "playing" else "paused")
    }

    override fun onPlayerError(error: PlaybackException) {
        Log.w("PlayerEventListener", "player error: ${error.message}")
        statusCallback("error:${error.message}")
    }
}
