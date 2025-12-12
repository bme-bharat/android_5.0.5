import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import {
  Tabs,
  MaterialTabBar,
  useCurrentTabScrollY,
} from "react-native-collapsible-tab-view";
import Animated, {
  interpolate,
  Extrapolation,
  useAnimatedStyle,
} from "react-native-reanimated";
import YourForumListScreen from "../Forum/myForums";

const HEADER_HEIGHT = 260;
const MIN_HEADER_HEIGHT = 60;

/* ----------------------------------------------------------
   HEADER COMPONENT (hook must be inside tabs context)
----------------------------------------------------------- */
const ProfileHeader = () => {

  return (
    <Animated.View style={[styles.headerContainer]}>
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400" }}
        style={styles.avatar}
      />

      <Text style={styles.name}>Shwetha</Text>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>129</Text>
          <Text style={styles.statLabel}>Posts</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>8,142</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>320</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
      </View>
    </Animated.View>
  );
};

/* ----------------------------------------------------------
   CUSTOM TAB BAR WITH SCROLL-REVEAL USERNAME
----------------------------------------------------------- */
const ProfileTabBar = (props) => {

  return (

      <MaterialTabBar
        {...props}
        style={styles.tabBar}
        activeColor="#000"
        inactiveColor="#888"
        indicatorStyle={{ backgroundColor: "#000", height: 3 }}
        tabStyle={{ paddingVertical: 8 }}
        labelStyle={{ fontSize: 18, fontWeight: "600" }}
      />

  );
};

/* ----------------------------------------------------------
   MAIN SCREEN
----------------------------------------------------------- */
const UserProfileScreen = () => {
  return (
    <Tabs.Container

      renderHeader={() => <ProfileHeader />}
      renderTabBar={(props) => <ProfileTabBar {...props} />}
      revealHeaderOnScroll
    >
      {/* POSTS */}
      <Tabs.Tab name="Posts">
        <YourForumListScreen />
      </Tabs.Tab>

      {/* REELS */}
      <Tabs.Tab name="Reels">
        <Tabs.FlatList
          data={Array.from({ length: 20 })}
          renderItem={({ index }) => (
            <View style={styles.postItem}>
              <Text>Reel #{index + 1}</Text>
            </View>
          )}
          keyExtractor={(_, i) => i.toString()}
          overScrollMode="never"
          scrollEventThrottle={16}
        />
      </Tabs.Tab>
    </Tabs.Container>
  );
};

export default UserProfileScreen;

/* ----------------------------------------------------------
   STYLES
----------------------------------------------------------- */
const styles = StyleSheet.create({
  topBarTitle: {
    fontSize: 18,
    fontWeight: "700",
    alignSelf: "center",
    opacity: 0,
  },
  tabBar: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },
  headerContainer: {
    height: HEADER_HEIGHT,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    paddingTop: 25,
    borderBottomLeftRadius:10,
    borderBottomRightRadius:10,
  },
  avatar: {
    height: 100,
    width: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    marginTop: 20,
  },
  statBox: {
    alignItems: "center",
    marginHorizontal: 20,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 14,
    color: "#777",
  },
  postItem: {
    height: 120,
    backgroundColor: "#eee",
    margin: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});
