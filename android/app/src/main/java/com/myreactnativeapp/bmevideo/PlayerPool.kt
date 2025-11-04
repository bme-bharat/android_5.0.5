package com.bmebharat.newapp.bmevideoplayer

import android.content.Context
import android.graphics.Bitmap
import android.media.MediaMetadataRetriever
import androidx.media3.common.C
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import java.util.ArrayDeque
import java.util.concurrent.ConcurrentHashMap

object PlayerPool {
    private val pool = ArrayDeque<ExoPlayer>()
    private const val MAX_POOL = 3

    // cache first-frame thumbnails for instant display
    private val firstFrameCache = ConcurrentHashMap<String, Bitmap>()

    fun getPlayer(context: Context): ExoPlayer {
        synchronized(pool) {
            return if (pool.isNotEmpty()) pool.pop() else createPlayer(context)
        }
    }

    fun releasePlayer(player: ExoPlayer?) {
        player ?: return
        try {
            player.stop()
            player.seekTo(0)
            player.clearMediaItems()
            player.repeatMode = ExoPlayer.REPEAT_MODE_OFF
            player.volume = 1f
        } catch (_: Exception) {}

        synchronized(pool) {
            if (pool.size < MAX_POOL) pool.push(player) else player.release()
        }
    }

    // ✅ Preload multiple sources and capture first frames
    fun preloadSources(context: Context, urls: List<String>) {
        urls.take(MAX_POOL).forEach { url ->
            if (!firstFrameCache.containsKey(url)) {
                Thread {
                    try {
                        val retriever = MediaMetadataRetriever()
                        retriever.setDataSource(url)
                        val frame = retriever.getFrameAtTime(0)
                        retriever.release()
                        frame?.let { firstFrameCache[url] = it }
                    } catch (_: Exception) {}
                }.start()
            }

            // prepare player silently
            preloadPlayer(context, url)
        }
    }

    fun getFirstFrame(url: String): Bitmap? {
        return firstFrameCache[url]
    }

    fun preloadPlayer(context: Context, url: String): ExoPlayer {
    val player = getPlayer(context)
    val mediaItem = MediaItem.fromUri(url)

    // prepare without auto-playing
    player.setMediaItem(mediaItem)
    player.prepare()
    player.playWhenReady = false

    // ✅ prefetch some data (optional improvement)
    Thread {
        try {
            val dataSource = com.bmebharat.newapp.bmevideoplayer.cache.CacheProvider
                .buildCacheDataSourceFactory(context, androidx.media3.datasource.DefaultHttpDataSource.Factory())
                .createDataSource()

            val dataSpec = androidx.media3.datasource.DataSpec(android.net.Uri.parse(url))
            val inputStream = androidx.media3.datasource.DataSourceInputStream(dataSource, dataSpec)
            val buffer = ByteArray(512 * 1024)
            inputStream.read(buffer) // reads ~0.5 MB to start caching
            inputStream.close()
        } catch (_: Exception) {}
    }.start()

    return player
}



    private fun createPlayer(context: Context): ExoPlayer {
        // ✅ 1. Build a cache-aware DataSource.Factory
        val dataSourceFactory = com.bmebharat.newapp.bmevideoplayer.cache.CacheProvider.buildCacheDataSourceFactory(
            context,
            androidx.media3.datasource.DefaultHttpDataSource.Factory()
        )

        // ✅ 2. Build MediaSourceFactory using the cache data source
        val mediaSourceFactory = androidx.media3.exoplayer.source.DefaultMediaSourceFactory(dataSourceFactory)

        // ✅ 3. Build ExoPlayer with this cache-enabled source
        return ExoPlayer.Builder(context)
            .setMediaSourceFactory(mediaSourceFactory)
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
