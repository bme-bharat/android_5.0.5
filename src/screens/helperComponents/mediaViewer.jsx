import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";
import Video from "react-native-video";
import ImageZoom from 'react-native-image-pan-zoom';
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");
let openViewerFn = null;
const fallbackAssets = ["buliding.jpg", "dummy.png", "female.jpg"];

/* 🔹 Utility: remove fallback images */
const filterMediaArray = (arr) =>
  arr.filter(
    (item) =>
      item?.url &&
      !fallbackAssets.some((name) => item.url.includes(name))
  );

/* 🔹 Global opener */
export const openMediaViewer = (mediaArray = [], startIndex = 0) => {
  const cleanedArray = filterMediaArray(mediaArray);
  if (!cleanedArray.length) return;
  openViewerFn?.({ mediaArray: cleanedArray, startIndex });
};

const MediaViewer = () => {
  const [visible, setVisible] = useState(false);
  const [mediaArray, setMediaArray] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const insets = useSafeAreaInsets();

  const listRef = useRef(null);

  /* Status bar */
  useEffect(() => {
    StatusBar.setHidden(visible, "fade");
    return () => StatusBar.setHidden(false, "fade");
  }, [visible]);

  /* Register global open fn */
  useEffect(() => {
    openViewerFn = ({ mediaArray = [], startIndex = 0 }) => {
      setMediaArray(mediaArray);
      setCurrentIndex(startIndex);
      setVisible(true);

      requestAnimationFrame(() => {
        listRef.current?.scrollToIndex({
          index: startIndex,
          animated: false,
        });
      });
    };

    return () => {
      openViewerFn = null;
    };
  }, []);

  const handleClose = () => {
    setVisible(false);
    setCurrentIndex(0);
    setMediaArray([]);
  };

  const isVideo = (item) => item?.type === "video";

  /* 🔹 Main media renderer */
  const renderMediaItem = ({ item, index }) => {
    if (item.type === 'video') {
      return (
        <View style={styles.page}>
          <Video
            source={{ uri: item.url }}
            style={styles.video}
            resizeMode="contain"
            controls
            paused={currentIndex !== index} // auto pause
          />
        </View>
      );
    }

    // IMAGE WITH ZOOM
    return (
      <View style={styles.page}>
        <ImageZoom
          cropWidth={width}
          cropHeight={height}
          imageWidth={width}
          imageHeight={height}
          enableDoubleClickZoom
          /* 🔽 Swipe down options */
          enableSwipeDown={true}
          swipeDownThreshold={230}
          onSwipeDown={handleClose}

          /* 🎯 Focus behavior */
          enableCenterFocus={true}

          /* UI */
          backgroundColor="black"
          saveToLocalByLongPress={false}
          enablePreload
        >
          <Image
            source={{ uri: item.url }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="contain"
          />
        </ImageZoom>
      </View>
    );
  };
  /* 🔹 Thumbnails */
  const renderThumbnail = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => {
        setCurrentIndex(index);
        listRef.current?.scrollToIndex({
          index,
          animated: true,
        });
      }}
      style={[
        styles.thumbnailWrapper,
        currentIndex === index && styles.activeThumbnailWrapper,
      ]}
    >
      <Image source={{ uri: item.url }} style={styles.thumbnail} />

      {item.type === "video" && (
        <View style={styles.playOverlay}>
          <Text style={styles.playIcon}>▶</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      transparent
      statusBarTranslucent
      onRequestClose={handleClose}
      navigationBarTranslucent
    >
      <View style={styles.modalContainer}>
        {/* TOP BAR */}
        <View style={[styles.topBar, { top: insets?.top }]}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={listRef}
          data={mediaArray}
          horizontal
          pagingEnabled
          keyExtractor={(_, i) => `media-${i}`}
          renderItem={renderMediaItem}
          showsHorizontalScrollIndicator={false}
          getItemLayout={(_, index) => ({
            length: width,
            offset: width * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(
              e.nativeEvent.contentOffset.x / width
            );
            setCurrentIndex(index);
          }}
        />

        <View style={[styles.thumbnailListWrapper, { bottom: insets?.bottom }]}>
          <FlatList
            data={mediaArray}
            horizontal
            keyExtractor={(_, idx) => `thumb-${idx}`}
            renderItem={renderThumbnail}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailList}
          />
        </View>
      </View>
    </Modal>
  );
};

export default MediaViewer;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
  },

  page: {
    width,
    height,
    justifyContent: "center",
    alignItems: "center",
  },

  video: {
    width: "100%",
    height: "100%",
    backgroundColor: "black",
  },

  topBar: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  closeButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  closeText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },

  thumbnailListWrapper: {
    position: "absolute",

    left: 0,
    right: 0,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  thumbnailList: {
    paddingHorizontal: 10,
  },

  thumbnailWrapper: {
    marginHorizontal: 5,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  activeThumbnailWrapper: {
    borderColor: "#075cab",
  },

  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  playOverlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    justifyContent: "center",
    alignItems: "center",
  },

  playIcon: {
    color: "white",
    fontSize: 14,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
});
