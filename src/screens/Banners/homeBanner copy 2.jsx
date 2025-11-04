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
import GlowPlaceholder from '../ShimmerPlaceholder';

const { width: windowWidth } = Dimensions.get('window');

const AUTO_SLIDE_INTERVAL = 4000; // ms for images

const HomeBanner = React.memo(({ bannerId, activeBannerId }) => {
  const isVisible = activeBannerId === bannerId;

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
          setBanners(mediaUrls);
        }
      }
    } catch (err) {
      console.error('Banner fetch failed:', err);
    }
  }, [bannerId]);



  /** Auto-slide for images */
  const stopAutoSlide = useCallback(() => {
    if (slideInterval.current) {
      clearInterval(slideInterval.current);
      clearTimeout(slideInterval.current);
      slideInterval.current = null;
    }
  }, []);
  
  
  const startAutoSlide = useCallback(() => {
    stopAutoSlide();
    slideInterval.current = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = (prev + 1) % banners.length;
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
        return nextIndex;
      });
    }, AUTO_SLIDE_INTERVAL);
  }, [banners.length, stopAutoSlide]);
  

  useEffect(() => {
    if (!isVisible || !isFocused) {
      stopAutoSlide();
      setIsPlaying({});
      return;
    }
  }, [isVisible, isFocused]);
  
  /** When banners load, start first video autoplay if needed */
  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  useEffect(() => {
    if (!banners.length || !isVisible || !isFocused) {
      stopAutoSlide();
      setIsPlaying({});
      return;
    }
  
    const current = banners[currentIndex];
  
    if (current?.type === 'video') {
      stopAutoSlide();
      setIsPlaying({ [currentIndex]: true });
    } else if (current?.type === 'image') {
      stopAutoSlide();
      slideInterval.current = setTimeout(() => {
        const nextIndex = (currentIndex + 1) % banners.length;
        setCurrentIndex(nextIndex);
        flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      }, AUTO_SLIDE_INTERVAL);
    }
  
    return () => stopAutoSlide();
  }, [currentIndex, banners, isVisible, isFocused]);
  
  

  /** When index changes */
  useEffect(() => {
    if (!isVisible || !isFocused) return;

    const current = banners[currentIndex];
    if (!current) return;

    if (current.type === 'video') {
      stopAutoSlide();
      setIsPlaying({ [currentIndex]: true });
    } else {
      startAutoSlide();
    }
  }, [currentIndex, isVisible, isFocused]);


  const handleRedirect = useCallback((url) => {
    if (!url) return;
    const safeUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(safeUrl).catch((err) =>
      console.warn('Failed to open URL:', err)
    );
  }, []);

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const indices = viewableItems.map(v => v.index).filter(i => i != null);
    const uniqueIndices = [...new Set(indices)];
    if (uniqueIndices.length > 0) {
      setCurrentIndex(uniqueIndices[0]); // use first visible index
      console.log('viewableItems', uniqueIndices.map(i => banners[i]?.type || i));
    }
  }).current;
  
  
  
  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 });
  
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
          <Image source={{
            uri: item.url,
            cache: 'force-cache', // <-- use cache
          }}
            style={styles.media}
            resizeMode="cover" />
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
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewConfigRef.current}
        onMomentumScrollEnd={(ev) => {
          let index = Math.round(ev.nativeEvent.contentOffset.x / windowWidth);
          if (index === banners.length - 1) index = 0; // loop back smoothly
          setCurrentIndex(index);
        }}
        renderItem={renderItem}
        removeClippedSubviews={false} // prevent unmounting
        initialNumToRender={banners.length} // render all items at once
        windowSize={4}
        ListEmptyComponent={
          <GlowPlaceholder/>
        }
      />
    </View>
  );
});

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
    backgroundColor: '#fff'
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
