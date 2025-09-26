package com.bmebharat.newapp.bmevideoplayer

import android.app.Application
import com.bmebharat.newapp.bmevideoplayer.cache.CacheProvider // <-- add this

class BMEApplication : Application() {
    override fun onCreate() {
        super.onCreate()
        // Initialize cache provider (optional — just creating cache on first use is enough)
        CacheProvider.getCache(this)
    }
}
