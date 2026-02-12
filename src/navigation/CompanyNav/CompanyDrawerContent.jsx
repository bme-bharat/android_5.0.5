import React, { useEffect, useState } from 'react';
import { View, Text, Image, Dimensions, TouchableOpacity } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';

import SCREENS from '../screens';
import { colors, dimensions } from '../../assets/theme';

// Drawer Screens
import HelpCenter from '../../screens/Bme_content/HelpCenter';
import CompanyListScreen from '../../screens/CompanyList/CompanyList';
import ResourcesList from '../../screens/Resources/ResourcesList';
import ServicesList from '../../screens/Services/ServicesList';
import AllEvents from '../../screens/Resources/Events';

// Bottom Tabs
import CompanyBottomTabNav from './CompanyBottomTabNav';

// SVGs
import Company from '../../assets/svgIcons/company.svg';
import Event from '../../assets/svgIcons/event.svg';
import Resource from '../../assets/svgIcons/resources.svg';
import Service from '../../assets/svgIcons/services.svg';
import Help from '../../assets/svgIcons/customer.svg';
import DeviceInfo from 'react-native-device-info';
import { useSelector } from 'react-redux';
import FastImage from '@d11/react-native-fast-image';
import Avatar from '../../screens/helperComponents/Avatar';
import { useNavigation } from '@react-navigation/native';
import IMAGES from '../images';

const Drawer = createDrawerNavigator();
const { width } = Dimensions.get('window');

const DRAWER_WIDTH = width * 0.6;
const IMAGE_WIDTH = DRAWER_WIDTH * 0.8;
const IMAGE_HEIGHT = DRAWER_WIDTH * (200 / 600); // 0.3333


const drawerItemProps = (isFocused) => ({
  focused: isFocused,
  activeBackgroundColor: colors.LIGHT_BLUE,
  inactiveBackgroundColor: colors.background,
  inactiveTintColor: colors.BLACK,
  activeTintColor: colors.primary,
  style: {
    borderRadius: 0,     // 🔥 remove pill shape
    marginHorizontal: 0, // 🔥 remove side gaps
    marginVertical: 0,   // 🔥 remove vertical gaps
    borderRadius: 8
  },

  labelStyle: {

  },

});

const drawerIcon = (IconComponent, color) => (
  <IconComponent
    width={dimensions.icon.medium}
    height={dimensions.icon.medium}
    fill={color}

  />
);

/* ======================
   DRAWER NAV
====================== */
const CompanyDrawerNav = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    version: '',
    brand: '',
    systemVersion: '',
  });
  const navigation = useNavigation();
  useEffect(() => {
    const fetchDeviceDetails = async () => {
      const version = await DeviceInfo.getVersion();
      const brand = DeviceInfo.getBrand();
      const systemVersion = await DeviceInfo.getSystemVersion();
      setDeviceInfo({ version, brand, systemVersion });
    };

    fetchDeviceDetails();
  }, []);
  const profile = useSelector(state => state.CompanyProfile.profile);

  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        swipeEnabled: true,
        swipeEdgeWidth: 80,
        contentStyle: { backgroundColor: '#F7F8FA' },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '600',
          letterSpacing: 0.3,
        },

        drawerStyle: {
          width: DRAWER_WIDTH,
          borderRadius: 0,         // remove rounding
          borderTopRightRadius: 0, // just to be extra safe
          borderBottomRightRadius: 0,
          backgroundColor: colors.background,
        },
        drawerType: 'front',

      }}
      drawerContent={props => {
        const { routeNames, index } = props.state;
        const focused = routeNames[index];

        return (
          <View style={{ flex: 1 }}>

            <DrawerContentScrollView contentContainerStyle={{ flex: 1 }}>
              <View style={{ width: DRAWER_WIDTH, height: IMAGE_HEIGHT, alignSelf: 'center', marginVertical: 10, }}>
                <Image
                  source={IMAGES.LOGO}
                  style={{ width: '100%', height: '100%', }} />

              </View>
              {/* 
            <DrawerItem
              label="Companies"
              icon={({ color }) => drawerIcon(Company, color)}
              onPress={() => props.navigation.navigate(SCREENS.COMPANIES)}
              {...drawerItemProps(focused === SCREENS.COMPANIES)}
            /> */}

              <DrawerItem
                label="Events"
                icon={({ color }) => drawerIcon(Event, color)}
                onPress={() => props.navigation.navigate(SCREENS.EVENTS)}
                {...drawerItemProps(focused === SCREENS.EVENTS)}
              />

              <DrawerItem
                label="Resources"
                icon={({ color }) => drawerIcon(Resource, color)}
                onPress={() => props.navigation.navigate(SCREENS.RESOURCES)}
                {...drawerItemProps(focused === SCREENS.RESOURCES)}
              />

              <DrawerItem
                label="Services"
                icon={({ color }) => drawerIcon(Service, color)}
                onPress={() => props.navigation.navigate(SCREENS.SERVICES)}
                {...drawerItemProps(focused === SCREENS.SERVICES)}
              />

              <DrawerItem
                label="Help"
                icon={({ color }) => drawerIcon(Help, color)}
                onPress={() => props.navigation.navigate(SCREENS.HELP)}
                {...drawerItemProps(focused === SCREENS.HELP)}
              />



            </DrawerContentScrollView>
            <View
              style={{
                height: 60,
                justifyContent: 'center',

                // backgroundColor: '#f0f0f0',
              }}
            >
              <Text
                style={{

                  textAlign: 'center',
                }}
              >
                Version: {deviceInfo.version}
              </Text>
            </View>
          </View>
        );
      }}
    >
      {/* ✅ FIXED: real string name */}
      <Drawer.Screen name="Tabs" component={CompanyBottomTabNav} />

      {/* Drawer routes */}
      {/* <Drawer.Screen name={SCREENS.COMPANIES} component={CompanyListScreen} /> */}
      <Drawer.Screen name={SCREENS.EVENTS} component={AllEvents} />
      <Drawer.Screen name={SCREENS.RESOURCES} component={ResourcesList} />
      <Drawer.Screen name={SCREENS.SERVICES} component={ServicesList} />
      <Drawer.Screen name={SCREENS.HELP} component={HelpCenter} />
    </Drawer.Navigator>
  );
};

export default CompanyDrawerNav;
