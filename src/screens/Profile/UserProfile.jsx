import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable,
} from "react-native";

import {
  Tabs,
  MaterialTabBar,
} from "react-native-collapsible-tab-view";

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";

import { useNavigation } from "@react-navigation/native";
import YourForumListScreen from "../Forum/myForums";

/* -------------------------------------------
    SVG ICONS
--------------------------------------------- */
import FeedIcon from "../../assets/svgIcons/quill.svg";
import ResourceIcon from "../../assets/svgIcons/upload.svg";
import JobIcon from "../../assets/svgIcons/jobs.svg";
import ProductIcon from "../../assets/svgIcons/products.svg";
import ServiceIcon from "../../assets/svgIcons/services.svg";
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import { colors, dimensions } from '../../assets/theme.jsx';

import YourResourcesList from "../Resources/MyResources";
import UserJobAppliedScreen from "../Job/UserJobAppliedScreen";
import { useSelector } from "react-redux";
import UserProfileCard from "./UserProfileCard";

const HEADER_HEIGHT = 260;

/* -------------------------------------------
    HEADER
--------------------------------------------- */
const ProfileHeader = () => {
  const navigation = useNavigation();
  const profile = useSelector(state => state.CompanyProfile.profile);

  const handleUpdate = () => {
    navigation.navigate('UserProfileUpdate', {
      profile,
      imageUrl: profile?.imageUrl,
    });
  };

  return (
    <View style={styles.headerContainer}>
      <UserProfileCard
        profile={profile}
        onEdit={handleUpdate}
        onNavigate={() => navigation.navigate('UserProfile')}

      />
    </View>
  );
};

/* -------------------------------------------
    CUSTOM TAB BAR
--------------------------------------------- */
const ProfileTabBar = (props) => {

  return (
      <MaterialTabBar
        {...props}
        style={styles.tabBar}
        activeColor="#000"
        inactiveColor="#888"
        indicatorStyle={{ backgroundColor: "#000", height: 3, borderTopLeftRadius:12, borderTopRightRadius:12 }}
        tabStyle={{ paddingVertical: 9 }}
        
        scrollEnabled={true}
        renderLabel={({ route, focused, color }) => (
          <Text style={{ fontSize: 16, fontWeight: '600', color }}>
            {route.name}  {/* keeps original casing */}
          </Text>
        )}
      />
 
  );
};

