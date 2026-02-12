import React, { useRef, useState } from 'react'
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Dimensions,
    ScrollView,
} from 'react-native'
import PagerView from 'react-native-pager-view'
import { useRoute, useNavigation } from '@react-navigation/native'

import MyForums from '../Forum/myForums'
import MyResources from '../Resources/MyResources'
import MyEnqueries from '../Services/MyEnqueries'
import MyJobs from '../Job/ViewJobs'
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import { colors, dimensions } from '../../assets/theme'
import MaterialIcons from '@react-native-vector-icons/material-icons'
import { AnimatedFAB } from 'react-native-paper';
import { useNetwork } from '../AppUtils/IdProvider'
import { AppHeader } from '../AppUtils/AppHeader'


const PROFILE_TAB_CONFIG = {
    user: {
      mine: ['Forums', 'Resources', 'Enquiries'],
      other: ['Forums', 'Resources'],
    },
    company: {
      mine: ['Jobs', 'Forums', 'Resources', 'Enquiries'],
      other: ['Jobs', 'Forums', 'Resources'],
    },
  };
  


const FAB_CONFIG = {
    Forums: { icon: 'create', navigateTo: 'ForumPost' },
    Resources: { icon: 'create', navigateTo: 'ResourcesPost' },
    Jobs: { icon: 'create', navigateTo: 'CompanyJobPost' },
  };
  

const TAB_WIDTH = 110

const Timeline = () => {
    const pagerRef = useRef(null)
    const { myId } = useNetwork()
    const route = useRoute()
    const { userId } = route?.params
    const profileUserId = route?.params?.userId ?? myId
    const isMyProfile = profileUserId === myId
    const profileType = route?.params?.profileType;

    const TABS = PROFILE_TAB_CONFIG[profileType][
        isMyProfile ? 'mine' : 'other'
    ];

    const PAGES = TABS; // keep pages same as tabs

    const tabRef = useRef(null)
    const navigation = useNavigation();
    const [index, setIndex] = useState(0)
    const [loadedTabs, setLoadedTabs] = useState([0])




    const fabConfig = FAB_CONFIG[PAGES[index]];

    const onTabPress = (i) => {
        setIndex(i);
        pagerRef.current?.setPage(i);
      
        tabRef.current?.scrollToIndex({
          index: i,
          viewPosition: 0.5, // center tab
          animated: true,
        });
      };
      

    const [isExtended, setIsExtended] = React.useState(true);


    const onScroll = ({ nativeEvent }) => {
        const currentScrollPosition =
            Math.floor(nativeEvent?.contentOffset?.y) ?? 0;

        setIsExtended(currentScrollPosition <= 0);
    };



    return (
        <View style={styles.container}>
            <AppHeader
                title="Activity"

            />

<View style={styles.tabBarContainer}>
  <FlatList
    ref={tabRef}
    data={TABS}
    horizontal
    showsHorizontalScrollIndicator={false}
    keyExtractor={(item) => item}
    contentContainerStyle={styles.tabBar}
    renderItem={({ item: tab, index: i }) => {
      const isActive = index === i;

      return (
        <TouchableOpacity
          onPress={() => onTabPress(i)}
          style={[styles.tab, isActive && styles.activeTabBorder]}
        >
          <Text style={[styles.tabText, isActive && styles.activeTab]}>
            {tab}
          </Text>
        </TouchableOpacity>
      );
    }}
    getItemLayout={(data, index) => ({
      length: TAB_WIDTH,
      offset: TAB_WIDTH * index,
      index,
    })}
  />
</View>



            <PagerView
                ref={pagerRef}
                style={{ flex: 1 }}
                initialPage={0}
                offscreenPageLimit={1}
                onPageSelected={(e) => {
                    const i = e.nativeEvent.position;
                    setIndex(i);
                  
                    tabRef.current?.scrollToIndex({
                      index: i,
                      viewPosition: 0.5,
                      animated: true,
                    });
                  
                    setLoadedTabs((prev) =>
                      prev.includes(i) ? prev : [...prev, i]
                    );
                  }}
                  
            >
                {PAGES.map((page, i) => (
                    <View key={page} style={styles.page}>
                        {loadedTabs.includes(i) && page === 'Forums' && (
                            <MyForums userId={userId} onScroll={onScroll} />
                        )}

                        {loadedTabs.includes(i) && page === 'Resources' && (
                            <MyResources userId={userId} />
                        )}

                        {loadedTabs.includes(i) && page === 'Enquiries' && (
                            <MyEnqueries userId={userId} />
                        )}
                        {loadedTabs.includes(i) && page === 'Jobs' && (
                            <MyJobs userId={userId} />
                        )}

                    </View>
                ))}
            </PagerView>


            {isMyProfile && fabConfig && (

                <AnimatedFAB
                    icon='plus'
                    //   label="Create"
                    //   extended={isExtended}
                    onPress={() =>
                        navigation.navigate(fabConfig.navigateTo, { userId })
                    }
                    animateFrom="left"
                    iconMode="static"
                    color="#FFF"
                    style={styles.fabStyle}
                />

            )}

        </View>
    )
}

export default Timeline

const styles = StyleSheet.create({
    container: {
        flex: 1,

    },
    fabStyle: {
        position: 'absolute',
        right: 26,
        bottom: 46,
        backgroundColor: '#075CAB',

    },

    tabBarContainer: {
        maxHeight: 50,
        // borderBottomWidth: 1,
        // borderColor: '#e0e0e0',
        marginBottom: 5,
        backgroundColor: '#FFF'
    },
    tabBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    tab: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tabText: {
        fontSize: 16,
        color: '#666',
    },
    activeTab: {
        color: '#075cab', // Example active brand color
        fontWeight: '600',
    },
    activeTabBorder: {
        borderBottomWidth: 2,
        borderBottomColor: '#075cab',
    }

})
