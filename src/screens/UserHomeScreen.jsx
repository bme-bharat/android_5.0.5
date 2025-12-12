

import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { View, FlatList, Image, TouchableOpacity, Text, BackHandler, RefreshControl, Keyboard, StatusBar, ActivityIndicator, Dimensions, Platform } from 'react-native';

import { useNavigation, useFocusEffect, useScrollToTop, useNavigationState } from '@react-navigation/native';

import apiClient from './ApiClient';
import { useDispatch, useSelector } from 'react-redux';
import { updateCompanyProfile } from './Redux/MyProfile/CompanyProfile_Actions';
import { useNetwork } from './AppUtils/IdProvider';
import useFetchData, { fetchJobs, fetchLatestPosts, fetchProducts, fetchServices, fetchTrendingPosts } from './helperComponents/HomeScreenData';
import { useConnection } from './AppUtils/ConnectionProvider';
import { getSignedUrl, getTimeDisplay, getTimeDisplayForum, getTimeDisplayHome } from './helperComponents/signedUrls';
import AppStyles, { styles } from './AppUtils/AppStyles';
import { ForumPostBody } from './Forum/forumBody';
import { generateAvatarFromName } from './helperComponents/useInitialsAvatar';
import BottomNavigationBar from './AppUtils/BottomNavigationBar';
import Banner01 from './Banners/homeBanner';
import Banner02 from './Banners/homeBanner2';
import Banner03 from './Banners/homeBanner3';


import Notification from '../assets/svgIcons/notification.svg';
import Job from '../assets/svgIcons/jobs.svg';
import Fire from '../assets/svgIcons/fire.svg';
import Service from '../assets/svgIcons/services.svg';
import Product from '../assets/svgIcons/products.svg';
import Latest from '../assets/svgIcons/latest.svg';
import Name from '../assets/svgIcons/id-card.svg';
import Description from '../assets/svgIcons/description.svg';
import Company from '../assets/svgIcons/company.svg';
import Money from '../assets/svgIcons/money.svg';
import AnimatedTextSequence from './animations/AnimatedTextSequence';
import FastImage from "@d11/react-native-fast-image";
import Menu from "../assets/svgIcons/menu.svg";
import User from "../assets/svgIcons/user.svg";
import LinearGradient from 'react-native-linear-gradient';

import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  interpolate,
  Extrapolate,
  runOnJS,
  withTiming,
} from "react-native-reanimated";
import { colors, dimensions } from '../assets/theme';


const { width, height } = Dimensions.get("window");
const HEADER_HEIGHT = width * (10 / 16);
const COLLAPSED_HEIGHT = 60;
const TOP_HEADER_HEIGHT = 60;

const STATUS_BAR_HEIGHT =
  Platform.OS === "android" ? StatusBar.currentHeight || 24 : 44;


const SHOW_THRESHOLD = 8; // small scroll threshold to hide top header
const DIRECTION_THRESHOLD = 0.5; // small delta to avoid jitter

const UserSettingScreen = React.lazy(() => import('./Profile/UserSettingScreen'));
const ProductsList = React.lazy(() => import('./Products/ProductsList'));
const AllPosts = React.lazy(() => import('./Forum/Feed'));
const JobListScreen = React.lazy(() => import('./Job/JobListScreen'));



const sectionThemes = {
  latest: {
    icon: "🔥",
    gradient: [
      "rgb(211, 210, 210)",
      "rgba(122, 180, 224, 0.10)"
    ],
    shadow: "rgba(122,180,224,0.25)",
    textColor: "#003A70",
  },

  jobs: {
    icon: "💼",
    gradient: [
      "rgb(211, 210, 210)",
      "rgba(122, 180, 224, 0.10)"
    ],
    shadow: "rgba(74,146,209,0.25)",
    textColor: "#003A70",
  },

  trending: {
    icon: "📈",
    gradient: [
      "rgb(211, 210, 210)",
      "rgba(122, 180, 224, 0.10)"
    ],
    shadow: "rgba(168,210,238,0.25)",
    textColor: "#003A70",
  },

  products: {
    icon: "🛍️",
    gradient: [
      "rgb(211, 210, 210)",
      "rgba(122, 180, 224, 0.10)"
    ],
    shadow: "rgba(223,240,250,0.25)",
    textColor: "#003A70",
  },

  services: {
    icon: "🛠️",
    gradient: [
      "rgb(211, 210, 210)",
      "rgba(122, 180, 224, 0.10)"
    ],
    shadow: "rgba(30,111,190,0.25)",
    textColor: "#003A70",
  },

  default: {
    icon: "✨",
    gradient: [
      "rgb(211, 210, 210)",
      "rgba(122, 180, 224, 0.10)"
    ],
    shadow: "rgba(122,180,224,0.2)",
    textColor: "#003A70",
  },
};







