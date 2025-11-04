import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import apiClient from '../ApiClient';
import BMEVideoPlayer from '../BMEVideoPlayer';

const { width } = Dimensions.get('window');

const HomeBanner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef([]);
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const [videoLoading, setVideoLoading] = useState({});
  const timerRef = useRef(null); // ⏱️ fallback timer

  // 🔹 Fetch video banners
  const fetchBanners = useCallback(async () => {
    try {
      const response = await apiClient.post('/getBannerImages', {
        command: 'getBannerImages',
        banners_id: 'ban01',
      });

      if (response.data.status === 'success') {
        const bannerData = response.data.response;
        const mediaUrls = [];

        for (const banner of bannerData) {
          if (banner.files?.length > 0) {
            for (const file of banner.files) {
              if (file.fileKey.endsWith('.mp4')) {
                try {
                  const res = await apiClient.post('/getObjectSignedUrl', {
                    command: 'getObjectSignedUrl',
                    bucket_name: 'bme-app-admin-data',
                    key: file.fileKey,
                  });
                  if (res.data) {
                    mediaUrls.push({
                      url: res.data,
                      id: banner.company_id,
                      redirect: file.redirect,
                    });
                  }
                } catch (err) {
                  console.log('Signed URL fetch error:', err);
                }
              }
            }
          }
        }

        setBanners(mediaUrls);
      }
    } catch (err) {
      console.error('Banner fetch failed:', err);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  // 🔹 Navigate on banner press
  const onPressBanner = useCallback(
    (item) => {
      if (item.id) {
        navigation.navigate('CompanyDetails', { userId: item.id });
      } else if (item.redirect?.target_url) {
        const url = item.redirect.target_url;
        try {
          const pathname = new URL(url).pathname;
          const segments = pathname.split('/').filter(Boolean);
          const companyId = segments[segments.length - 1];
          if (companyId) {
            navigation.navigate('CompanyDetails', { userId: companyId });
          }
        } catch (err) {
          console.warn('Invalid URL:', err);
        }
      }
    },
    [navigation]
  );

  // 🔹 Move to next video manually or after video ends
  const moveToNext = useCallback(() => {
    if (!banners.length) return;
    const next = (currentIndex + 1) % banners.length;
    flatListRef.current?.scrollToIndex({ index: next, animated: true });
    setCurrentIndex(next);
  }, [currentIndex, banners.length]);

  const handleVideoEnd = useCallback(() => {
    moveToNext();
  }, [moveToNext]);

  // 🔹 Handle view changes (manual scroll)
  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      if (index !== null && index !== undefined) {
        setCurrentIndex(index);
      }
    }
  }).current;

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 80 });

  // 🔹 Control playback per visible item
  useEffect(() => {
    // Clear previous timer
    if (timerRef.current) clearTimeout(timerRef.current);

    // Play current video
    const ref = videoRefs.current[currentIndex];
    if (ref && typeof ref.play === 'function') {
      ref.seekTo?.(0);
      ref.play();
    }

    // Pause others
    videoRefs.current.forEach((v, i) => {
      if (i !== currentIndex && v?.pause) v.pause();
    });

    // ⏱️ Default 15-second fallback
    timerRef.current = setTimeout(() => {
      moveToNext();
    }, 15000);

    // Cleanup timer when index changes
    return () => clearTimeout(timerRef.current);
  }, [currentIndex, moveToNext]);

  // 🔹 Cleanup on unmount
  useEffect(() => {
    return () => clearTimeout(timerRef.current);
  }, []);

  useFocusEffect(
    useCallback(() => {
      // 🔹 When screen is focused again, play the current video
      const ref = videoRefs.current[currentIndex];
      if (ref && typeof ref.play === 'function') {
        ref.seekTo?.(0); // optional: restart from beginning
        ref.play();
      }
  
      // 🔹 Optional: pause all when leaving the screen
      return () => {
        videoRefs.current.forEach(v => v?.pause && v.pause());
      };
    }, [currentIndex])
  );
  
  return (
    <View style={{ alignItems: 'center' }}>
      <FlatList
        ref={flatListRef}
        data={banners}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        pagingEnabled
        snapToInterval={width} // 👈 account for margin
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef.current}
        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => onPressBanner(item)}
            style={{
              width,
              height: width * 0.5,
              overflow: 'hidden',
              
            }} >
            <BMEVideoPlayer
              ref={(ref) => (videoRefs.current[index] = ref)}
              source={item.url}
              paused={currentIndex !== index}
              muted={true}
              showProgressBar={true}  
              resizeMode="cover"
              style={{ width: '100%', height: '100%' }}
              repeat={false}
              onEndReached={handleVideoEnd}
              onPlaybackStatus={(status) => {
                switch (status.status) {
                  case 'loading':
                  case 'buffering':
                    setVideoLoading((prev) => ({ ...prev, [index]: true }));
                    break;
                  case 'loaded':
                  case 'playing':
                  case 'ended':
                    setVideoLoading((prev) => ({ ...prev, [index]: false }));
                    break;
                }
              }}
            />

            {videoLoading[index] && (
              <ActivityIndicator
                size="small"
                color="#fff"
                style={{
                  position: 'absolute',
                  top: '45%',
                  left: '45%',
                }}
              />
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default HomeBanner;