/* -------------------------------------------
    MAIN SCREEN
--------------------------------------------- */
const Profile = () => {
  const navigation = useNavigation();

  const [showOptions, setShowOptions] = useState(false);

  /* -------------------------------------------
      ANIMATION VALUES
  --------------------------------------------- */
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const optionsOpacity = useSharedValue(0);
  const optionsTranslate = useSharedValue(15);

  /* -------------------------------------------
      OPTIONS DATA WITH ICONS
  --------------------------------------------- */
  const actionOptions = [
    { label: "Forum", screen: "ForumPost", Icon: FeedIcon },
    // { label: "Post a Job", screen: "PostJob", Icon: JobIcon },
    { label: "Resource", screen: "ResourcesPost", Icon: ResourceIcon },
    // { label: "Add Product", screen: "AddProduct", Icon: ProductIcon },
    // { label: "Add Service", screen: "AddService", Icon: ServiceIcon },
  ];

  /* -------------------------------------------
      Animated Styles
  --------------------------------------------- */
  const plusStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const optionsStyle = useAnimatedStyle(() => ({
    opacity: optionsOpacity.value,
    transform: [{ translateY: optionsTranslate.value }],
  }));

  /* -------------------------------------------
      TOGGLE FAB
  --------------------------------------------- */
  const toggleOptions = () => {
    const visible = !showOptions;
    setShowOptions(visible);

    rotation.value = withTiming(visible ? 70 : 0, { duration: 250 });
    scale.value = withSpring(visible ? 1.22 : 1);

    optionsOpacity.value = withTiming(visible ? 1 : 0, { duration: 200 });
    optionsTranslate.value = withTiming(visible ? 0 : 15, {
      duration: 220,
      easing: Easing.out(Easing.ease),
    });
  };

  const closeOptions = () => {
    setShowOptions(false);
    rotation.value = withTiming(0);
    scale.value = withSpring(1);
    optionsOpacity.value = withTiming(0);
    optionsTranslate.value = withTiming(15);
  };

  const profile = useSelector(state => state.CompanyProfile.profile);

  const handleUpdate = () => {
    navigation.navigate('UserProfileUpdate', {
      profile,
      imageUrl: profile?.imageUrl,
    });
  };

  return (
    <View style={{ flex: 1 }}>
       <View style={styles.headerContainer1}>
        <TouchableOpacity style={styles.backButton}
          activeOpacity={1}
          onPress={() => navigation.goBack()}>
          <ArrowLeftIcon width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />


        </TouchableOpacity>
        <TouchableOpacity style={styles.circle}
        onPress={handleUpdate}
           activeOpacity={0.8}>
          <FeedIcon width={24} height={24} color={'#075cab'} />

          <Text style={styles.shareText}>Update</Text>
        </TouchableOpacity>
      </View>
      <Tabs.Container
        renderHeader={() => <ProfileHeader />}
        renderTabBar={(props) => <ProfileTabBar {...props} />}
        revealHeaderOnScroll
        headerHeight={HEADER_HEIGHT}      // total header height
        snapToHeaderHeight={HEADER_HEIGHT} // optional, fully collapsed snap height
        snapThreshold={0.3}               // snap if scroll passes 30% of header height
        initialTabName="Posts"
      
      >
        <Tabs.Tab name="Posts">
          <YourForumListScreen />
        </Tabs.Tab>

        <Tabs.Tab name="Jobs">
          <UserJobAppliedScreen />
        </Tabs.Tab>

        <Tabs.Tab name="Resources">

          <YourResourcesList />
        </Tabs.Tab>

        <Tabs.Tab name="Enquires">
          <Tabs.FlatList
            data={Array.from({ length: 20 })}
            renderItem={({ index }) => (
              <View style={styles.postItem}>
                <Text>Enquiry #{index + 1}</Text>
              </View>
            )}
            keyExtractor={(_, i) => i.toString()}
            overScrollMode="never"

          />
        </Tabs.Tab>

        <Tabs.Tab name="Products">
          <Tabs.FlatList
            data={Array.from({ length: 20 })}
            renderItem={({ index }) => (
              <View style={styles.postItem}>
                <Text>Product #{index + 1}</Text>
              </View>
            )}
            keyExtractor={(_, i) => i.toString()}
            overScrollMode="never"

          />
        </Tabs.Tab>

        <Tabs.Tab name="Services">
          <Tabs.FlatList
            data={Array.from({ length: 20 })}
            renderItem={({ index }) => (
              <View style={styles.postItem}>
                <Text>Service #{index + 1}</Text>
              </View>
            )}
            keyExtractor={(_, i) => i.toString()}
            overScrollMode="never"

          />
        </Tabs.Tab>
      </Tabs.Container>

      {/* -----------------------------------------
          TOUCH OUTSIDE
      ------------------------------------------- */}
      {showOptions && (
        <Pressable style={styles.overlay} onPress={closeOptions} />
      )}

      {/* -----------------------------------------
          OPTIONS POPUP
      ------------------------------------------- */}
      <Animated.View style={[styles.optionsBox, optionsStyle]}>
        {showOptions &&
          actionOptions.map((opt, i) => (
            <TouchableOpacity
              key={i}
              style={styles.optionRow}
              onPress={() => {
                closeOptions();
                navigation.navigate(opt.screen);
              }}
            >
              <Text style={styles.optionText}>{opt.label}</Text>
              <opt.Icon width={22} height={22} />
            </TouchableOpacity>
          ))}
      </Animated.View>


      {/* -----------------------------------------
          FLOATING ADD BUTTON
      ------------------------------------------- */}
      <TouchableOpacity style={styles.fabButton} onPress={toggleOptions}>
        <Animated.View style={[styles.addButton, plusStyle]}>
          <Text style={styles.plusText}>+</Text>
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

export default Profile;

/* -------------------------------------------
      STYLES
--------------------------------------------- */
const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderColor: "#ddd",
  },

  headerContainer: {
    // height: HEADER_HEIGHT,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    flex: 1,

  },

  headerContainer1: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    // elevation: 1,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 1 },
    // shadowOpacity: 0.1,
    // shadowRadius: 2,
    zIndex:999
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,

  },
  circle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,

  },

  shareText: {
    color: '#075cab',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
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

  fabButton: {
    position: "absolute",
    bottom: 35,
    right: 25,
    zIndex: 30,
  },

  addButton: {
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },

  plusText: {
    fontSize: 32,
    color: "white",
    marginTop: -2,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 15,
  },

  optionsBox: {
    position: "absolute",
    bottom: 110,
    right: 25,
    backgroundColor: "white",
    borderRadius: 14,
    paddingVertical: 7,
    paddingHorizontal: 10,
    width: 200,
    elevation: 10,
    zIndex: 40,
  },

  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

  optionText: {
    fontSize: 15,
    fontWeight: "500",
    flexShrink: 1,
  },

});
