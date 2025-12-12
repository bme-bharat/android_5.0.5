import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { settingStyles as styles } from '../Styles/settingStyles';

// SVG imports
import HomeIcon from '../../assets/svgIcons/home.svg';
import JobsIcon from '../../assets/svgIcons/jobs.svg';
import FeedIcon from '../../assets/svgIcons/feed.svg';
import ProductsIcon from '../../assets/svgIcons/products.svg';
import SettingsIcon from '../../assets/svgIcons/settings.svg';

import HomeIconFill from '../../assets/svgIcons/home-fill.svg';
import JobsIconFill from '../../assets/svgIcons/jobs-fill.svg';
import FeedIconFill from '../../assets/svgIcons/feed-fill.svg';
import ProductsIconFill from '../../assets/svgIcons/products-fill.svg';
import SettingsIconFill from '../../assets/svgIcons/settings-fill.svg';

import { useNetwork } from './IdProvider';

// Lazy-loaded screens
const ProductsList = React.lazy(() => import('../Products/ProductsList'));
const JobListScreen = React.lazy(() => import('../Job/JobListScreen'));
const UserHomeScreen = React.lazy(() => import('../UserHomeScreen'));
const AllPosts = React.lazy(() => import('../Forum/Feed'));
const CompanyHomeScreen = React.lazy(() => import('../CompanyHomeScreen'));
const CompanySettingScreen = React.lazy(() => import('../Profile/CompanySettingScreen'));
const UserSettingScreen = React.lazy(() => import('../Profile/UserSettingScreen'));

const BottomNavigationBar = ({
  currentRouteName,
  navigation,
  flatListRef,
  scrollOffsetY,
  handleRefresh,

}) => {
  const { myData } = useNetwork();

  const tabNameMap = 
  {
    Home3: "Home",
    ProductsList: "Products",
    Feed: "Feed",
    Jobs: "Jobs",
    Settings: "Settings",
  }
  // Decide which config to use based on user type
  const tabConfig = myData?.user_type === 'users'
    ? [
      { name: "Home", component: UserHomeScreen },
      { name: "Jobs", component: JobListScreen },
      { name: "Feed", component: AllPosts },
      { name: "Products", component: ProductsList },
      { name: "Settings", component: UserSettingScreen },
    ]
    : [
      { name: "Home", component: CompanyHomeScreen },
      { name: "Jobs", component: JobListScreen },
      { name: "Feed", component: AllPosts },
      { name: "Products", component: ProductsList },
      { name: "Settings", component: CompanySettingScreen },
    ];

  // Map route names to their icons
  const iconMap = {
    Home: { focused: HomeIconFill, unfocused: HomeIcon },
    Jobs: { focused: JobsIconFill, unfocused: JobsIcon },
    Feed: { focused: FeedIconFill, unfocused: FeedIcon },
    Products: { focused: ProductsIconFill, unfocused: ProductsIcon },
    Settings: { focused: SettingsIconFill, unfocused: SettingsIcon },
  };

  return (
    <View style={styles.bottomNavContainer}>
      {tabConfig.map((tab, index) => {
        const isFocused = tabNameMap
          ? tabNameMap[currentRouteName] === tab.name
          : currentRouteName === tab.name;
        const { focused, unfocused } = iconMap[tab.name] || {};
        const IconComponent = isFocused ? focused : unfocused;

        return (
          <TouchableOpacity
            key={index}
            onPress={() => {
              if (isFocused) {
                // Scroll to top or refresh if already focused
                if (scrollOffsetY?.current > 0) {
                  flatListRef?.current?.scrollToOffset({ offset: 0, animated: true });
                  setTimeout(() => handleRefresh?.(), 100);
                } else {
                  handleRefresh?.();
                }
              } else {
                // Navigate using the tab name
                // For stack navigators, you can just navigate by name
                navigation.navigate(tab.name);
              }
            }}
            style={styles.navItem}
            
          >
            {IconComponent && (
              <IconComponent width={22} height={22} fill={isFocused ? '#075cab' : 'black'} />
            )}
            <Text style={[styles.navText, { color: isFocused ? '#075cab' : 'black' }]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default BottomNavigationBar;
