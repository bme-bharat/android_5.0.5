import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, Dimensions, View, StyleSheet, Image } from 'react-native';
import { colors } from '../../assets/theme';
import SCREENS from '../screens';
import IMAGES from '../images';
import DIMENSION from '../dimensions';
import UserHomeScreen from '../../screens/UserHomeScreen';
import JobListScreen from '../../screens/Job/JobListScreen';
import AllPosts from '../../screens/Forum/Feed';
import UserSettingScreen from '../../screens/Profile/UserSettingScreen';
import ProductsList from '../../screens/Products/ProductsList';
import { useSelector } from 'react-redux';
import FastImage from '@d11/react-native-fast-image';
import CompanyHomeScreen from '../../screens/CompanyHomeScreen';
import CompanySettingScreen from '../../screens/Profile/CompanySettingScreen';
import Avatar from '../../screens/helperComponents/Avatar';

const { height: screenHeight } = Dimensions.get('window');

const tabBarHeight = Platform.OS === 'ios'
  ? screenHeight * 0.09  // ~9% of screen height
  : screenHeight * 0.08;
const Tab = createBottomTabNavigator();

const CompanyBottomTabNav = () => {
  const profile = useSelector(state => state.CompanyProfile.profile);

  const iconStyle = focused => ({
    width: DIMENSION.WIDTH,
    height: DIMENSION.HEIGHT,
    alignSelf: 'center',
    // transform: [{ scale: focused ? 1.25 : 1 }],
    tintColor: focused ? colors.primary : colors.secondary,
  });

  const TabIcon = ({ focused, children }) => {
    return (
      <View style={styles.iconWrapper}>
        {focused && <View style={styles.topLine} />}
        {children}
      </View>
    );
  };
  

  return (
    <Tab.Navigator
      initialRouteName={SCREENS.HOME}

      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          // paddingTop: 4,
          height:44,
          // backgroundColor:'red'
          
        },
        contentStyle: { backgroundColor: '#F7F8FA' },


        tabBarItemStyle: {
          // paddingVertical: 6,  
        },


        tabBarLabelPosition: 'below-icon',

        tabBarLabelStyle: {
     
          fontFamily: 'Georgia',
          includeFontPadding:false

        },
        tabBarActiveTintColor: '#075CAB',
        tabBarInactiveTintColor: colors.secondary,
      }}
    >

      <Tab.Screen
        name={SCREENS.HOME}
        component={CompanyHomeScreen}
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>

              <Image
                source={IMAGES.HOME}
                style={iconStyle(focused)}
                resizeMode="contain"
              />
            </TabIcon>
          ),
        }}
      />

      <Tab.Screen
        name={SCREENS.JOB}
        component={JobListScreen}
        options={{
          title: 'Jobs',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>

              <Image
                source={IMAGES.JOBS}
                style={iconStyle(focused)}
                resizeMode="contain"
              />
            </TabIcon>
          ),
        }}
      />

      <Tab.Screen
        name={SCREENS.FEED}
        component={AllPosts}
        options={{
          title: 'Feed',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>

              <Image
                source={IMAGES.FORUM}
                style={iconStyle(focused)}
                resizeMode="contain"
              />
            </TabIcon>
          ),
        }}
      />

      <Tab.Screen
        name={SCREENS.PRODUCTS}
        component={ProductsList}
        options={{
          title: 'Products',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>

              <Image
                source={IMAGES.PRODUCTS}
                style={iconStyle(focused)}
                resizeMode="contain"
              />
            </TabIcon>
          ),
        }}
      />

      <Tab.Screen
        name={SCREENS.ACCOUNT}
        component={CompanySettingScreen}
        options={{
          title: 'More',
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <Image
                source={IMAGES.MORE}
                style={iconStyle(focused)}
                resizeMode="contain"
              />
            </TabIcon>

          ),
        }}
      />
    </Tab.Navigator>
  );
};


export default CompanyBottomTabNav;
const styles = StyleSheet.create({
  iconWrapper: {
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  topLine: {
    position: 'absolute',
    top: -6,          // adjust based on tab height
    width: 30,       // indicator width
    height: 2,       // thickness
    borderBottomLeftRadius: 14,
    borderBottomRightRadius:14,
    backgroundColor: '#075cab',
  },
});
