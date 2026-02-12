// hooks/useHideOnScroll.js
import React from "react";
import { Dimensions, Platform } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  runOnJS,
  withTiming,
} from "react-native-reanimated";


const { width } = Dimensions.get("window");

const HEADER_HEIGHT = width * 0.3;
const COLLAPSED_HEIGHT = 44 ;
const TOP_HEADER_HEIGHT = 44 ;
const BOTTOM_HEIGHT = 60;

const SHOW_THRESHOLD = 8; // small scroll threshold to hide top header
const DIRECTION_THRESHOLD = 0.5; // small delta to avoid jitter


export default function scrollAnimations() {
    
    const bottomTranslateY = useSharedValue(0);
     const scrollY = useSharedValue(0);
     const prevScrollY = useSharedValue(0); // track previous scroll position to detect direction
     const [barStyle, setBarStyle] = React.useState("light-content");
   
     // topHeaderVisible: 1 -> visible at top (scrollY <= SHOW_THRESHOLD OR scrolling up)
     // 0 -> hidden when scrolled down
     const topHeaderVisible = useSharedValue(1);
     const bottomVisible = useSharedValue(1);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {

      const y = event.contentOffset.y;
      const prev = prevScrollY.value;
      const dy = y - prev; // positive -> scrolling down, negative -> scrolling up

      scrollY.value = y;

      // Toggle status bar style based on scroll (optional)
      const shouldUseDark = y > SHOW_THRESHOLD;

      runOnJS(setBarStyle)(shouldUseDark ? "dark-content" : "light-content");

      // Always visible inside header image
      if (y < HEADER_HEIGHT - COLLAPSED_HEIGHT) {
        topHeaderVisible.value = withTiming(1, { duration: 180 });
      }
      else {
        // Only AFTER header collapsed → direction-based hide/show
        if (dy > DIRECTION_THRESHOLD && topHeaderVisible.value === 1) {
          topHeaderVisible.value = withTiming(0, { duration: 180 });
        }
        else if (dy < -DIRECTION_THRESHOLD && topHeaderVisible.value === 0) {
          topHeaderVisible.value = withTiming(1, { duration: 180 });
        }
      }

      if (dy > DIRECTION_THRESHOLD) {
        bottomVisible.value = withTiming(0, { duration: 180 });
      } else if (dy < -DIRECTION_THRESHOLD) {
        bottomVisible.value = withTiming(1, { duration: 180 });
      }

      // store current as previous for next frame
      prevScrollY.value = y;
    },
  });
      
  const toolbarBgStyle = useAnimatedStyle(() => {
    // fade from 0 → 1 as scroll moves from 0 → 40 (you can adjust)
    const opacity = interpolate(
      scrollY.value,
      [0, 40],
      [0, 1],
      Extrapolate.CLAMP
    );

    // white background with fade
    return {
     
      shadowOpacity: opacity * 0.1, // smooth fade-in shadow
    };
  });

  const headerStyle = useAnimatedStyle(() => {
    // topHeaderVisible.value will be animating between 0 and 1
    const v = topHeaderVisible.value;
    // height goes from 0 -> TOP_HEADER_HEIGHT
    const height = interpolate(v, [0, 1], [0, TOP_HEADER_HEIGHT], Extrapolate.CLAMP);
    const translateY = interpolate(v, [0, 1], [-8, 0], Extrapolate.CLAMP);
    const opacity = interpolate(v, [0, 1], [0, 1], Extrapolate.CLAMP);

    return {
      height,
      opacity,
      transform: [{ translateY }],
      overflow: "hidden",
      
    };
  });

  const bottomStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: bottomVisible.value
          ? withTiming(0, { duration: 200 })
          : withTiming(BOTTOM_HEIGHT, { duration: 200 }), // moves down
      },
    ],
  }));


    return { onScroll, headerStyle, bottomStyle, toolbarBgStyle, barStyle };
}
