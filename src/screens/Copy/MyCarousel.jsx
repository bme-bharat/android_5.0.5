import { useNavigation } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Dimensions,
  Image,
  StyleSheet,
  Animated,
  Platform,
} from "react-native";
import apiClient from "../ApiClient";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const GAP = 10; // gap between items
const SIDE_PADDING = 10; // left/right padding
const ITEM_WIDTH = SCREEN_WIDTH - SIDE_PADDING * 2;
const BANNER_RATIO = 1 / 3;
const ITEM_HEIGHT = Math.round(ITEM_WIDTH * BANNER_RATIO);




const snapInterval = ITEM_WIDTH + GAP;
const AUTOPLAY_DELAY_MS = 3000; // 3s between slides
const WRAP_FADE_DURATION = 200; // ms for fade out/in when wrapping

const MyCarousel = ({bannerID}) => {
  
  const scrollX = React.useRef(new Animated.Value(0)).current;
  const listRef = React.useRef(null);

  const [currentIndex, setCurrentIndex] = React.useState(0);
  const currentIndexRef = React.useRef(0);


  const [carouselData, setBanners] = useState([]);

  const navigation = useNavigation();

  const autoplayIntervalRef = React.useRef(null);
  const resumeTimeoutRef = React.useRef(null);

  // opacity for fade-blip effect
  const containerOpacity = React.useRef(new Animated.Value(1)).current;
  const isTransitioningRef = React.useRef(false);

  const itemCount = carouselData.length;

  const onPressBanner = useCallback(
    (item) => {
      if (item.id) {
        navigation.navigate('CompanyDetails', { userId: item.id });
        return;
      }

      if (item.redirect?.target_url) {
        const url = item.redirect.target_url;

        try {
          // Extract last segment manually (no URL API)
          const segments = url.split('/').filter(Boolean);
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


  // Fetch only video banners
  const fetchBanners = useCallback(async () => {
    try {
      const response = await apiClient.post('/getBannerImages', {
        command: 'getBannerImages',
        banners_id: bannerID,
      });

      if (response.data.status === 'success') {
        const bannerData = response.data.response;
        const mediaUrls = [];

        for (const banner of bannerData) {
          if (banner.files?.length > 0) {
            for (const file of banner.files) {
              if (file.fileKey.endsWith('.mp4')) continue;
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

        setBanners(mediaUrls);
      }
    } catch (err) {
      console.error('Banner fetch failed:', err);
    }
  }, [bannerID]);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const scrollToIndex = (index, animated = true) => {
    if (!listRef.current) return;
    const offset = index * snapInterval;
    listRef.current.scrollToOffset({ offset, animated });
  };

  // advance one slide; if wrapping, do fade-blip instead of animated scroll
  const advance = () => {
    if (isTransitioningRef.current) return;
    const next = (currentIndexRef.current + 1) % itemCount;

    // wrapping case: go from last -> 0
    if (next === 0 && currentIndexRef.current === itemCount - 1) {
      isTransitioningRef.current = true;
      // fade out
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: WRAP_FADE_DURATION,
        useNativeDriver: true,
      }).start(() => {
        // instant jump to first slide without animation
        currentIndexRef.current = 0;
        setCurrentIndex(0);
        if (listRef.current) {
          listRef.current.scrollToOffset({ offset: 0, animated: false });
        }

        // fade back in
        Animated.timing(containerOpacity, {
          toValue: 1,
          duration: WRAP_FADE_DURATION,
          useNativeDriver: true,
        }).start(() => {
          isTransitioningRef.current = false;
        });
      });
    } else {
      // normal advance with animated scroll
      currentIndexRef.current = next;
      setCurrentIndex(next);
      scrollToIndex(next, true);
    }
  };

  const startAutoplay = React.useCallback(() => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
    autoplayIntervalRef.current = setInterval(() => {
      advance();
    }, AUTOPLAY_DELAY_MS);
  }, []);

  const stopAutoplay = React.useCallback(() => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
  }, []);

  React.useEffect(() => {
    startAutoplay();
    return () => {
      if (autoplayIntervalRef.current) {
        clearInterval(autoplayIntervalRef.current);
        autoplayIntervalRef.current = null;
      }
      if (resumeTimeoutRef.current) {
        clearTimeout(resumeTimeoutRef.current);
        resumeTimeoutRef.current = null;
      }
    };
  }, [startAutoplay]);

  const onMomentumScrollEnd = (e) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / snapInterval);
    currentIndexRef.current = index;
    setCurrentIndex(index);
  };

  const onScrollBeginDrag = () => {
    stopAutoplay();
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  };

  const onScrollEndDrag = () => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
    // resume after delay
    resumeTimeoutRef.current = setTimeout(() => {
      startAutoplay();
    }, AUTOPLAY_DELAY_MS);
  };

  return (
    <View style={styles.wrapper}>
      {/* Wrap flatlist in Animated.View and animate its opacity for the wrap-blip */}
      <Animated.View style={{ opacity: containerOpacity }}>
        <Animated.FlatList
          ref={listRef}
          data={carouselData}
          keyExtractor={(_, i) => String(i)}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={snapInterval}
          decelerationRate="fast"
          snapToAlignment="start"
          contentContainerStyle={{
            paddingLeft: SIDE_PADDING,
            paddingRight: SIDE_PADDING,
          }}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onScrollBeginDrag={onScrollBeginDrag}
          onScrollEndDrag={onScrollEndDrag}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.item,
                {
                  width: ITEM_WIDTH,
                  height: ITEM_HEIGHT,
                  marginRight: index === carouselData.length - 1 ? 0 : GAP,
                },
              ]}
            >
              <Image source={{ uri: item.url }} style={styles.image} resizeMode="cover" />

            </View>
          )}
        />
      </Animated.View>

      {/* Overlay dots */}
      <View pointerEvents="none" style={styles.dotsOverlay}>
        {carouselData.map((_, i) => {
          const inputRange = [
            (i - 1) * snapInterval,
            i * snapInterval,
            (i + 1) * snapInterval,
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.85, 1.35, 0.85],
            extrapolate: "clamp",
          });
          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.5, 1, 0.5],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={`dot-${i}`}
              style={[
                styles.dot,
                {
                  transform: [{ scale }],
                  opacity,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },
  item: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#eee",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  dotsOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#999999",
    marginHorizontal: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 2,
        shadowOffset: { width: 0, height: 1 },
      },
      android: {
        elevation: 2,
      },
    }),
  },
});

export default MyCarousel;
