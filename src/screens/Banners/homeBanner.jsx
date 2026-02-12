import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  FlatList,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useIsFocused, useNavigation } from '@react-navigation/native';
import apiClient from '../ApiClient';
import BMEVideoPlayer from '../BMEVideoPlayer';
import Carousel from 'react-native-reanimated-carousel';

const { width } = Dimensions.get('window');

const HomeBanner = () => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRefs = useRef([]);
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const [videoLoading, setVideoLoading] = useState({});

  const isFocused = useIsFocused();
  const endedRef = useRef({});
  const isUserDraggingRef = useRef(false);
  const isAutoScrollingRef = useRef(false);
  const hasAutoAdvancedRef = useRef({});


  useEffect(() => {
    if (banners.length > 0) {
      hasAutoAdvancedRef.current[currentIndex] = false;
    }
  }, [currentIndex, banners.length]);
  

  useEffect(() => {
    hasAutoAdvancedRef.current = {};
    endedRef.current = {};
    setCurrentIndex(0);
  }, [banners.length]);
  
  useEffect(() => {
    videoRefs.current.forEach((ref, i) => {
      if (ref && i !== currentIndex) {
        try {
          ref.seekTo?.(0);     // 👈 reset to beginning
        } catch (e) {}
      }
    });
  }, [currentIndex]);
  

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

  const scrollToNext = () => {
    if (!banners.length) return;
  
    const nextIndex = (currentIndex + 1) % banners.length;
  
    isAutoScrollingRef.current = true;
  
    flatListRef.current?.scrollToIndex({
      index: nextIndex,
      animated: true,
    });
  };
  
  





  return (

    <View style={styles.wrapper}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, index) => index.toString()}
        removeClippedSubviews={false}
        initialNumToRender={1}
        windowSize={3}
        maxToRenderPerBatch={2}
        onScrollBeginDrag={() => {
          isUserDraggingRef.current = true;
        }}


        onMomentumScrollEnd={(e) => {
          isUserDraggingRef.current = false;
          isAutoScrollingRef.current = false;
        
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        
          // ❌ DO NOT set lastAutoAdvanceIndexRef anymore
        }}
        
        


        onScrollToIndexFailed={(info) => {
          flatListRef.current?.scrollToOffset({
            offset: info.averageItemLength * info.index,
            animated: true,
          });
        }}


        renderItem={({ item, index }) => (
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => onPressBanner(item)}
            style={{
              width,
              height: width * (10 / 16),
              overflow: 'hidden',
            }}
          >
            <BMEVideoPlayer
              ref={(ref) => (videoRefs.current[index] = ref)}
              source={item.url}
              paused={!isFocused || currentIndex !== index}
              muted
              resizeMode="cover"
              repeat={false}
              style={{ width: '100%', height: '100%' }}

              onPlaybackStatus={(status) => {
                // Loader handling
                setVideoLoading((prev) => ({
                  ...prev,
                  [index]:
                    status.status === 'loading' ||
                    status.status === 'buffering',
                }));

                if (
                  status.status === 'progress' &&
                  status.duration &&
                  status.position &&
                  index === currentIndex
                ) {
                  const remaining = status.duration - status.position;

                  // Only trigger ONCE per slide
                  if (
                    remaining < 0.5 &&
                    index === currentIndex &&
                    !hasAutoAdvancedRef.current[index] &&
                    !isUserDraggingRef.current &&
                    !isAutoScrollingRef.current
                  ) {
                  
                    hasAutoAdvancedRef.current[index] = true; 
                    isAutoScrollingRef.current = true;
                    scrollToNext();
                  }

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

      {banners.length > 1 && (
        <View style={styles.dotsWrapper}>
          {banners.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>
      )}
    </View>

  );
};

export default HomeBanner;

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },

  dotsWrapper: {
    position: "absolute",
    bottom: 10,
    flexDirection: "row",
    alignSelf: "center",
  },

  dot: {
    width: 4,
    height: 4,
    borderRadius: 4,
    borderWidth: 0.5,
    borderColor: "#000",
    backgroundColor: "#fff",
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: "#000",

  },
})