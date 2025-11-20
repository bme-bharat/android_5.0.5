import React, { useState } from 'react';
import { View, useWindowDimensions, StyleSheet, Text } from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

const ProfileTabView = ({ routes }) => {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={SceneMap(
        routes.reduce((scenes, tab) => {
          scenes[tab.key] = tab.component;
          return scenes;
        }, {})
      )}
      onIndexChange={setIndex}
      initialLayout={{ width: layout.width }}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          activeColor="#075cab"
          inactiveColor="#666"
          indicatorStyle={{ backgroundColor: '#075cab', height: 3 }}
          labelStyle={{ fontSize: 14, fontWeight: '600' }}
          style={{ backgroundColor: '#fff' }}
        />
      )}
    />
  );
};

export default ProfileTabView;
