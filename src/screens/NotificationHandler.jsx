import React, { useEffect, useRef, useState } from 'react';
import {
  AppState,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,

} from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  onMessage,
  getInitialNotification,
  onNotificationOpenedApp,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import notifee, { EventType } from '@notifee/react-native';
import { navigationRef } from './../../App';
import { CommonActions } from '@react-navigation/native';
import { useNetwork } from './AppUtils/IdProvider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const NotificationHandler = () => {
  const notificationListener = useRef(null);
  const insets = useSafeAreaInsets();

  const [appState, setAppState] = useState(AppState.currentState);
  const [inAppNotification, setInAppNotification] = useState(null);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const timeoutRef = useRef(null);

  const getStoredUserTypeAndId = async () => {
    const keys = ['CompanyUserData', 'normalUserData', 'AdminUserData'];

    for (const key of keys) {
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const userData = JSON.parse(stored);

        const userType =
          userData.user_type ||
          (userData.company_id ? 'company' : 'users');

        const userId = userData.company_id || userData.user_id;

        return { userType, userId };
      }
    }

    return null;
  };


  const resetToMainStackWithScreen = async (screen, params) => {
    const session = await getStoredUserTypeAndId();

    if (!session?.userType) {
      console.warn('❌ No session found for navigation reset');
      return;
    }

    const rootName = session.userType === 'company' ? 'Company' : 'User';

    navigationRef.current?.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [
          {
            name: rootName,     // User or Company (from RootNavigator)
            state: {
              index: 1,
              routes: [
                { name: 'AppDrawer' },        // UX base inside that role
                { name: screen, params },     // Target from link/notification
              ],
            },
          },
        ],
      })
    );

  };

  useEffect(() => {
    const appStateListener = AppState.addEventListener("change", (nextAppState) => {
      setAppState(nextAppState);
    });

    return () => appStateListener.remove();
  }, []);


  useEffect(() => {
    const app = getApp();
    const messaging = getMessaging(app);

    if (!notificationListener.current) {
      notificationListener.current = onMessage(messaging, async (remoteMessage) => {
        console.log("📩 Foreground notification received:", JSON.stringify(remoteMessage, null, 2));

        const { notification, data } = remoteMessage;
        const title = notification?.title || "New Notification";
        const body = notification?.body || "You have a new message.";

        setInAppNotification({ title, body, data });

        // Reset fadeAnim to fully visible
        fadeAnim.setValue(1);

        // Slide in banner
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start();

        // Clear any previous timeout
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        // After 5s, fade out opacity (no slide out)
        timeoutRef.current = setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }).start(() => {
            setInAppNotification(null);
            slideAnim.setValue(-100); // reset slide position for next time
          });
          timeoutRef.current = null;
        }, 4000);
      });
    }

    return () => {
      if (notificationListener.current) {
        notificationListener.current();
        notificationListener.current = null;
      }
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);




  useEffect(() => {
    const app = getApp();
    const messaging = getMessaging(app);

    getInitialNotification(messaging)
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log("🚀 Notification caused app to open from quit state:", JSON.stringify(remoteMessage, null, 2));

          handleNavigation(remoteMessage.data);
        }
      })
      .catch(error => console.error("❌ [Error getting initial notification]:", error));
  }, []);

  useEffect(() => {
    const app = getApp();
    const messaging = getMessaging(app);

    const unsubscribe = onNotificationOpenedApp(messaging, remoteMessage => {
      if (remoteMessage) {
        console.log("🔁 App opened from background due to notification:", JSON.stringify(remoteMessage, null, 2));

        handleNavigation(remoteMessage.data);
      }
    });

    return unsubscribe;
  }, []);

  // ✅ Handle tapping a notifee notification
  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(({ type, detail }) => {
      if (type === EventType.PRESS) {

        handleNavigation(detail.notification.data);
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Background notifications (silent)
  useEffect(() => {
    const app = getApp();
    const messaging = getMessaging(app);

    setBackgroundMessageHandler(messaging, async (remoteMessage) => {

    });
  }, []);

  const handleNavigation = (data) => {
    if (!data) return;

    let parsedData = {};
    try {
      parsedData = JSON.parse(data?.notificationData || "{}");
    } catch (error) {

    }

    const notificationType = parsedData?.notificationType || data?.notificationType || null;

    if (notificationType === "comment" || notificationType === "reaction" || notificationType === "forum_post") {
      waitForNavigation(() => navigateToForumComment(parsedData));
    } else if (notificationType === "job_application") {
      waitForNavigation(() => navigateToAppliedJobs(parsedData));
    } else if (notificationType === "contact_alert") {
      waitForNavigation(() => navigateToContactViewed(parsedData));
    } else if (notificationType === "job_suggestion") {
      waitForNavigation(async () => {

        const params = {
          ...parsedData,
          post_id: parsedData.job_post_id, // ✅ map job_post_id → post_id
        };
        await resetToMainStackWithScreen("JobDetail", params);

      });

    } else if (notificationType === "service_enquiry") {
      waitForNavigation(async () => {

        const params = {
          ...parsedData,
          enquiryID: parsedData.enquiry_id,
        };
        await resetToMainStackWithScreen("EnquiryDetails", params);
      });

    } else {
      waitForNavigation(async () => {

        const screen = data?.screen || "Home";
        const params = parsedData || {};
        await resetToMainStackWithScreen(screen, params);
      });
    }
  };

  const waitForNavigation = (callback) => {
    const checkNavigationReady = setInterval(async () => {
      if (navigationRef.isReady()) {
        clearInterval(checkNavigationReady);
        await callback();
      }
    }, 100);
  };


  const navigateToContactViewed = async (data) => {
    const userType = data?.enquirer_user_type;
    const enquiredUserId = data?.enquirer_id;

    if (!enquiredUserId || !userType) {
      console.warn("❌ Missing IDs or unknown user_type:", { userType, enquiredUserId });
      return;
    }

    const targetRoute =
      userType === "users" ? "UserDetails" :
        userType === "company" ? "CompanyDetails" : null;

    if (!targetRoute) {
      console.warn("❌ Unknown user type:", userType);
      return;
    }

    data.screen = targetRoute;

    const currentRoute = navigationRef.getCurrentRoute();
    const currentUserId = currentRoute?.params?.userId;

    if (currentRoute?.name === targetRoute && currentUserId === enquiredUserId) {
      return;
    }

    await resetToMainStackWithScreen(targetRoute, { userId: enquiredUserId });
  };



  const navigateToForumComment = async (data) => {

    const forumId = data?.forum_id;
    const commentId = data?.comment_id;
    const reactId = data?.reaction_id;

    if (!forumId) return;

    const currentRoute = navigationRef.getCurrentRoute();

    if (
      currentRoute?.name === 'Comment' &&
      currentRoute?.params?.forum_id === forumId
    ) {
      navigationRef.setParams({
        ...(commentId ? { highlightId: commentId } : {}),
        ...(reactId ? { highlightReactId: reactId } : {}),
      });
      return;
    }

    await resetToMainStackWithScreen('Comment', {
      forum_id: forumId,
      ...(commentId ? { highlightId: commentId } : {}),
      ...(reactId ? { highlightReactId: reactId } : {}),
    });
  };




  const navigateToAppliedJobs = async (data) => {
    const seekerId = data?.seeker_id;

    if (!seekerId) {

      return;
    }

    if (
      navigationRef.getCurrentRoute()?.name === 'CompanyGetJobCandidates' &&
      navigationRef.getCurrentRoute()?.params?.seeker_id === seekerId
    ) {

      return;
    }

    await resetToMainStackWithScreen('CompanyGetJobCandidates', {
      userId: seekerId
    });
  };

  const handleBannerPress = () => {
    if (inAppNotification?.data) {
      handleNavigation(inAppNotification.data);
      setInAppNotification(null);
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <>
      {inAppNotification && (


        <View style={[styles.safeArea, { top: insets?.top }]}>
          <Animated.View
            style={[
              styles.bannerContainer,
              {
                transform: [{ translateY: slideAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            <TouchableOpacity onPress={handleBannerPress} activeOpacity={0.95}>
              <View style={styles.banner}>
                <View style={styles.iconContainer}>
                  <Text style={styles.icon}>🔔</Text>
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.title}>{inAppNotification.title}</Text>
                  <Text style={styles.body}>{inAppNotification.body}</Text>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </View>

      )}
    </>
  );


};

const styles = StyleSheet.create({
  safeArea: {
    position: 'absolute',

    left: 0,
    right: 0,
    zIndex: 9999,
  },

  bannerContainer: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#323232',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },

  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(60, 60, 60, 0.9)', // slightly lighter ash black
    padding: 16,
    borderRadius: 16,
  },

  iconContainer: {
    marginRight: 12,
    backgroundColor: 'rgba(80, 80, 80, 0.7)', // lighter ash black for icon background
    borderRadius: 24,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  icon: {
    fontSize: 20,
    color: '#EEE', // off-white for good contrast
  },

  textContainer: {
    flex: 1,
  },

  title: {
    color: '#EEE',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },

  body: {
    color: '#CCC',
    fontSize: 14,
    lineHeight: 18,
  },
});



export default NotificationHandler;
