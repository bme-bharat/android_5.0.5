import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Platform,
} from "react-native";
import ImageViewer from "react-native-image-zoom-viewer";

let openViewerFn = null;
const fallbackAssets = ["buliding.jpg", "dummy.png", "female.jpg"];

// 🔹 Utility: remove fallback images
const filterMediaArray = (arr) =>
  arr.filter(
    (item) =>
      item?.url && !fallbackAssets.some((name) => item.url.includes(name))
  );

export const openMediaViewer = (mediaArray = [], startIndex = 0) => {
  const cleanedArray = filterMediaArray(mediaArray); // ✅ strip fallback images
  if (cleanedArray.length === 0) return; // nothing valid to show
  if (openViewerFn) openViewerFn({ mediaArray: cleanedArray, startIndex });
};

const MediaViewer = () => {
  const [visible, setVisible] = useState(false);
  const [mediaArray, setMediaArray] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    openViewerFn = ({ mediaArray = [], startIndex = 0 }) => {
      if (!Array.isArray(mediaArray) || mediaArray.length === 0) return;
      setMediaArray(mediaArray);
      setCurrentIndex(Math.min(startIndex, mediaArray.length - 1));
      setVisible(true);
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

  const renderThumbnail = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => setCurrentIndex(index)}
      style={[
        styles.thumbnailWrapper,
        currentIndex === index && styles.activeThumbnailWrapper,
      ]}
    >
      <Image source={{ uri: item.url }} style={styles.thumbnail} />
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} transparent onRequestClose={handleClose}>
      <View style={styles.modalContainer}>
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* MAIN IMAGE VIEWER */}
        <ImageViewer
          imageUrls={mediaArray.map((item) => ({ url: item.url }))}
          backgroundColor="black"
          enableSwipeDown
          onSwipeDown={handleClose}
          saveToLocalByLongPress={false}
          renderIndicator={() => null}
          index={currentIndex}
          onChange={(index) => setCurrentIndex(index || 0)}
          pageAnimateTime={300} // smooth animation
          scrollViewProps={{
            decelerationRate: "fast",
            showsHorizontalScrollIndicator: false,
            showsVerticalScrollIndicator: false,
          }}
        />

        {/* THUMBNAILS */}
        <View style={styles.thumbnailListWrapper}>
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

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
  },
  topBar: {
    position: "absolute",
    top: Platform.OS === "android" ? 30 : 60,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  closeButton: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 20,
    width: 36,
    height: 36,
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
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  thumbnailList: {
    flexDirection: "row",
    paddingHorizontal: 10,
  },
  thumbnailWrapper: {
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "transparent",
    marginHorizontal: 5,
  },
  activeThumbnailWrapper: {
    borderColor: "white",
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 6,
    backgroundColor: "#111",
  },
});
