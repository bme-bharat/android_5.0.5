

import React, { useRef, useState, useEffect, useCallback, memo } from 'react';
import { View, FlatList, Image, TouchableOpacity, Text, BackHandler, RefreshControl, Keyboard, StatusBar, ActivityIndicator, Dimensions, Platform } from 'react-native';

import { useNavigation, useFocusEffect, useScrollToTop, useNavigationState } from '@react-navigation/native';

import apiClient from './ApiClient';
import { useDispatch, useSelector } from 'react-redux';
import { updateCompanyProfile } from './Redux/MyProfile/CompanyProfile_Actions';
import { useNetwork } from './AppUtils/IdProvider';
import { fetchJobs, fetchLatestPosts, fetchProducts, fetchServices, fetchTrendingPosts } from './helperComponents/HomeScreenData';
import { useConnection } from './AppUtils/ConnectionProvider';
import { getSignedUrl, getTimeDisplay, getTimeDisplayForum, getTimeDisplayHome } from './helperComponents/signedUrls';
import { styles } from './AppUtils/AppStyles';
import { ForumPostBody } from './Forum/forumBody';
import Banner01 from './Banners/homeBanner';
import Banner02 from './Banners/MiddleBanner';
import Banner03 from './Banners/LastBanner';


import Notification from '../assets/svgIcons/notification.svg';
import Description from '../assets/svgIcons/description.svg';
import Company from '../assets/svgIcons/company.svg';
import Money from '../assets/svgIcons/money.svg';
import AnimatedTextSequence from './animations/AnimatedTextSequence';
import FastImage from "@d11/react-native-fast-image";
import Menu from "../assets/svgIcons/menu.svg";
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
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { Badge } from 'react-native-paper';
import Avatar from './helperComponents/Avatar';
import Video from 'react-native-video';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import SCREENS from '../navigation/screens';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


const { width, height } = Dimensions.get("window");
const HEADER_HEIGHT = width * (10 / 16);
const COLLAPSED_HEIGHT = 60;
const TOP_HEADER_HEIGHT = 60;

