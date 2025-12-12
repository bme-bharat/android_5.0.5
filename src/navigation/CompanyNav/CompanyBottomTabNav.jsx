import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { getStatusBarHeight } from 'react-native-status-bar-height';
import { Platform, StatusBar, Text, View } from 'react-native';
import { CompanyJobNav, CompanyStackNav, CompanyForumNav, CompanyProfileNav, CompanyListNav, CompanyProducts, EventsDrawer, CompanyServices, CompanyResources } from './CompanyStackNav';
import { Dimensions, StyleSheet } from 'react-native';
import { useNavigationState } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HelpCenter from '../../screens/Bme_content/HelpCenter';
import CustomDrawerContent from '../DrawerContent';
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

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const { width: screenWidth } = Dimensions.get('window');

const statusBarHeight = Platform.OS === 'android' ? StatusBar.currentHeight : getStatusBarHeight();

const tabConfig = [
  { name: "Home", component: CompanyStackNav, focusedIcon: 'home', unfocusedIcon: 'home-outline', iconComponent: Icon },
  { name: "Jobs", component: CompanyJobNav, focusedIcon: 'bag-suitcase', unfocusedIcon: 'bag-suitcase-outline', iconComponent: Icon },
  { name: "Feed", component: CompanyForumNav, focusedIcon: 'forum', unfocusedIcon: 'forum-outline', iconComponent: Icon },
  { name: "Products", component: CompanyProducts, focusedIcon: 'shopping', unfocusedIcon: 'shopping-outline', iconComponent: Icon },
  { name: "Settings", component: CompanyProfileNav, focusedIcon: 'account-circle', unfocusedIcon: 'account-circle-outline', iconComponent: Icon },
];

const screenOptionStyle = ({ route }) => {
  const routeConfig = tabConfig.find(config => config.name === route.name);
  const { height, width } = Dimensions.get('window');
  if (!routeConfig) return {};
  const tabBarHeight = height > 700 ? 85 : 55; // Example thresholds for taller/shorter devices
  const { focusedIcon, unfocusedIcon, iconComponent: IconComponent } = routeConfig;

  return {
    tabBarIcon: ({ focused, color, size }) => (
      <IconComponent name={focused ? focusedIcon : unfocusedIcon} size={size} color={focused ? '#075CAB' : 'black'} />
    ),
    headerShown: false,
    tabBarActiveTintColor: '#075cab',
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
      backgroundColor: 'white', // Ensuring the background is white
      borderTopWidth: 0,
      display: 'none'
    },

  };
};


const CompanyBottomTab = () => (

    <NetworkProvider>

      <Tab.Navigator screenOptions={screenOptionStyle}>
        {tabConfig.map(routeConfig => (
          <Tab.Screen
            key={routeConfig.name}
            name={routeConfig.name}
            component={routeConfig.component}
            options={({ route }) => ({
              ...screenOptionStyle({ route }),


            })}
          />
        ))}

      </Tab.Navigator>
    </NetworkProvider>

);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  navigatorContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
});




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
          component={CompanyBottomTab}
          options={{
            drawerIcon: () => <HomeIconFill width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />

          }}
        />
        <Drawer.Screen
          name="Companies"
          component={CompanyListNav}
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
          component={CompanyResources}
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
