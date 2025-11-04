import React, { useEffect, useRef, useState } from "react";
import { View, Image, Dimensions } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import Video from "react-native-video";

const { width } = Dimensions.get("window");

const carouselData = [
  {
    type: 'image',
    uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
  },
  {
    type: 'video',
    uri: 'https://www.w3schools.com/html/mov_bbb.mp4', // keep your video
  },
  {
    type: 'image',
    uri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=600&q=80',
  },
  {
    type: 'image',
    uri: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
  },

];


const HomeBanner = ({ autoPlayInterval = 3000 }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const videoRefs = useRef([]);
  const carouselRef = useRef(null);

  const handleVideoEnd = (index) => {
    const nextIndex = (index + 1) % carouselData.length;
    carouselRef.current?.scrollTo({ index: nextIndex, animated: true });
    setActiveIndex(nextIndex);
  };

  const renderItem = ({ item, index }) => {
    if (item.type === "image") {
      return (
        <Image
          source={{ uri: item.uri }}
          style={{ width, height: 300, resizeMode: "cover" }}
        />
      );
    } else if (item.type === "video") {
      return (
        <Video
          ref={(ref) => (videoRefs.current[index] = ref)}
          source={{ uri: item.uri }}
          style={{ width, height: 300 }}
          resizeMode="cover"
          paused={activeIndex !== index} // play only if active
          onEnd={() => handleVideoEnd(index)}
          muted
        />
      );
    }
    return null;
  };

  return (
    <View>
      <Carousel
        ref={carouselRef}
        loop
        width={width}
        height={300}
        autoPlay={true}
        autoPlayInterval={autoPlayInterval}
        data={carouselData}
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        renderItem={renderItem}
        onProgressChange={(currentIndex) => {
          setActiveIndex(currentIndex); // update active index so video plays
        }}
      />
    </View>
  );
};

export default HomeBanner;