const SHOW_THRESHOLD = 8; // small scroll threshold to hide top header
const DIRECTION_THRESHOLD = 0.5; // small delta to avoid jitter


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
  placeholderHeight = height - 44,
  isLast,  // NEW: Prop to know if this is the last rendered section
  onLoaded,
}) => {

  const isBanner = keyName?.startsWith("banner"); // 👈 EASY CHECK
  const theme = sectionThemes[keyName];
  const navigation = useNavigation();

  const [data, setData] = useState(fetchDataFn ? null : []);
  const [loading, setLoading] = useState(false);

  const navigationMap = [
    { key: "jobs", navigate: () => navigation.navigate(SCREENS.JOB) },
    { key: "trending", navigate: () => navigation.navigate('Trending') }, // trending tab
    { key: "latest", navigate: () => navigation.navigate('Latest') },   // latest tab
    { key: "products", navigate: () => navigation.navigate(SCREENS.PRODUCTS) },
    { key: "services", navigate: () => navigation.navigate(SCREENS.SERVICES) }, // if it's a drawer screen
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
      <View style={{ marginBottom: 5, }}>
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
        marginBottom: 5,
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
            <Text style={{ fontSize: 26, marginRight: 8 }}>{theme.icon}</Text>
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


const CompanyHomeScreen = React.memo(() => {
  const { myId, myData } = useNetwork();
  const { isConnected } = useConnection();
  const currentRouteName = useNavigationState((state) => {
    const route = state.routes[state.index];

    return route.name;
  });
  const profile = useSelector(state => state.CompanyProfile.profile);
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();

  const navigation = useNavigation();
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const flatListRef = useRef(null);

  const scrollY = useSharedValue(0);
  const prevScrollY = useSharedValue(0); // track previous scroll position to detect direction
  const [barStyle, setBarStyle] = React.useState("dark-content");

  // topHeaderVisible: 1 -> visible at top (scrollY <= SHOW_THRESHOLD OR scrolling up)
  // 0 -> hidden when scrolled down
  const topHeaderVisible = useSharedValue(1);

  const isTabRefreshingRef = useRef(false);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('tabPress', (e) => {
      if (!navigation.isFocused()) return;

      e.preventDefault();

      if (isTabRefreshingRef.current) return;
      isTabRefreshingRef.current = true;

      console.log('tab pressed again → scroll to top → refresh');

      // 1️⃣ Scroll to top
      flatListRef.current?.scrollToOffset({
        offset: 0,
        animated: true,
      });

      // 2️⃣ Refresh AFTER scroll is scheduled
      requestAnimationFrame(() => {
        Promise.resolve(handleRefresh()).finally(() => {
          isTabRefreshingRef.current = false;
        });
      });
    });

    return unsubscribe;
  }, [navigation, handleRefresh]);

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
        return <Banner02 bannerId={'adban01'} onScroll={onScroll} />
      case "trending":
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


                      <Avatar
                        imageUrl={item?.authorImage}
                        name={item.author}
                        size={40}
                      />
                      <View style={{ marginLeft: 10 }}>
                        <Text
                          style={styles.authorName}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.author}
                        </Text>
                        <Text style={styles.badgeText} numberOfLines={1}
                          ellipsizeMode="tail">{item.author_category || ''}</Text>

                        <Text style={styles.articleTime}>{getTimeDisplayForum(item.posted_on)}</Text>
                      </View>
                    </View>

                  </View>

                  {item.mediaUrl && (
                    item?.extraData?.type?.startsWith('video') ? (
                      < View style={styles.articleMedia}>
                        <Video
                          source={{ uri: item.mediaUrl }}
                          style={{ width: '100%', height: '100%', backgroundColor: '#fff' }}
                          resizeMode="cover"
                          paused={true}
                          muted={true}
                          repeat={false}
                          controls={false}
                        />
                        <FastImage
                          source={require('../images/homepage/PlayIcon.png')}
                          style={styles.playIcon}
                          resizeMode="contain" />
                      </View>
                    ) : (
                      <Image
                        source={{ uri: item.mediaUrl }}
                        style={styles.articleMedia}
                        resizeMode="cover"
                      />
                    )
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
        return <Banner03 bannerId={'adban02'} />

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

                  <Avatar
                    imageUrl={item?.image}
                    name={item?.company_name}
                    size={100}
                    radius={8}
                  />
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


      case "latest":
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

                  <Avatar
                    imageUrl={item?.authorImage}
                    name={item.author}
                    size={40}
                  />
                  <View style={{ marginLeft: 10, flex: 1 }}>
                    <Text style={styles.postAuthor} numberOfLines={1}>
                      {item.author}
                    </Text>
                    <Text style={styles.postCategory}>{item.author_category}</Text>
                    <Text style={styles.postTime}>
                      {getTimeDisplayForum(item.posted_on)}
                    </Text>
                  </View>
                </View>

                {item.mediaUrl && (
                  item?.extraData?.type?.startsWith('video') ? (
                    < View style={styles.postImage}>
                      <Video
                        source={{ uri: item.mediaUrl }}
                        style={{ width: '100%', height: '100%', backgroundColor: '#fff' }}
                        resizeMode="cover"
                        paused={true}
                        muted={true}
                        repeat={false}
                        controls={false}
                      />
                      <FastImage
                        source={require('../images/homepage/PlayIcon.png')}
                        style={styles.playIcon}
                        resizeMode="contain" />
                    </View>
                  ) : (
                    <Image
                      source={{ uri: item.mediaUrl }}
                      style={styles.postImage}
                      resizeMode="cover"
                    />
                  )
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


                <Image source={{ uri: item.image }} style={{ width: 100, height: 100, alignSelf: 'center' }} />

                <View style={styles.cardContent4}>

                  <Text numberOfLines={1} style={styles.eduTitle}>{item.title || ' '}
                  </Text>

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


                <Image source={{ uri: item.image }} style={{ width: 100, height: 100, alignSelf: 'center' }} />
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







  const allJobs = () => {
    navigation.navigate('Jobs');
  };
  const allPosts = () => {
    navigation.navigate('Feed');
  };

  const goToTrending = () => {
    navigation.navigate('Trending');
  };

  const goToLatest = () => {
    navigation.navigate('Latest');
  };

  const allProducts = () => {
    navigation.navigate('Products');
  };

  const allServices = () => {
    navigation.navigate('Services');
  };

  const handleAddservice = (service) => {

    navigation.navigate('ServiceDetails', { service_id: service.service_id, company_id: service.company_id });

  };

  const handleAddProduct = (product) => {

    navigation.navigate('ProductDetails', { product_id: product.product_id, company_id: product.company_id });

  };


  const fetchProfile = async () => {
    try {
      const response = await apiClient.post('/getCompanyDetails', {
        command: 'getCompanyDetails',
        company_id: myId,
      });

      // ❌ No retry for logical API failures
      if (response.data.status !== 'success') {
        console.warn('API returned error:', response.data);
        return;
      }

      const profileData = { ...response.data.status_message };

      // Profile image
      if (profileData.fileKey?.trim()) {
        try {
          const res = await getSignedUrl('profileImage', profileData.fileKey);
          profileData.imageUrl = res?.profileImage ?? null;
        } catch {
          profileData.imageUrl = null;
        }
      } else {
        profileData.imageUrl = null;
      }

      // Brochure file
      if (profileData.brochureKey?.trim()) {
        try {
          const brochureRes = await getSignedUrl(
            'brochureFile',
            profileData.brochureKey
          );
          profileData.brochureUrl =
            brochureRes?.[profileData.brochureKey] ?? null;
        } catch {
          profileData.brochureUrl = null;
        }
      } else {
        profileData.brochureUrl = null;
      }

      dispatch(updateCompanyProfile(profileData));
    } catch (err) {
      // ❌ JS bugs / API bugs should NOT retry endlessly
      console.error('fetchProfile failed:', err);
    }
  };


  useEffect(() => {
    fetchProfile();
  }, [myId]);


  const handleProfile = () => {
    if (!isConnected) {

      return;
    }
    navigation.navigate("CompanyProfile");
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
    { key: "trending", title: "Trending", fetchFn: fetchTrendingPosts },

    { key: "banner2", title: "Banner" },
    { key: "jobs", title: "Jobs", fetchFn: fetchJobs },
    { key: "latest", title: "Latest Posts", fetchFn: fetchLatestPosts },

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
      <Animated.View style={[styles.toolbar, toolbarBgStyle, { paddingTop: insets.top }]}>
        {/* TOP HEADER (menu | username+category | avatar) */}
        <Animated.View style={[styles.topHeader, topHeaderStyle]}>
          {/* Left: menu */}
          <TouchableOpacity style={{ padding: 10 }} onPress={handleMenuPress}>
            <MaterialIcons name='menu' size={dimensions.icon.large} color={'#000'} />
          </TouchableOpacity>

          {/* Center: username + category */}
          <View style={styles.userInfo}>
            <Text numberOfLines={1} style={styles.userName}>
              Hi {profile?.company_name}
            </Text>

          </View>


          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.notificationContainer}
            onPress={() => navigation.navigate('AllNotification', { userId: myId })}
          >
            <Notification width={dimensions.icon.minlarge} height={dimensions.icon.minlarge} color={colors.text_primary} />
            {unreadCount > 0 && (
              <Badge style={{ position: 'absolute' }}>{unreadCount}</Badge>
            )}
          </TouchableOpacity>

        </Animated.View>

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
            progressViewOffset={insets?.top}
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
              isLast={isLast}  // NEW: Pass whether this is the last section
              onLoaded={() => {  // NEW: Callback to unlock the next section
                setLoadedUpTo((prev) => (prev < sections.length - 1 ? prev + 1 : prev));
              }}

              childrenRenderer={(data) => renderSectionUI(item.key, data)}
            />
          );
        }}
      />

      {/* <BottomNavigationBar
        tabs={tabConfig}
        currentRouteName={currentRouteName}
        navigation={navigation}
        flatListRef={flatListRef}
        handleRefresh={handleRefresh}
        tabNameMap={tabNameMap}

      /> */}


    </>
  );

});



export default CompanyHomeScreen;

