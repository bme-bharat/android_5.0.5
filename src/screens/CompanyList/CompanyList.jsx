

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Modal, Linking, Platform, Share, RefreshControl, Alert, FlatList, ActivityIndicator, Keyboard, TouchableWithoutFeedback, StatusBar } from 'react-native';

import axios from 'axios';
import { useNavigation, useFocusEffect, useScrollToTop } from '@react-navigation/native';
import { COLORS } from '../../assets/Constants';
import { Image as FastImage } from 'react-native';
import default_image from '../../images/homepage/buliding.jpg'
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../ApiClient';

import { useNetwork } from '../AppUtils/IdProvider';
import { useConnection } from '../AppUtils/ConnectionProvider';
import { getSignedUrl, highlightMatch, useLazySignedUrls } from '../helperComponents/signedUrls';
import AppStyles, { commonStyles } from '../AppUtils/AppStyles';
import { generateAvatarFromName } from '../helperComponents/useInitialsAvatar';
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import ShareIcon from '../../assets/svgIcons/share.svg';
import Search from '../../assets/svgIcons/search.svg';
import Close from '../../assets/svgIcons/close.svg';
import Company from '../../assets/svgIcons/company.svg';
import Category from '../../assets/svgIcons/category.svg';
import Location from '../../assets/svgIcons/location.svg';
import { colors, dimensions } from '../../assets/theme.jsx';
import scrollAnimations from '../helperComponents/scrollAnimations.jsx';
import Animated from "react-native-reanimated";
import Avatar from '../helperComponents/Avatar.jsx';

