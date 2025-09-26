// HomeBanner.js
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  FlatList,
  TouchableOpacity,
  Image,
  Linking,
} from 'react-native';
import Video from 'react-native-video';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import apiClient from '../ApiClient';

const { width: windowWidth } = Dimensions.get('window');

const AUTO_SLIDE_INTERVAL = 4000; // ms for images

const HomeBanner = ({ bannerId, isVisible }) => {
  const [banners, setBanners] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState({});
  const videoRefs = useRef({});
  const flatListRef = useRef(null);
  const slideInterval = useRef(null);
  const isFocused = useIsFocused();
  const navigation = useNavigation();

  const fetchBanners = useCallback(async () => {
    try {
      const response = await apiClient.post('/getBannerImages', {
        command: 'getBannerImages',
        banners_id: bannerId,
      });

      if (response.data.status === 'success') {
        const bannerData = response.data.response;
        const mediaUrls = [];

        for (const banner of bannerData) {
          if (banner.files?.length > 0) {
            for (const file of banner.files) {
              try {
                const res = await apiClient.post('/getObjectSignedUrl', {
                  command: 'getObjectSignedUrl',
                  bucket_name: 'bme-app-admin-data',
                  key: file.fileKey,
                });

                if (res.data) {
                  const type = file.fileKey.endsWith('.mp4') ? 'video' : 'image';
                  mediaUrls.push({
                    url: res.data,
                    type,
                    redirect: file.redirect,
                  });
                }
              } catch (err) {
                console.log('Signed URL fetch error:', err);
              }
            }
          }
        }

        if (mediaUrls.length > 0) {
          // Duplicate first item at end for smooth infinite scroll
          setBanners([...mediaUrls, mediaUrls[0]]);
        }
      }
    } catch (err) {
      console.error('Banner fetch failed:', err);
    }
  }, [bannerId]);



  /** Auto-slide for images */
  const startAutoSlide = () => {
    stopAutoSlide();
    slideInterval.current = setInterval(() => {
      let nextIndex = (currentIndex + 1) % banners.length;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, AUTO_SLIDE_INTERVAL);
  };

  const stopAutoSlide = () => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
      slideInterval.current = null;
    }
  };

  /** When banners load, start first video autoplay if needed */
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  useEffect(() => {
    if (banners.length === 0) return;
    if (banners[0].type === 'video') {
      setIsPlaying({ 0: true });
    } else {
      startAutoSlide();
    }
    setCurrentIndex(0);
  }, [banners]);

  /** Pause videos if screen not focused or hidden */
  useEffect(() => {
   
      setIsPlaying({});
      stopAutoSlide();
    
  }, []);

  /** Handle current index change */
  useEffect(() => {
    if (banners.length === 0) return;
    const current = banners[currentIndex];

    if (current.type === 'image') {
      startAutoSlide();
    } else if (current.type === 'video') {
      stopAutoSlide();
      setIsPlaying((prev) => ({ ...prev, [currentIndex]: true }));
    }
  }, [currentIndex, banners]);

  const handleRedirect = useCallback((url) => {
    if (!url) return;
    const safeUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(safeUrl).catch((err) =>
      console.warn('Failed to open URL:', err)
    );
  }, []);
  
  /** Render item */
  const renderItem = ({ item, index }) => {
   
    const onPressBanner = () => {
      if (item.id) {
        // Direct navigation if item.id exists
        navigation.navigate('CompanyDetails', { userId: item.id });
      } else if (item.redirect?.target_url) {
        // Extract last segment as ID
        const url = item.redirect.target_url;
        try {
          const pathname = new URL(url).pathname; // "/company/469b6a48-b756-413d-b459-8bd9e8d81c08"
          const segments = pathname.split('/').filter(Boolean);
          const companyId = segments[segments.length - 1];
          if (companyId) {
            navigation.navigate('CompanyDetails', { userId: companyId });
          } else if (item.redirect?.backup_url) {
            handleRedirect(item.redirect.backup_url);
          }
        } catch (err) {
          console.warn('Invalid URL, fallback to backup_url', err);
          if (item.redirect?.backup_url) handleRedirect(item.redirect.backup_url);
        }
      } else if (item.redirect?.backup_url) {
        handleRedirect(item.redirect.backup_url);
      }
    };
    

    if (item.type === 'image') {
      return (
        <TouchableOpacity
          style={styles.mediaWrapper}
          onPress={onPressBanner}
          activeOpacity={0.8}
        >
          <Image source={{ uri: item.url }} style={styles.media} resizeMode="cover" />
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.mediaWrapper}>
        <Video
          ref={(ref) => (videoRefs.current[index] = ref)}
          source={{ uri: item.url }}
          style={styles.media}
          resizeMode="cover"
          paused={!isPlaying[index]}
          muted
          onEnd={() => {
            setIsPlaying((prev) => ({ ...prev, [index]: false }));
            videoRefs.current[index]?.seek(0);

            let nextIndex = (index + 1) % banners.length;
            setCurrentIndex(nextIndex);
            flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });

            if (banners[nextIndex]?.type === 'image') startAutoSlide();
          }}
        />
        <TouchableOpacity
          style={styles.overlayButton}
          onPress={onPressBanner}
          activeOpacity={0.8}
        />
      </View>
    );
  };

  return (
    <View style={styles.carouselContainer}>
      <FlatList
        ref={flatListRef}
        data={banners}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, idx) => idx.toString()}
        initialNumToRender={1}
        windowSize={2}
        onMomentumScrollEnd={(ev) => {
          let index = Math.round(ev.nativeEvent.contentOffset.x / windowWidth);
          if (index === banners.length - 1) index = 0; // loop back smoothly
          setCurrentIndex(index);
        }}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  carouselContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  mediaWrapper: {
    width: windowWidth - 10,
    marginHorizontal: 5,
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  media: {
    width: '100%',
    height: '100%',
    backgroundColor:'#fff'
  },
  overlayButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
});

export default HomeBanner;
