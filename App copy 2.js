import React from "react";
import {
  View,
  Text,
  TextInput,
  StatusBar,
  StyleSheet,
  Platform,
  TouchableOpacity,
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

const HEADER_HEIGHT = 300;
const COLLAPSED_HEIGHT = 60;
const TOP_HEADER_HEIGHT = 56; // actual layout height of the top header row

const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? StatusBar.currentHeight || 24 : 44;

const HEADER_EXPANDED = HEADER_HEIGHT ;
const SHOW_THRESHOLD = 8; // small scroll threshold to hide top header

const App = () => {
  const scrollY = useSharedValue(0);
  const [barStyle, setBarStyle] = React.useState("light-content");

  // topHeaderVisible: 1 -> visible at top (scrollY <= SHOW_THRESHOLD)
  // 0 -> hidden when scrolled down
  const topHeaderVisible = useSharedValue(1);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      const y = event.contentOffset.y;
      scrollY.value = y;

      // Toggle status bar style based on scroll (optional)
      const shouldUseDark = y > SHOW_THRESHOLD;
      runOnJS(setBarStyle)(shouldUseDark ? "dark-content" : "light-content");

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
    const showWhite = scrollY.value > 1;
    return {
      backgroundColor: showWhite ? "white" : "transparent",
      elevation: showWhite ? 3 : 0,
      shadowOpacity: showWhite ? 0.08 : 0,
    };
  });

  // top header animation (collapse height + slide + fade)
  const topHeaderStyle = useAnimatedStyle(() => {
    // fade out fully by 80px scroll
    const opacity = interpolate(
      scrollY.value,
      [0, 80],
      [1, 0],
      Extrapolate.CLAMP
    );
  
    // height collapses smoothly
    const height = interpolate(
      scrollY.value,
      [0, 80],
      [TOP_HEADER_HEIGHT, 0],
      Extrapolate.CLAMP
    );
  
    // slight upward slide
    const translateY = interpolate(
      scrollY.value,
      [0, 80],
      [0, -8],
      Extrapolate.CLAMP
    );
  
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

        {/* SEARCH BAR (below top header) */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <TextInput
              placeholder="Search restaurants, dishes..."
              style={styles.searchInput}
              placeholderTextColor="#666"
            />
          </View>
        </View>
      </Animated.View>

      {/* Scrollable content */}
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        overScrollMode={"never"}
        contentContainerStyle={{ paddingTop: HEADER_EXPANDED }}
        snapToHeaderHeight={HEADER_HEIGHT}
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

// Styles
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
    borderRadius:18
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
    paddingVertical: 8,
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
