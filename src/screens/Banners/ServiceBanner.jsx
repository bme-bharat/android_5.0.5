import React, { useCallback, useEffect, useState } from "react";
import { View, Image, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import apiClient from "../ApiClient";
import FastImage from "@d11/react-native-fast-image";

const { width } = Dimensions.get("window");
const HORIZONTAL_MARGIN = 10;

const bannerWidth = width;

const ServiceBanner = ({ bannerId }) => {
  const navigation = useNavigation();
  const [carouselData, setBanners] = useState([]);
  const isSingle = carouselData.length <= 1;

  const [activeIndex, setActiveIndex] = useState(0);
  const isFocused = useIsFocused();

  const onPressBanner = useCallback(
    (item) => {
      if (item.id) {
        navigation.navigate("CompanyDetails", { userId: item.id });
        return;
      }

      if (item.redirect?.target_url) {
        const segments = item.redirect.target_url.split("/").filter(Boolean);
        const companyId = segments[segments.length - 1];
        if (companyId) {
          navigation.navigate("CompanyDetails", { userId: companyId });
        }
      }
    },
    [navigation]
  );

  const fetchBanners = useCallback(async () => {
    try {
      const response = await apiClient.post("/getBannerImages", {
        command: "getBannerImages",
        banners_id: "serviceAd01",
      });

      if (response.data.status === "success") {
        const bannerData = response.data.response;
        const mediaUrls = [];

        for (const banner of bannerData) {
          for (const file of banner.files || []) {
            if (file.fileKey.endsWith(".mp4")) continue;

            const res = await apiClient.post("/getObjectSignedUrl", {
              command: "getObjectSignedUrl",
              bucket_name: "bme-app-admin-data",
              key: file.fileKey,
            });

            if (res.data) {
              mediaUrls.push({
                url: res.data,
                id: banner.company_id,
                redirect: file.redirect,
              });
            }
          }
        }

        setBanners(mediaUrls);
      }
    } catch (err) {
      console.error("Banner fetch failed:", err);
    }
  }, []);

  useEffect(() => {
    if (isFocused && carouselData.length === 0) {
      fetchBanners();
    }
  }, [isFocused, fetchBanners]);


  if (!carouselData.length) return null;

  return (
    <View style={styles.wrapper}>
      <Carousel
        width={bannerWidth}
        height={bannerWidth / 3}
        data={carouselData}
        onSnapToItem={setActiveIndex}
        autoPlay={!isSingle && isFocused}
        autoPlayInterval={3500}
        loop={!isSingle}
        scrollAnimationDuration={600}
        panGestureHandlerProps={
          isSingle ? undefined : { activeOffsetX: [-10, 10] }
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.95}
            style={styles.slide}

            onPress={() => onPressBanner(item)}
          >
              <View style={styles.imageContainer}>
      <FastImage source={{ uri: item.url }} style={styles.image} />
    </View>

          </TouchableOpacity>
        )}
      />

      {carouselData.length > 1 && (
        <View style={styles.dotsWrapper}>
          {carouselData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === activeIndex && styles.activeDot,
              ]}
            />
          ))}
        </View>
      )}


    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
  },

  slide: {
    width: "100%",
    height: "100%",
  },

  imageContainer: {
    flex: 1,
    paddingHorizontal: 10, // 👈 spacing between slides
    paddingVertical: 6,
  },

  image: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    backgroundColor: "#eee",
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
});

export default ServiceBanner;
