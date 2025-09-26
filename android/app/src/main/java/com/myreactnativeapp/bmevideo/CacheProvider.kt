package com.bmebharat.newapp.bmevideoplayer.cache

import android.content.Context
import androidx.media3.database.StandaloneDatabaseProvider
import androidx.media3.datasource.DataSource
import androidx.media3.datasource.DefaultDataSource
import androidx.media3.datasource.cache.Cache
import androidx.media3.datasource.cache.CacheDataSink
import androidx.media3.datasource.cache.CacheDataSink.Factory as CacheDataSinkFactory
import androidx.media3.datasource.cache.CacheDataSource
import androidx.media3.datasource.cache.LeastRecentlyUsedCacheEvictor
import androidx.media3.datasource.cache.SimpleCache
import java.io.File
import java.util.concurrent.atomic.AtomicReference

object CacheProvider {
  private const val CACHE_DIR_NAME = "video_cache"
  // Tune this per app / storage policy:
  const val DEFAULT_MAX_CACHE_BYTES: Long = 200L * 1024L * 1024L // 200 MB
  const val DEFAULT_FRAGMENT_SIZE: Long = 8L * 1024L * 1024L    // 8 MB recommended (>2MB)

  // Single instance
  private val cacheRef = AtomicReference<SimpleCache?>()

  fun getCache(context: Context, maxCacheBytes: Long = DEFAULT_MAX_CACHE_BYTES): Cache {
    cacheRef.get()?.let { return it }

    synchronized(cacheRef) {
      cacheRef.get()?.let { return it }

      val cacheDir = File(context.cacheDir, CACHE_DIR_NAME)
      if (!cacheDir.exists()) cacheDir.mkdirs()

      val evictor = LeastRecentlyUsedCacheEvictor(maxCacheBytes)
      val dbProvider = StandaloneDatabaseProvider(context.applicationContext)
      val simpleCache = SimpleCache(cacheDir, evictor, dbProvider)

      cacheRef.set(simpleCache)
      return simpleCache
    }
  }

  /**
   * Build a CacheDataSource.Factory wired to our SimpleCache and upstream factory.
   * - upstreamFactory: network/http factory (e.g. DefaultHttpDataSource.Factory or OkHttpFactory)
   * - fragmentSize: recommended >= 2MB; smaller increases filesystem overhead.
   */
  fun buildCacheDataSourceFactory(
    context: Context,
    upstreamFactory: DataSource.Factory,
    maxCacheBytes: Long = DEFAULT_MAX_CACHE_BYTES,
    fragmentSize: Long = DEFAULT_FRAGMENT_SIZE
  ): DataSource.Factory {
    val cache = getCache(context, maxCacheBytes)

    // Create a write-sink factory that will actually write cache files.
    val cacheDataSinkFactory = CacheDataSinkFactory()
      .setCache(cache)
      .setFragmentSize(fragmentSize)
      // .setBufferSize(...) // optional: use default unless you have special needs

    // Configure CacheDataSource.Factory to use upstream and to write via sink.
    val cacheDataSourceFactory = CacheDataSource.Factory()
      .setCache(cache)
      .setUpstreamDataSourceFactory(upstreamFactory)
      .setCacheWriteDataSinkFactory(cacheDataSinkFactory)
      // block on cache if key locked and ignore cache on error fallback to network:
      .setFlags(CacheDataSource.FLAG_BLOCK_ON_CACHE or CacheDataSource.FLAG_IGNORE_CACHE_ON_ERROR)

    return cacheDataSourceFactory
  }

  /** Release the in-memory DB & file handles (call when app terminating or for tests). */
  fun releaseCache() {
    synchronized(cacheRef) {
      cacheRef.getAndSet(null)?.let { cache ->
        try {
          // release any resources — media3 SimpleCache implements release.
          cache.release()
        } catch (e: Exception) {
          // swallow but log in your logger
        }
      }
    }
  }

  /**
   * Delete cache files on disk (destructive). Use carefully (e.g., for "Clear cache" user action).
   * Note: SimpleCache.delete(File) exists in older Exo versions; if not available, delete files manually.
   */
  fun deleteCacheFiles(context: Context) {
    synchronized(cacheRef) {
      releaseCache()
      val cacheDir = File(context.cacheDir, CACHE_DIR_NAME)
      if (cacheDir.exists()) {
        cacheDir.deleteRecursively()
      }
    }
  }
}