const SectionWrapper = ({
  keyName,
  title,
  fetchDataFn,
  onVisible,
  childrenRenderer,
  placeholderHeight = height,
  isLast,  // NEW: Prop to know if this is the last rendered section
  onLoaded,
}) => {

  const isBanner = keyName?.startsWith("banner"); // 👈 EASY CHECK
  const theme = sectionThemes[keyName];
  const navigation = useNavigation();

  const [data, setData] = useState(fetchDataFn ? null : []);
  const [loading, setLoading] = useState(false);

  const navigationMap = [
    { key: "jobs", navigate: () => navigation.navigate("Jobs") },
    { key: "trending", navigate: () => navigation.navigate("Trending") },
    { key: "latest", navigate: () => navigation.navigate("Latest") },
    { key: "products", navigate: () => navigation.navigate("Products") },
    { key: "services", navigate: () => navigation.navigate("Services") },
  ];

  const seeMoreFn = navigationMap.find(n => keyName?.toLowerCase().includes(n.key))?.navigate;

  useEffect(() => {
    if (data !== null && isLast && onLoaded) {  // data is set (either [] for no fetch or actual data)
      onLoaded();
    }
  }, [data, isLast, onLoaded]);

  useEffect(() => {
    if (!fetchDataFn) return;
    if (!onVisible || data) return;

    let mounted = true;
    const load = async () => {
      setLoading(true);
      const res = await fetchDataFn();
      if (!mounted) return;

      setData(res?.jobs || res?.products || res?.services || res || []);
      setLoading(false);
    };

    load();
    return () => (mounted = false);
  }, [onVisible]);

  // =============================================
  // ⭐ IF BANNER → NO THEMES, NO HEADER, NO GRADIENT
  // =============================================
  if (isBanner) {
    return (
      <View style={{ marginBottom: 10 }}>
        {childrenRenderer(data)}
      </View>
    );
  }

  // =============================================
  // ⭐ NORMAL SECTION WITH THEME
  // =============================================
  return (
    <LinearGradient
      colors={theme.gradient}
      start={{ x: 0.5, y: 0 }}  // top center
      end={{ x: 0.5, y: 0.5 }}
      style={{
        borderRadius: 20,
        padding: 5,
        marginHorizontal: 5,
        marginBottom: 10,
        shadowColor: theme.shadow,
        shadowOpacity: 0.6,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
        elevation: 6,
        minHeight: data ? undefined : placeholderHeight,
        position: 'relative'
      }}
    >
      {/* HEADER */}
      {title && (
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 14, paddingHorizontal: 10, justifyContent: 'space-between' }}>
          <View style={{ flexDirection: "row", alignItems: "center", }}>
            <Text style={{ fontSize: 22, marginRight: 8 }}>{theme.icon}</Text>
            <Text style={{
              color: theme.textColor,
              fontSize: 16,
              fontWeight: "600",
              letterSpacing: 0.3,
            }}>
              {title}
            </Text>
          </View>
          {seeMoreFn && (
            <Text onPress={seeMoreFn} style={{
              color: theme.textColor,
              fontSize: 16,
              fontWeight: "600",
              letterSpacing: 0.3,
            }}>
              See more
            </Text>
          )}
        </View>
      )}

      {/* LOADING */}
      {loading && (
        <View style={{
          height: placeholderHeight - 90,
          borderRadius: 18,
          backgroundColor: "rgba(255,255,255,0.22)",
          overflow: "hidden",
        }}>

        </View>
      )}

      {childrenRenderer(data)}
    </LinearGradient>
  );
};







const tabNameMap = {
  Home3: "Home",
  ProductsList: "Products",
  Feed: "Feed",
  Jobs: "Jobs",
  Settings: "Settings",
};

