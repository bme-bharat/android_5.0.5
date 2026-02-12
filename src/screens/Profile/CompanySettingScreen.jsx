
import React, { useState, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';

import { useNavigation } from '@react-navigation/native';
import DeviceInfo from 'react-native-device-info';
import { useSelector } from 'react-redux';
import NotificationSettings from '../AppUtils/NotificationSetting';
import { useNetwork } from '../AppUtils/IdProvider';
import { useConnection } from '../AppUtils/ConnectionProvider';
import apiClient from '../ApiClient';
import UserProfileCard from './UserProfileCard';
import DrawerNavigationList from './DrawerNavigationList';
import { settingStyles as styles } from '../Styles/settingStyles';

import Enquire from '../../assets/svgIcons/enquire.svg';
import Graduation from '../../assets/svgIcons/graduation.svg';
import Policy from '../../assets/svgIcons/shield.svg';
import Vip from '../../assets/svgIcons/vip.svg';
import Grid from '../../assets/svgIcons/latest.svg';
import Time from '../../assets/svgIcons/time.svg';

import Information from '../../assets/svgIcons/information.svg';
import Restrict from '../../assets/svgIcons/user-forbid.svg';
import Seeker from '../../assets/svgIcons/seekers.svg';
import Product from '../../assets/svgIcons/products.svg';
import Service from '../../assets/svgIcons/services.svg';
import AppStyles from '../AppUtils/AppStyles';
import RecentlyViewedScreen from '../appTrack/RecentlyViewedScreen';


const CompanySettingScreen = () => {
  const navigation = useNavigation();
  const { myId, myData } = useNetwork();
  const { isConnected } = useConnection();

  const profile = useSelector(state => state.CompanyProfile.profile);
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
      if (!myId) return;

      try {
        const response = await apiClient.post('/getUsersTransactions', {
          command: 'getUsersTransactions',
          user_id: myId,
        });

        if (response.data?.errorMessage) {
          setTransactions([]);
          return;
        }
        const allTransactions = response.data?.response || [];
        const completedTransactions = allTransactions.filter(
          transaction => transaction.transaction_status === 'captured'
        );

        setTransactions(completedTransactions);
      } catch (err) {

        setTransactions([]);
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
    { icon: Product, label: 'My products', onPress: navigateTo('MyProducts') },
    { icon: Service, label: 'My services', onPress: navigateTo('MyServices') },
    { icon: Graduation, label: 'My jobs', onPress: navigateTo('PostedJob') },
    { icon: Seeker, label: 'Job seekers', onPress: navigateTo('CompanyListJobCandiates') },
    // {
    //   icon: Grid,
    //   label: 'My posts',
    //   onPress: () => handleToggle('My posts'),
    //   subItems: [
    //     { label: 'Forum', onPress: navigateTo('YourForumList') },
    //     { label: 'Resources', onPress: navigateTo('Resourcesposted') },
    //   ],
    // },
    { icon: Time, label: 'My activities', onPress: navigateTo('Timeline', { userId: myId, profileType: "company" }) },

    // { icon: Enquire, label: 'My enquiries', onPress: navigateTo('MyEnqueries') },
    { icon: Restrict, label: 'Blocked users', onPress: navigateTo('BlockedUsers') },
    {
      icon: Vip,
      label: 'Subscription',
      onPress: () => navigation.navigate('Subscription', {
        fromDrawer: true, // <- custom flag
      }),
    },

    // hasSubscription && transactions.length > 0 && {
    //   icon: Vip,
    //   label: 'My Subscriptions',
    //   onPress: navigateTo('YourSubscriptionList'),
    // },
    // { icon: Information, label: 'About us', onPress: navigateTo('AboutUs') },
    { icon: Policy, label: 'Settings & Policies', onPress: navigateTo('Policies'), },

    // {
    //   icon: Policy,
    //   label: 'Settings & Policies',
    //   onPress: () => handleToggle('Settings & Policies'),
    //   subItems: [
    //     { label: 'Privacy policy', onPress: navigateTo('PrivacyPolicy') },
    //     { label: 'Cancellation policy', onPress: navigateTo('CancellationPolicy') },
    //     { label: 'Legal compliance', onPress: navigateTo('LegalPolicy') },
    //     { label: 'Terms and conditions', onPress: navigateTo('TermsAndConditions') },
    //   ],
    // },
  ];


  const handleUpdate = () => {
    navigation.navigate('CompanyProfileUpdate', {
      profile,
      imageUrl: profile?.imageUrl,
    });
  };


  return (

    < >
      <UserProfileCard
        profile={profile}
        onEdit={handleUpdate}
        onNavigate={() => navigation.navigate('CompanyProfile', { userId: myId })}
        styles={styles}
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
        contentContainerStyle={{ paddingBottom: 10, flexGrow: 1, backgroundColor: '#F7F8FA', }}

      />

      {/* <BottomNavigationBar
        tabs={tabConfig}
        currentRouteName={currentRouteName}
        navigation={navigation}
        tabNameMap={tabNameMap}
      /> */}

    </>

  );
};


export default CompanySettingScreen;