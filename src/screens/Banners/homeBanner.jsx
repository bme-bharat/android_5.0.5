import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import apiClient from '../ApiClient';
import BMEVideoPlayer from '../BMEVideoPlayer';

const { width } = Dimensions.get('window');

const HomeBanner = ({onStatusChange}) => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef([]);
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const [videoLoading, setVideoLoading] = useState({});
  const timerRef = useRef(null); // ⏱️ fallback timer
  const isFocused = useIsFocused();

  useEffect(() => {
    // notify parent whether banners exist
    onStatusChange?.(banners.length === 0);
  }, [banners]);

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
        return;
      }

      if (item.redirect?.target_url) {
        const url = item.redirect.target_url;

        // Extract ID safely
        try {
          const segments = url.split('/').filter(Boolean);
          const companyId = segments[segments.length - 1];

          if (companyId) {
            navigation.navigate('CompanyDetails', { userId: companyId });
          } else {
            console.warn('No company id found in URL');
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

  useEffect(() => {
    if (!isFocused) {
      // If screen not focused → stop timers + pause all videos
      if (timerRef.current) clearTimeout(timerRef.current);

      videoRefs.current.forEach((v) => v?.pause?.());
      return;
    }

    // Screen IS focused → normal autoplay
    if (timerRef.current) clearTimeout(timerRef.current);

    const ref = videoRefs.current[currentIndex];
    if (ref && ref.play) {
      ref.seekTo?.(0);
    }

    videoRefs.current.forEach((v, i) => {
      if (i !== currentIndex && v?.pause) v.pause();
    });

    timerRef.current = setTimeout(() => {
      moveToNext();
    }, 15000);

    return () => clearTimeout(timerRef.current);
  }, [currentIndex, moveToNext, isFocused]);


  return (

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
          activeOpacity={1}
          onPress={() => onPressBanner(item)}
          style={{
            width,
            aspectRatio: 16 / 10,
            overflow: 'hidden',
            borderBottomLeftRadius: 18,
            borderBottomRightRadius: 18
          }} >
          <BMEVideoPlayer
            ref={(ref) => (videoRefs.current[index] = ref)}
            source={item.url}
            paused={!isFocused || currentIndex !== index}
            muted={true}
            // showProgressBar={true}  
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

  );
};

export default HomeBanner;
