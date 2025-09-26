import { useNavigation } from "@react-navigation/native";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Image, Dimensions, StyleSheet, TouchableOpacity } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import Video from "react-native-video";
import apiClient from "../ApiClient";

const { width } = Dimensions.get("window");

const AUTO_PLAY_INTERVAL = 3000; // ms for images
const BANNER_WIDTH = width - 16;
const BANNER_HEIGHT = BANNER_WIDTH * 9 / 16; // maintain 16:9 ratio

const HomeBanner = ({ bannerId }) => {
  const navigation = useNavigation();
  const carouselRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
console.log('banners',banners)
  const fetchBanners = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.post("/getBannerImages", {
        command: "getBannerImages",
        banners_id: 'adban01',
      });
      if (data?.status !== "success") return setLoading(false);

      const files = (data.response || []).flatMap((banner) =>
        (banner.files || []).map((file) => ({
          ...file,
          redirect: banner.redirect || file.redirect || null,
        }))
      );
      const results = await Promise.all(
        files.map(async (file) => {
          try {
            const { data: signedUrl } = await apiClient.post("/getObjectSignedUrl", {
              command: "getObjectSignedUrl",
              bucket_name: "bme-app-admin-data",
              key: file.fileKey,
            });
            if (!signedUrl) return null;

            const type = file.fileKey?.toLowerCase().endsWith(".mp4") ? "video" : "image";
            let id = null;
            const match = (file.redirect?.target_url || "").match(/\/company\/([a-f0-9-]+)$/i);
            if (match?.[1]) id = match[1];

            return { url: signedUrl, type, redirect: file.redirect || null, id, fileKey: file.fileKey };
          } catch (err) {
            console.warn("Signed URL fetch failed:", file.fileKey, err?.message || err);
            return null;
          }
        })
      );

      setBanners(results.filter(Boolean));
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch banners:", err);
      setLoading(false);
    }
  }, );


  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const handleRedirect = useCallback((url) => {
    if (!url) return;
    const safeUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(safeUrl).catch((err) =>
      console.warn('Failed to open URL:', err)
    );
  }, []);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => {
    if (banners.length === 1 && banners[0].type === "video") {
      // force play immediately
      setTimeout(() => {
        if (carouselRef.current) {
          carouselRef.current.snapToItem(0); // trigger activation
        }
      }, 100);
    }
  }, [banners]);
  
  const scheduleNext = useCallback((duration = AUTO_PLAY_INTERVAL) => {
    clearTimer();
    timerRef.current = setTimeout(() => {
      if (carouselRef.current) {
        carouselRef.current.next();
      }
    }, duration);
  }, []);

  useEffect(() => {
    const current = banners[activeIndex];
    if (!current) return;
  
    if (current.type === "image") {
      scheduleNext(AUTO_PLAY_INTERVAL);
    }
  
    return clearTimer;
  }, [activeIndex, banners, scheduleNext]);
  

  const renderItem = ({ item, index }) => {

    const onPressBanner = () => {
      if (item.id) {
        navigation.navigate('CompanyDetails', { userId: item.id });
      } else if (item.redirect?.target_url) {
        handleRedirect(item.redirect.target_url);
      }
    };

    if (item.type === "image") {
      return (
        <TouchableOpacity onPress={onPressBanner} activeOpacity={0.8}>
          <Image
            source={{ uri: item.url }}
            style={styles.banner}
            resizeMode="cover"
          />
        </TouchableOpacity>

      );
    }

    if (item.type === "video") {
      const isActive = index === activeIndex;
      return (
        <TouchableOpacity onPress={onPressBanner} activeOpacity={1}>
          <Video
            key={`${index}-${isActive}`}
            source={{ uri: item.url }}
            style={styles.banner}
            resizeMode="cover"
            paused={!isActive}
            repeat={banners.length === 1}
            onEnd={() => {
              if (carouselRef.current) {
                carouselRef.current.next();
              }
            }}
            controls
          />
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={styles.bannerWrapper}>
      <Carousel
        ref={carouselRef}
        width={BANNER_WIDTH}
        height={BANNER_HEIGHT}
        data={banners}
        loop
        onSnapToItem={setActiveIndex}
        renderItem={renderItem}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bannerWrapper: {
    width: BANNER_WIDTH,
    height: BANNER_HEIGHT,
    marginHorizontal: 8,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#eee",
  },
  banner: {
    width: "100%",
    height: "100%",
  },
});

export default HomeBanner;