const tabConfig = [
  { name: "Home", component: UserHomeScreen },
  { name: "Jobs", component: JobListScreen },
  { name: "Feed", component: AllPosts },
  { name: "Products", component: ProductsList },
  { name: "Settings", component: UserSettingScreen },
];


const UserHomeScreen = React.memo(() => {
  const { myId, myData } = useNetwork();

  const { isConnected } = useConnection();

  const currentRouteName = useNavigationState((state) => {
    const route = state.routes[state.index];

    return route.name;
  });
  const profile = useSelector(state => state.CompanyProfile.profile);

  const dispatch = useDispatch();

  const navigation = useNavigation();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const flatListRef = useRef(null);

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

  // Animated style for StatusBar-like background
  const statusBarBgStyle = useAnimatedStyle(() => {
    // fade from 0 → 1 as scroll moves from 0 → HEADER_HEIGHT (adjust as needed)
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      backgroundColor: `rgba(255,255,255,${opacity})`,
    };
  });

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    height: interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT],
      [HEADER_HEIGHT, COLLAPSED_HEIGHT + STATUS_BAR_HEIGHT],
      Extrapolate.CLAMP
    ),
  }));

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

  useFocusEffect(
    useCallback(() => {

      const fetchUnreadCount = async () => {
        try {
          const response = await apiClient.post('getUnreadNotificationCount', {
            command: 'getUnreadNotificationCount',
            user_id: myId,
          });

          if (response.status === 200) {
            setUnreadCount(response.data.count);
          }
        } catch (error) {
          console.error('Error fetching unread count:', error);
        }
      };

      fetchUnreadCount();
    }, [myId])
  );



  const navigateToDetails = (job) => {
    navigation.navigate("JobDetail", { post_id: job.post_id, post: job });
  };




  const renderSectionUI = (key, data) => {
    switch (key) {

      case "banner1":
        return <Banner02 />
      case "latest":
        return (
          <FlatList
            data={data}

            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.forum_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.articleCard}
                onPress={() => navigation.navigate("Comment", { forum_id: item.forum_id })}
              >
                <View style={[styles.articleCardHeader, { backgroundColor: '#fff' }]}>
                  {/* Vertical stack for badge, image, name */}
                  <View style={{ marginTop: 5 }}>

                    <View style={[styles.authorRow]}>
                      {item?.authorImage ? (
                        <Image
                          source={{ uri: item.authorImage }}
                          style={styles.authorImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <View
                          style={[
                            styles.authorImage,
                            {
                              backgroundColor: item.avatar?.backgroundColor || '#ccc',
                              justifyContent: 'center',
                              alignItems: 'center',
                            }
                          ]}
                        >
                          <Text style={{ color: item.avatar?.textColor || '#fff', fontWeight: 'bold', fontSize: 24 }}>
                            {item.avatar?.initials}
                          </Text>
                        </View>
                      )}


                      <View style={styles.authorInfo}>
                        <Text
                          style={styles.authorName}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.author || 'No Name'}
                        </Text>
                        <Text style={styles.badgeText}>{item.author_category || ''}</Text>

                        <Text style={styles.articleTime}>{getTimeDisplayForum(item.posted_on)}</Text>
                      </View>
                    </View>

                  </View>

                  {item.mediaUrl && (

                    <Image
                      source={{ uri: item.mediaUrl }}
                      style={styles.articleMedia}
                      resizeMode="cover"
                    />

                  )}

                </View>


                <ForumPostBody
                  html={item.forum_body}
                  forumId={item?.forum_id}
                  numberOfLines={4}
                />
              </TouchableOpacity>
            )}

          />
        );

      case "banner2":
        return <Banner02 />

      case "jobs":
        return (
          <FlatList
            data={data}
            keyExtractor={(item) => item.post_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => navigateToDetails(item)}
                activeOpacity={0.85}
                style={styles.eduCard}
              >
                <View style={styles.eduCardLeft}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.eduImage} />
                  ) : (
                    <View style={styles.cardImage1}>
                      <Text style={styles.avatarText}>{item.companyAvatar.initials}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.eduCardRight}>
                  <Text numberOfLines={1} ellipsizeMode="tail" style={styles.eduTitle}>
                    {item.job_title || "Job Title"}
                  </Text>

                  <Text numberOfLines={1} style={styles.eduSubText}>
                    <Text style={styles.label}>Experience: </Text>
                    {item.experience_required?.slice(0, 15) || "N/A"}
                  </Text>

                  <Text numberOfLines={1} style={styles.eduSubText}>
                    <Text style={styles.label}>Package: </Text>
                    {item.Package || 'Not disclosed'}
                  </Text>

                  <Text numberOfLines={1} style={styles.eduSubText}>
                    <Text style={styles.label}>Location: </Text>
                    {item.working_location || 'Not disclosed'}
                  </Text>

                  <Text numberOfLines={1} style={[styles.eduSubText, { alignSelf: 'flex-end', fontSize: 11, fontWeight: '300', color: colors.text_secondary, }]}>
                    {getTimeDisplayHome(item.job_post_created_on) || 'Not disclosed'}
                  </Text>


                </View>
              </TouchableOpacity>
            )}
          />

        );


      case "trending":
        return (
          <FlatList
            data={data}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.forum_id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.postCard}
                onPress={() => navigation.navigate("Comment", { forum_id: item.forum_id })}
              >
                {/* HEADER */}
                <View style={styles.postHeader}>
                  {item.authorImage ? (
                    <Image source={{ uri: item.authorImage }} style={styles.postAvatar} />
                  ) : (
                    <View
                      style={[
                        styles.authorImage,
                        {
                          backgroundColor: item.avatar?.backgroundColor || '#ccc',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }
                      ]}
                    >
                      <Text style={{ color: item.avatar?.textColor || '#fff', fontWeight: 'bold', fontSize: 24 }}>
                        {item.avatar?.initials}
                      </Text>
                    </View>
                  )}

                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.postAuthor} numberOfLines={1}>
                      {item.author}
                    </Text>
                    <Text style={styles.postCategory}>{item.author_category}</Text>
                    <Text style={styles.postTime}>
                      {getTimeDisplayForum(item.posted_on)}
                    </Text>
                  </View>
                </View>

                {/* IMAGE */}
                {item.mediaUrl && (
                  <Image source={{ uri: item.mediaUrl }} style={styles.postImage} />
                )}

                {/* BODY */}
                <ForumPostBody
                  html={item.forum_body}
                  forumId={item.forum_id}
                  numberOfLines={4}
                />
              </TouchableOpacity>
            )}

          />
        );

      // case "banner3":
      //   return <Banner03 />

      case "products":
        return (
          <FlatList
            data={data}

            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.product_id.toString()}
            numColumns={2}
            contentContainerStyle={styles.flatListContainer}
            columnWrapperStyle={styles.columnWrapper}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card5}
                activeOpacity={1}
                onPress={() => handleAddProduct(item)}
              >


                <Image source={{ uri: item.image }} style={{ width: 100, height: 100, alignSelf:'center' }} />

                <View style={styles.cardContent4}>
                  <View style={styles.cardTitleRow}>
                    <Text numberOfLines={1} style={styles.eduTitle}>{item.title || ' '}
                    </Text>
                  </View>
                  <View style={styles.cardTitleRow}>
                    <Description width={dimensions.icon.small} height={dimensions.icon.small} color={colors.gray} />
                    <Text style={styles.rowText} numberOfLines={1}>{item.description || 'Not specified'}</Text>
                  </View>

                  <View style={styles.cardTitleRow}>
                    <Company width={dimensions.icon.small} height={dimensions.icon.small} color={colors.gray} />
                    <Text style={styles.rowText} numberOfLines={1}>{item.company_name || 'Not specified'}</Text>
                  </View>

                  <View style={styles.cardTitleRow}>
                    <Money width={dimensions.icon.small} height={dimensions.icon.small} color={colors.gray} />
                    <Text style={styles.rowText} numberOfLines={1}>
                      {(item.price ?? '').toString().trim() !== '' ? item.price : 'Not specified'}
                    </Text>
                  </View>

                </View>

              </TouchableOpacity>
            )}
          />
        );

      case "services":
        return (
          <FlatList
            data={data}

            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.service_id.toString()}
            numColumns={2}
            contentContainerStyle={styles.flatListContainer}
            columnWrapperStyle={styles.columnWrapper}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.card5}
                activeOpacity={1}
                onPress={() => handleAddservice(item)}
              >


                <Image source={{ uri: item.image }} style={{ width: 100, height: 100, alignSelf:'center' }} />
                <View style={styles.cardContent4}>
                  <View style={styles.cardTitleRow}>
                    <Text numberOfLines={1} style={styles.eduTitle}>{item.title || ' '}
                    </Text>
                  </View>
                  <View style={styles.cardTitleRow}>
                    <Description width={dimensions.icon.small} height={dimensions.icon.small} color={colors.gray} />
                    <Text style={styles.rowText} numberOfLines={1}>{item.description || 'Not specified'}</Text>
                  </View>

                  <View style={styles.cardTitleRow}>
                    <Company width={dimensions.icon.small} height={dimensions.icon.small} color={colors.gray} />
                    <Text style={styles.rowText} numberOfLines={1}>{item.company_name || 'Not specified'}</Text>
                  </View>

                  <View style={styles.cardTitleRow}>
                    <Money width={dimensions.icon.small} height={dimensions.icon.small} color={colors.gray} />
                    <Text style={styles.rowText} numberOfLines={1}>
                      {(item.price ?? '').toString().trim() !== '' ? item.price : 'Not specified'}
                    </Text>
                  </View>

                </View>

              </TouchableOpacity>
            )}
          />
        );

      default:
        return null;
    }
  };









  const handleAddservice = (service) => {

    navigation.navigate('ServiceDetails', { service_id: service.service_id, company_id: service.company_id });

  };

  const handleAddProduct = (product) => {

    navigation.navigate('ProductDetails', { product_id: product.product_id, company_id: product.company_id });

  };


  const fetchProfile = async () => {
    try {
      const requestData = {
        command: 'getUserDetails',
        user_id: myId,
      };

      const response = await apiClient.post('/getUserDetails', requestData);

      if (response.data.status === 'success') {
        const profileData = response.data.status_message;

        // Initialize profile data with avatar generation
        const updatedProfile = { ...profileData };

        // Only try to get signed URL if fileKey exists
        if (profileData.fileKey) {
          try {
            const res = await getSignedUrl('profileImage', profileData.fileKey);
            updatedProfile.imageUrl = res?.profileImage ?? null;
          } catch (err) {
            updatedProfile.imageUrl = null;
          }
        } else {
          updatedProfile.imageUrl = null;
        }

        // Generate avatar if no image URL is available
        if (!updatedProfile.imageUrl) {
          const fullName = `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim();
          if (fullName) {
            updatedProfile.companyAvatar = generateAvatarFromName(fullName);
          }
        }

        dispatch(updateCompanyProfile(updatedProfile));

      } else {
        // Handle case when API doesn't return success
        dispatch(updateCompanyProfile({
          imageUrl: null,
          companyAvatar: generateAvatarFromName('') // Default avatar
        }));
      }
    } catch (error) {
      // Handle any errors by setting default values
      dispatch(updateCompanyProfile({
        imageUrl: null,
        companyAvatar: generateAvatarFromName('') // Default avatar
      }));
    } finally {

    }
  };


  useEffect(() => {
    fetchProfile();
  }, [myId]);

  const handleProfile = () => {
    if (!isConnected) {

      return;
    }
    navigation.navigate("Settings");
  };



  const handleMenuPress = () => {
    if (!isConnected) {

      return;
    }
    const parentNavigation = navigation.getParent();
    if (parentNavigation?.openDrawer) {
      parentNavigation.openDrawer();
    }
  };




  const [visibleMap, setVisibleMap] = useState({});

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 10, // must see 40%
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    const newFlags = {};
    viewableItems.forEach((v) => (newFlags[v.item.key] = true));
    setVisibleMap((prev) => ({ ...prev, ...newFlags }));
  }).current;


  // Register fetch functions
  const sections = [
    { key: "banner1", title: "Banner" },
    { key: "latest", title: "Latest Posts", fetchFn: fetchLatestPosts },
    { key: "banner2", title: "Banner" },
    { key: "jobs", title: "Jobs", fetchFn: fetchJobs },
    { key: "trending", title: "Trending", fetchFn: fetchTrendingPosts },
    { key: "banner3", title: "Banner" },
    { key: "products", title: "Products", fetchFn: fetchProducts },
    { key: "services", title: "Services", fetchFn: fetchServices },
  ];


  const [loadedUpTo, setLoadedUpTo] = useState(0); // Index in sections array
  // NEW: Dynamically slice sections based on loadedUpTo (only show up to loadedUpTo + 1)
  const currentSections = sections.slice(0, loadedUpTo + 1);

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

      // ✅ Correct cleanup
      return () => subscription.remove();
    }, [])
  );


  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);

      // Reset lazy loading
      setLoadedUpTo(0);

      // Reset visibility map so that sections load again
      setVisibleMap({});

      // OPTIONAL: scroll to top
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });

      // Re-fetch all sections that have fetchFn
      for (let sec of sections) {
        if (sec.fetchFn) {
          try {
            await sec.fetchFn();
          } catch (e) { }
        }
      }
    } catch (e) {
      console.error("Refresh failed", e);
    } finally {
      setRefreshing(false);
    }
  }, []);


  return (
    <>
      <StatusBar translucent backgroundColor="transparent" barStyle={'dark-content'} />



      <Animated.View style={[styles.toolbar, toolbarBgStyle]}>
        {/* TOP HEADER (menu | username+category | avatar) */}
        <Animated.View style={[styles.topHeader, topHeaderStyle]}>
          {/* Left: menu */}
          <TouchableOpacity style={{ padding: 10 }} onPress={handleMenuPress}>
            <Menu
              width={dimensions.icon.minlarge}
              height={dimensions.icon.minlarge}
              color={colors.text_primary}
            />
          </TouchableOpacity>

          {/* Center: username + category */}
          <View style={styles.userInfo}>
            <Text numberOfLines={1} style={styles.userName}>
              Hi {profile?.first_name}
            </Text>

          </View>


          <TouchableOpacity
            style={styles.notificationContainer}
            onPress={() => navigation.navigate('AllNotification', { userId: myId })}
          >
            <Notification width={dimensions.icon.minlarge} height={dimensions.icon.minlarge} color={colors.text_primary} />

            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Right: avatar */}
          <TouchableOpacity style={styles.iconTouch} onPress={handleProfile}>
            {profile?.imageUrl ? (
              <FastImage
                source={{ uri: profile?.imageUrl, }}
                style={styles.detailImage}
                resizeMode='contain'
                onError={() => { }}
              />
            ) : (
              <View style={[styles.avatarContainer, { backgroundColor: profile?.companyAvatar?.backgroundColor }]}>
                <Text style={[styles.avatarText, { color: profile?.companyAvatar?.textColor }]}>
                  {profile?.companyAvatar?.initials}
                </Text>
              </View>
            )}
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

      <Animated.FlatList
        showsVerticalScrollIndicator={false}
        ref={flatListRef}
        data={currentSections}
        keyExtractor={(item) => item.key}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        onScroll={onScroll}
        scrollEventThrottle={16}
        overScrollMode={"never"}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.text_primary}
            colors={[colors.text_primary]}
            progressViewOffset={STATUS_BAR_HEIGHT}
          />
        }
        ListHeaderComponent={

          <Animated.View style={[styles.header, { height: HEADER_HEIGHT }]}>
            <Banner01 />
          </Animated.View>


        }

        renderItem={({ item, index }) => {
          const isLast = index === currentSections.length - 1;  // NEW: Check if this is the last rendered section

          // Lazy Sections
          return (
            <SectionWrapper
              keyName={item.key}
              title={item.title}
              fetchDataFn={item.fetchFn}
              Icon={item.Icon}
              onVisible={visibleMap[item.key]}
              placeholderHeight={height} // IMPORTANT
              isLast={isLast}  // NEW: Pass whether this is the last section
              onLoaded={() => {  // NEW: Callback to unlock the next section
                setLoadedUpTo((prev) => (prev < sections.length - 1 ? prev + 1 : prev));
              }}

              childrenRenderer={(data) => renderSectionUI(item.key, data)}
            />
          );
        }}
        ListFooterComponent={<View style={{ height: 100 }} />}
      />

      <BottomNavigationBar
        tabs={tabConfig}
        currentRouteName={currentRouteName}
        navigation={navigation}
        flatListRef={flatListRef}
        handleRefresh={handleRefresh}
        tabNameMap={tabNameMap}

      />


    </>
  );

});



export default UserHomeScreen;

