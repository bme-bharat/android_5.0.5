import React, { useEffect, useState, View } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { UserForumNav, UserJobNav, UserProfileNav, UserStackNav, UserCompanyListNav, UserResources, UserProducts, EventsDrawer, CompanyServices } from './UserStackNav';

import { Platform, Dimensions, StyleSheet, Text, StatusBar } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import CustomDrawerContent from '../DrawerContent';
import HelpCenter from '../../screens/Bme_content/HelpCenter';
import { NetworkProvider } from '../../screens/AppUtils/IdProvider';

import HomeIcon from '../../assets/svgIcons/home.svg';
import Company from '../../assets/svgIcons/company.svg';
import Event from '../../assets/svgIcons/event.svg';
import Resource from '../../assets/svgIcons/resources.svg';
import Service from '../../assets/svgIcons/services.svg';
import Help from '../../assets/svgIcons/customer.svg';


import HomeIconFill from '../../assets/svgIcons/home-fill.svg';
import JobsIconFill from '../../assets/svgIcons/jobs-fill.svg';
import FeedIconFill from '../../assets/svgIcons/feed-fill.svg';
import ProductsIconFill from '../../assets/svgIcons/products-fill.svg';
import SettingsIconFill from '../../assets/svgIcons/settings-fill.svg';
import { colors, dimensions } from '../../assets/theme';

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();
const statusBarHeight = Platform.OS === 'android'
  ? StatusBar.currentHeight
  : getStatusBarHeight();
const { width: screenWidth } = Dimensions.get('window');


const tabConfig = [
  { name: "Home", component: UserStackNav, focusedIcon: 'home', unfocusedIcon: 'home-outline', iconComponent: Icon },
  { name: "Jobs", component: UserJobNav, focusedIcon: 'bag-suitcase', unfocusedIcon: 'bag-suitcase-outline', iconComponent: Icon },
  { name: "Feed", component: UserForumNav, focusedIcon: 'forum', unfocusedIcon: 'forum-outline', iconComponent: Icon },
  { name: "Products", component: UserProducts, focusedIcon: 'shopping', unfocusedIcon: 'shopping-outline', iconComponent: Icon },
  { name: "Settings", component: UserProfileNav, focusedIcon: 'account-circle', unfocusedIcon: 'account-circle-outline', iconComponent: Icon },
];

const screenOptionStyle = ({ route }) => {
  const routeConfig = tabConfig.find(config => config.name === route.name);

  const { height, width } = Dimensions.get('window'); // Get device dimensions
  const tabBarHeight = height > 700 ? 85 : 55; // Example thresholds for taller/shorter devices

  if (!routeConfig) return {};

  const { focusedIcon, unfocusedIcon, iconComponent: IconComponent } = routeConfig;

  return {

    tabBarIcon: ({ focused, color, size }) => (
      <IconComponent name={focused ? focusedIcon : unfocusedIcon} size={size} color={focused ? '#075CAB' : 'black'} />
    ),
    headerShown: false,
    tabBarActiveTintColor: '#075CAB',
    tabBarInactiveTintColor: 'black',
    tabBarLabelStyle: {
      fontSize: 10,
      paddingBottom: 10,
      overflow: 'hidden',
      fontWeight: '600',
    },
    tabBarStyle: {
      height: tabBarHeight,
      paddingTop: 0,
      backgroundColor: 'white',
      borderTopWidth: 0,
      display: 'none'
    },
  };
};

const UserBottomTabNav = () => (

  <NetworkProvider>
    <Tab.Navigator screenOptions={screenOptionStyle}>
      {tabConfig.map(routeConfig => (
        <Tab.Screen
          key={routeConfig.name}
          name={routeConfig.name}
          component={routeConfig.component}

        />
      ))}
    </Tab.Navigator>
  </NetworkProvider>

);


const UserDrawerNav = () => {


  return (

    <NetworkProvider>
      <Drawer.Navigator
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        screenOptions={({ route }) => ({
          headerShown: false,
          gestureEnabled: route.name !== "Home", // Disable drawer swipe inside bottom tabs
          drawerActiveTintColor: '#075cab', // Active drawer item color
          drawerInactiveTintColor: 'black', // Inactive drawer item color
          drawerLabelStyle: {
            fontSize: 14, // Optional: Adjust label font size if needed
            fontWeight: '400', // Make sure the font weight isn't bold by default
          },
          drawerType: 'front',
          drawerStyle: {
            width: screenWidth * 0.60,
            borderRadius: 0,         // remove rounding
            borderTopRightRadius: 0, // just to be extra safe
            borderBottomRightRadius: 0,
       
          },
          swipeEnabled: false

        })}
      >
        <Drawer.Screen
          name="Home "
          component={UserBottomTabNav}
          options={{
            drawerIcon: () => <HomeIconFill width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />

          }}
        />
        <Drawer.Screen
          name="Companies"
          component={UserCompanyListNav}
          options={{
            drawerIcon: () => <Company width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.secondary} />,
            unmountOnBlur: true,
          }}
        />
        <Drawer.Screen
          name="Events"
          component={EventsDrawer}
          options={{
            drawerIcon: () => <Event width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.secondary} />,
            unmountOnBlur: true,
          }}
        />
        <Drawer.Screen
          name="Resources"
          component={UserResources}
          options={{
            drawerIcon: () => <Resource width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.secondary} />,
            unmountOnBlur: true,
          }}
        />
        <Drawer.Screen
          name="Services"
          component={CompanyServices}
          options={{
            drawerIcon: () => <Service width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.secondary} />,
            unmountOnBlur: true,
          }}
        />
        <Drawer.Screen
          name="Help"
          component={HelpCenter}
          options={{
            drawerIcon: () => <Help width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.secondary} />,
            unmountOnBlur: true,
          }}
        />

      </Drawer.Navigator>
    </NetworkProvider>

  );
};


export default UserDrawerNav;

