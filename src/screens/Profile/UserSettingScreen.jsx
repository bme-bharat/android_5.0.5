import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,

  TextInput
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import DeviceInfo from 'react-native-device-info';
import { useSelector } from 'react-redux';
import NotificationSettings, { useNotificationToggle } from '../AppUtils/NotificationSetting';
import { useNetwork } from '../AppUtils/IdProvider';
import apiClient from '../ApiClient';
import { useConnection } from '../AppUtils/ConnectionProvider';
import UserProfileCard from './UserProfileCard';
import DrawerNavigationList from './DrawerNavigationList';
import LottieView from 'lottie-react-native';
import { settingStyles as styles } from '../Styles/settingStyles';

import Enquire from '../../assets/svgIcons/enquire.svg';
import Graduation from '../../assets/svgIcons/graduation.svg';
import Policy from '../../assets/svgIcons/shield.svg';
import Vip from '../../assets/svgIcons/vip.svg';
import Grid from '../../assets/svgIcons/latest.svg';
import Time from '../../assets/svgIcons/time.svg';

import Information from '../../assets/svgIcons/information.svg';
import Restrict from '../../assets/svgIcons/user-forbid.svg';
import Apply from '../../assets/svgIcons/apply.svg';
import { colors, dimensions } from '../../assets/theme';
import Animated from 'react-native-reanimated';
import scrollAnimations from '../helperComponents/scrollAnimations';
import RecentlyViewedScreen from "../appTrack/RecentlyViewedScreen"
import { SafeAreaView } from 'react-native-safe-area-context';
import { Switch } from 'react-native-paper';

const UserSettingScreen = () => {
  const navigation = useNavigation();
  const { myId, myData } = useNetwork();
  const { isConnected } = useConnection();
  const profile = useSelector(state => state.CompanyProfile.profile);
  const { notificationEnabled, toggleNotifications, isProcessing } =
    useNotificationToggle();

  const parentNavigation = navigation.getParent();
  const currentRouteName = parentNavigation?.getState()?.routes[parentNavigation.getState().index]?.name;
  const [expandedItem, setExpandedItem] = useState(null);
  const [transactions, setTransactions] = useState([]);

  const [deviceInfo, setDeviceInfo] = useState({
    appVersion: '',
  });

  const hasSubscription = React.useMemo(() => {
    return myData?.subscription_expires_on
      ? Math.floor(Date.now() / 1000) < myData.subscription_expires_on
      : false;
  }, [myData]);

  useEffect(() => {
    // Fetch device information
    const fetchDeviceInfo = async () => {

      const appVersion = await DeviceInfo.getVersion();


      setDeviceInfo({

        appVersion: appVersion,

      });
    };

    fetchDeviceInfo();
  }, []);


  useEffect(() => {
    const fetchTransactions = async () => {
      if (myId) {

        try {
          const response = await apiClient.post(
            '/getUsersTransactions',
            {
              command: "getUsersTransactions",
              user_id: myId,
            }
          );

          const completedTransactions = response.data.response.filter(
            transaction => transaction.transaction_status === "captured"
          );

          setTransactions(completedTransactions);
        } catch (err) {

        } finally {

        }
      }
    };

    fetchTransactions();
  }, [myId]);



  const handleToggle = (item) => {
    setExpandedItem(expandedItem === item ? null : item);
  };

  const navigateTo = (screen, params = {}) => () => {
    navigation.navigate(screen, params);
  };

  const DrawerList = [
    { icon: Graduation, label: 'Job profile', onPress: navigateTo('UserJobProfile') },
    { icon: Apply, label: 'Applied jobs', onPress: navigateTo('UserJobApplied') },
    // {
    //   icon: Grid,
    //   label: 'My posts',
    //   onPress: () => handleToggle('My posts'),
    //   subItems: [
    //     {
    //       label: 'Forum',
    //       onPress: navigateTo('YourForumList', { userId: myId }),
    //     },
    //     {
    //       label: 'Resources',
    //       onPress: navigateTo('Resourcesposted', { userId: myId }),
    //     },
    //   ],
    // },
    { icon: Time, label: 'My activities', onPress: navigateTo('Timeline', { userId: myId, profileType: "user" }) },

    // { icon: Enquire, label: 'My enquiries', onPress: navigateTo('MyEnqueries',{userId : myId}) },

    { icon: Restrict, label: 'Blocked users', onPress: navigateTo('BlockedUsers') },
    {
      icon: Vip,
      label: 'Subscription',
      onPress: () => navigation.navigate('Subscription', {
        fromDrawer: true, // <- custom flag
      }),
    },

    hasSubscription && transactions.length > 0 && {
      icon: Vip,
      label: 'My subscriptions',
      onPress: navigateTo('YourSubscriptionList'),
    },
    { icon: Policy, label: 'Settings & Policies', onPress: navigateTo('Policies'), },
    // {
    //   icon: Policy,
    //   label: 'Settings & Policies',
    //   onPress: navigateTo('Policies'),
    //   subItems: [
    //     { label: 'Privacy policy', onPress: navigateTo('PrivacyPolicy') },
    //     { label: 'Cancellation policy', onPress: navigateTo('CancellationPolicy') },
    //     { label: 'Legal compliance', onPress: navigateTo('LegalPolicy') },
    //     { label: 'Terms and conditions', onPress: navigateTo('TermsAndConditions') },
    //   ],
    // },
  ];


  const handleUpdate = () => {
    navigation.navigate('UserProfileUpdate', {
      profile,
      imageUrl: profile?.imageUrl,
    });
  };


  return (
    <>
     <UserProfileCard
              profile={profile}
              onEdit={handleUpdate}
              onNavigate={() => navigation.navigate('UserProfile', { userId: myId })}
            />
      <Animated.FlatList
        data={[{ key: 'content' }]}
        renderItem={() => (
          <>

      
            <DrawerNavigationList
              items={DrawerList}
              expandedItem={expandedItem}
              onToggle={handleToggle}
              isConnected={isConnected}
            />

            <RecentlyViewedScreen />

            <View style={styles.appversion}>
              <Text style={styles.appText}>
                App Version: {deviceInfo.appVersion}
              </Text>
            </View>
          </>
        )}

        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        overScrollMode={'never'}
        contentContainerStyle={{ paddingBottom:10, flexGrow:1, backgroundColor: '#F7F8FA', }}
      />
      
      {/* 
      <BottomNavigationBar
        tabs={tabConfig}
        currentRouteName={currentRouteName}
        navigation={navigation}
        tabNameMap={tabNameMap}

      /> */}
    </>

  );

};



export default UserSettingScreen;