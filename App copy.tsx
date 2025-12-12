import React from "react";
import {
  View,
  Text,
  TextInput,
  StatusBar,
  StyleSheet,
  Platform,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  runOnJS,
  withTiming,
} from "react-native-reanimated";
import FastImage from "@d11/react-native-fast-image";
import Menu from "./src/assets/svgIcons/menu.svg";
import User from "./src/assets/svgIcons/user.svg";
import { colors, dimensions } from "./src/assets/theme";

const HEADER_HEIGHT = 320;
const COLLAPSED_HEIGHT = 60;
const TOP_HEADER_HEIGHT = 60; // actual layout height of the top header row

const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? StatusBar.currentHeight || 24 : 44;

const HEADER_EXPANDED = HEADER_HEIGHT;
const SHOW_THRESHOLD = 8; // small scroll threshold to hide top header
const DIRECTION_THRESHOLD = 0.5; // small delta to avoid jitter

const App = () => {
  const scrollY = useSharedValue(0);
  const prevScrollY = useSharedValue(0); // track previous scroll position to detect direction
  const [barStyle, setBarStyle] = React.useState("light-content");

  // topHeaderVisible: 1 -> visible at top (scrollY <= SHOW_THRESHOLD OR scrolling up)
  // 0 -> hidden when scrolled down
  const topHeaderVisible = useSharedValue(1);

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

      // store current as previous for next frame
      prevScrollY.value = y;
    },
  });

  // Header animation (height)
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [HEADER_EXPANDED, COLLAPSED_HEIGHT + STATUS_BAR_HEIGHT],
      Extrapolate.CLAMP
    ),
  }));

  // Toolbar background (transparent -> white)
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
      backgroundColor: "rgba(255,255,255," + opacity + ")",
      shadowOpacity: opacity * 0.1, // smooth fade-in shadow
    };
  });


  // top header animation (collapse height + slide + fade)
  const topHeaderStyle = useAnimatedStyle(() => {
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

  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle={barStyle} />

      {/* Sticky Toolbar (contains top header above search + search bar) */}
      <Animated.View style={[styles.toolbar, toolbarBgStyle]}>
        {/* TOP HEADER (menu | username+category | avatar) */}
        <Animated.View style={[styles.topHeader, topHeaderStyle]}>
          {/* Left: menu */}
          <TouchableOpacity style={styles.iconTouch}>
            <Menu
              width={dimensions.icon.medium}
              height={dimensions.icon.medium}
              color={colors.text_primary}
            />
          </TouchableOpacity>

          {/* Center: username + category */}
          <View style={styles.userInfo}>
            <Text numberOfLines={1} style={styles.userName}>
              John Doe
            </Text>
            <Text numberOfLines={1} style={styles.userCategory}>
              Premium • Restaurateur
            </Text>
          </View>

          {/* Right: avatar */}
          <TouchableOpacity style={styles.iconTouch}>
            <User
              width={dimensions.icon.medium}
              height={dimensions.icon.medium}
              color={colors.text_primary}
            />
          </TouchableOpacity>

        </Animated.View>

        {/* <Animated.View style={[styles.searchRow, topHeaderStyle]}>
          <View style={styles.searchBar}>
            <TextInput
              placeholder="Search restaurants, dishes..."
              style={styles.searchInput}
              placeholderTextColor="#666"
            />
          </View>
        </Animated.View> */}

      </Animated.View>

      {/* Scrollable content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        overScrollMode={"never"}
        contentContainerStyle={{ paddingTop: HEADER_EXPANDED }}
      >
        {/* Header image */}
        <Animated.View style={[styles.header, ]}>
          <FastImage
            source={require("./src/images/homepage/design.gif")}
            style={styles.headerImage}
            resizeMode={FastImage.resizeMode.cover}
          />
        </Animated.View>

        {/* Dummy content */}
        <View style={{ padding: 16 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <View key={i} style={styles.card} />
          ))}
        </View>
      </Animated.ScrollView>
    </>
  );
};

export default App;

// Styles (unchanged)
const styles = StyleSheet.create({
  header: {
    width: "100%",
    overflow: "hidden",
    position: "absolute",
    top: 0,
    left: 0,
  },
  headerImage: {
    width: "100%",
    height: HEADER_HEIGHT,
    borderRadius: 18
  },

  // Toolbar container
  toolbar: {
    position: "absolute",
    top: 0,
    width: "100%",
    paddingTop: STATUS_BAR_HEIGHT,
    zIndex: 50,
    paddingHorizontal: 16,
    // height will be dynamic: topHeader (animated) + searchRow
    justifyContent: "flex-start",
  },

  // Top header row (above the search bar)
  topHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    // IMPORTANT: don't set a fixed height here — it's animated
    paddingHorizontal: 2,
  },

  iconTouch: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  iconImage: {
    width: 22,
    height: 22,
  },
  avatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },

  // center user info (username + category)
  userInfo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111",
  },
  userCategory: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },

  // Search row (below the top header)
  searchRow: {
    width: "100%",
    paddingBottom: 10,
  },
  searchBar: {
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 2,
    marginTop: 4,
  },
  searchInput: {
    fontSize: 16,
  },

  card: {
    height: 120,
    backgroundColor: "#eee",
    borderRadius: 16,
    marginBottom: 16,
  },
});