const defaultImage = Image.resolveAssetSource(default_image).uri;
const CompanyListScreen = () => {
  const navigation = useNavigation();
  const { onScroll, headerStyle, bottomStyle, toolbarBgStyle } = scrollAnimations();

  const { myId, myData } = useNetwork();
  const { isConnected } = useConnection();

  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [companyImageUrls, setCompanyImageUrls] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const scrollViewRef = useRef(null);
  const searchInputRef = useRef(null);

  const [searchTriggered, setSearchTriggered] = useState(false);

  const [loadingMore, setLoadingMore] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);
  const [hasMoreCompanies, setHasMoreCompanies] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [companyCount, setCompanyCount] = useState(0);
  const [searchCount, setSearchCount] = useState(0);
  const [fetchLimit, setFetchLimit] = useState(20);


  const withTimeout = (promise, timeout = 10000) => {
    return Promise.race([
      promise,
      new Promise((_, reject) => setTimeout(() => reject(new Error("Request timed out")), timeout)),
    ]);
  };

  const fetchCompanies = async (lastEvaluatedKey = null) => {
    if (!isConnected || loading || loadingMore) return;

    lastEvaluatedKey ? setLoadingMore(true) : setLoading(true);

    try {
      const requestData = {
        command: "listAllCompanies",
        limit: fetchLimit,
        ...(lastEvaluatedKey && { lastEvaluatedKey }),
      };

      const res = await withTimeout(apiClient.post('/listAllCompanies', requestData), 10000);

      const companies = res.data.response || [];
      setCompanyCount(res.data.count);
      if (!companies.length) {
        setLastEvaluatedKey(null);
        setHasMoreCompanies(false);
        return;
      }


        const CompaniesWithImg = await Promise.all(
          companies.map(async (company) => {
            if (company.fileKey) {
              const imageObj = await getSignedUrl(company.company_id, company.fileKey);
              company.imageUrl = imageObj[company.company_id];
            }
            return company;
          })
        );
 
      setCompanies(prev => {
        const existingIds = new Set(prev.map(c => c.company_id));
        const newUniqueCompanies = CompaniesWithImg.filter(c => !existingIds.has(c.company_id));
        return [...prev, ...newUniqueCompanies];
      });

      setLastEvaluatedKey(res.data.lastEvaluatedKey || null);
      setHasMoreCompanies(!!res.data.lastEvaluatedKey);

    } catch (error) {
      console.error('❌ Error in fetchCompanies:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };


  useEffect(() => {
    fetchCompanies();
  }, []);



  const handleRefresh = useCallback(async () => {
    if (!isConnected) {

      return;
    }
    setIsRefreshing(true);
    setSearchQuery('');

    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }

    setCompanies([]);

    setCompanyImageUrls({});
    setHasMoreCompanies(true);
    setLastEvaluatedKey(null);

    await fetchCompanies();
    setIsRefreshing(false);
  }, []);


  const debounceTimeout = useRef(null);

  const handleDebouncedTextChange = useCallback((text) => {
    setSearchQuery(text);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    const trimmedText = text.trim();

    if (trimmedText === '') {
      setSearchTriggered(false);
      setSearchResults([]);
      return;
    }

    debounceTimeout.current = setTimeout(() => {
      handleSearch(trimmedText);  // Call actual search function
    }, 300);
  }, [handleSearch]);



  const handleSearch = async (text) => {
    setSearchQuery(text);

    if (text.trim() === '') {
      setSearchResults([]);
      setSearchCount(0);
      return;
    }

    try {
      const requestData = {
        command: 'searchCompanies',
        searchQuery: text.trim(),
      };

      const res = await withTimeout(apiClient.post('/searchCompanies', requestData), 10000);
      const companies = res?.data?.response || [];
      const count = res?.data?.count || companies.length;
      scrollViewRef.current?.scrollToOffset({ offset: 0, animated: true });

      // Only fetch signed URLs for companies that have a fileKey
      const companiesWithFileKey = companies.filter(company => company.fileKey);
      const urlPromises = companiesWithFileKey.map(company =>
        getSignedUrl(company.company_id, company.fileKey)
      );
      const signedUrlsArray = await Promise.all(urlPromises);
      const signedUrlMap = Object.assign({}, ...signedUrlsArray);

      const companiesWithImage = companies.map(company => {
        const baseCompany = {
          ...company,
          // Only set imageUrl if fileKey exists
          imageUrl: company.fileKey ? (signedUrlMap[company.company_id] || defaultImage) : null,
        };

        return company.fileKey ? baseCompany : {
          ...baseCompany,

        };
      });

      setSearchResults(companiesWithImage);
      setSearchCount(count);

    } catch (error) {
      console.error('[handleSearch] Error searching companies:', error);
      showToast('Something went wrong. Please try again.', 'error');
    } finally {
      setSearchTriggered(true);
    }
  };



  const shareJob = async (company) => {
    if (!company?.company_id) {

      return;
    }

    try {
      const baseUrl = 'https://bmebharat.com/company/';
      const companyUrl = `${baseUrl}${company.company_id}`;

      const result = await Share.share({
        message: `Checkout this company: ${companyUrl}`,
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {

        } else {

        }
      } else if (result.action === Share.dismissedAction) {

      }
    } catch (error) {

    }
  };


  const navigateToDetails = (company) => {
    navigation.navigate('CompanyDetails', { userId: company.company_id, profile: company });
  };


  const renderCompanyItem = ({ item, index }) => {
    if (!item) return

  
    return (

      <TouchableOpacity style={styles.card} activeOpacity={1} onPress={() => navigateToDetails(item)} >

        <View style={AppStyles.cardImage1} >


          <Avatar
            imageUrl={item?.imageUrl}
            name={item?.company_name}
            size={100}
          />
        </View>
        <View style={styles.textContainer}>

          <View style={styles.row}>
            <View style={styles.labelAndIconContainer}>
              <Company width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.secondary} />

              <Text style={commonStyles.label}> Company </Text>
            </View>
            <Text style={commonStyles.colon}>:</Text>

            <Text style={commonStyles.value}>
              <Text numberOfLines={1} style={styles.companyName}>{highlightMatch(item?.company_name || '', searchQuery)}</Text>

            </Text>
          </View>
          <View style={styles.row}>
            <View style={styles.labelAndIconContainer}>
              <Category width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.secondary} />

              <Text style={commonStyles.label}> Category </Text>
            </View>
            <Text style={commonStyles.colon}>:</Text>

            <Text numberOfLines={1} style={commonStyles.value}>
              {highlightMatch(item?.category || '', searchQuery)}
            </Text>
          </View>
          <View style={styles.row}>
            <View style={styles.labelAndIconContainer}>
              <Location width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.secondary} />

              <Text style={commonStyles.label}> City          </Text>
            </View>
            <Text style={commonStyles.colon}>:</Text>

            <Text style={commonStyles.value}>
              {highlightMatch(item?.company_located_city || '', searchQuery)}
            </Text>
          </View>
          <View style={styles.row}>
            <View style={styles.labelAndIconContainer}>
              <Location width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.secondary} />

              <Text style={commonStyles.label}> State       </Text>
            </View>
            <Text style={commonStyles.colon}>:</Text>

            <Text style={commonStyles.value}>
              {highlightMatch(item?.company_located_state || '', searchQuery)}
            </Text>
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.viewMoreButton} onPress={() => navigateToDetails(item)}>
              <Text style={styles.viewMore}>See more...</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => shareJob(item)} style={styles.shareButton}>
              <ShareIcon width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />

            </TouchableOpacity>
          </View>

        </View>

      </TouchableOpacity>

    );
  };

  return (
    <>
      <Animated.View style={[AppStyles.toolbar, toolbarBgStyle]}>

        <Animated.View style={[AppStyles.searchRow, headerStyle]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={AppStyles.backButton} activeOpacity={1}>
            <ArrowLeftIcon width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.text_white} />

          </TouchableOpacity>
          <View style={AppStyles.searchBar}>
            <Search width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.text_secondary} />

            <TextInput
              ref={searchInputRef}
              placeholder="Search companies..."
              style={AppStyles.searchInput}
              placeholderTextColor={colors.text_secondary}
              value={searchQuery}
              onChangeText={handleDebouncedTextChange}
            />
          </View>
        </Animated.View>

      </Animated.View>


      {!loading ? (
        <Animated.FlatList
          data={!searchTriggered || searchQuery.trim() === '' ? companies : searchResults}
          renderItem={renderCompanyItem}
          ref={scrollViewRef}
          onScroll={onScroll}
          overScrollMode={'never'}
          scrollEventThrottle={16}
          keyExtractor={(item, index) => `${item.company_id}-${index}`}
          onEndReached={() => {
            if (!searchQuery && hasMoreCompanies && !loadingMore) {
              fetchCompanies(lastEvaluatedKey);
            }
          }}

          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}

          onScrollBeginDrag={() => {
            Keyboard.dismiss();
            searchInputRef.current?.blur?.();

          }}
          ListFooterComponent={() =>
            loadingMore && (
              <View style={styles.loaderContainer}>
                <ActivityIndicator size="small" color="#075cab" />
              </View>
            )
          }
          ListHeaderComponent={
            <View>
              {searchTriggered && (
                <>
                  <Text style={styles.companyCount}>
                    {searchTriggered && `${searchResults.length} companies found`}
                  </Text>
                </>
              )}
            </View>
          }


          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh}
               />
          }
          ListEmptyComponent={
            (!searchTriggered && companies.length === 0) ||
              (searchTriggered && searchResults.length === 0) ? (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text style={{ fontSize: 16, color: '#666' }}>No companies found</Text>
              </View>
            ) : null
          }
        />


      ) : (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#075cab" />
        </View>
      )}

    </>

  )

};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    

  },

  loaderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingBottom: 20
  },

  shareButton: {
    // marginTop: 15,
    // alignSelf: 'flex-end',
    padding: 10,
    marginLeft: 10,
  },

  labelAndIconContainer: {
    flexDirection: 'row',
    flex: 1, // Take up available space
    color: 'black',
    fontWeight: '500',
    fontSize: 15,
    textAlign: 'left', // Align text to the left
    alignSelf: 'flex-start',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,

  },

  value: {
    flex: 2, // Take the remaining space
    flexShrink: 1,
    color: 'black',
    fontWeight: '400',
    fontSize: 15,
    textAlign: 'left', // Align text to the left
    alignSelf: 'flex-start',
  },

  

  jobCount: {
    fontSize: 13,
    fontWeight: '300',
    marginVertical: 10,
    marginHorizontal: 10,
    color: 'black',
  },

  refreshIconContainer: {
    marginLeft: 10,
  },
  companyCount: {
    fontSize: 14,
    fontWeight: '400',
    color: 'black',
    padding: 5,
    paddingHorizontal: 15,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    top: -12
  },

  createPostButton: {
    position: 'absolute',
    top: -140,
    right: -5,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    top: 5,
    marginBottom: 5,
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginHorizontal: 5
  },

  cardImage: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    margin: 'auto',
  },
  cardImage1: {
    width: 140,
    height: 140,
    borderRadius: 100,
    alignSelf: 'center',
    marginTop: 10,
  },

  textContainer: {
    paddingHorizontal: 10,
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'row',        // Align buttons in a row
    justifyContent: 'space-between',  // Spread buttons across the row
    // marginTop: 10,               // Add top margin for some space
    alignItems: 'center',        // Vertically center buttons
  },
  viewMoreButton: {
    // marginTop: 10,
    // backgroundColor: COLORS.primary,
    // borderRadius: 4,
    flex: 1,
    // marginRight: 10,
  },
  viewMore: {
    // padding: 20,
    color: "#075cab",
    textAlign: 'left',
    fontSize: 15,
    fontWeight: '500',
  },
  noCompaniesText: {
    color: 'black', margin: 'auto', textAlign: "center", marginTop: 300, fontSize: 18, fontWeight: '400'
  },

  scrollView: {
    flex: 1,
    paddingHorizontal: 10,
  },
});

export default CompanyListScreen;