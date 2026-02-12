

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, TextInput, Modal, FlatList, Linking, Pressable, RefreshControl, ActivityIndicator, Alert } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import RNRestart from 'react-native-restart';


import Message from '../../components/Message';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '../AppUtils/CustomToast';
import { useFileOpener } from '../helperComponents/fileViewer';
import apiClient from '../ApiClient';
import { useNetwork } from '../AppUtils/IdProvider';
import { openMediaViewer } from '../helperComponents/mediaViewer';
import { updateLastSeen } from '../AppUtils/LastSeen';
import { OtpInput } from "react-native-otp-entry";
import { openLink } from '../AppUtils/openLinks';
import EditIcon from '../../assets/svgIcons/edit.svg';
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import Logout from '../../assets/svgIcons/logout.svg';
import Account from '../../assets/svgIcons/account.svg';
import Add from '../../assets/svgIcons/add.svg';
import Sucess from '../../assets/svgIcons/success.svg';
import Close from '../../assets/svgIcons/close.svg';
import Warning from '../../assets/svgIcons/warning.svg';
import defaultImage from '../../images/homepage/buliding.jpg';
import Job from '../../assets/svgIcons/jobs.svg';

import { colors, dimensions } from '../../assets/theme.jsx';
import AppStyles, { commonStyles } from '../AppUtils/AppStyles.js';
import { useLogoutManager } from '../AppUtils/useLogoutManager.jsx';
import Avatar from '../helperComponents/Avatar.jsx';
import { smartGoBack } from '../../navigation/smartGoBack.jsx';
import { AppHeader } from '../AppUtils/AppHeader.jsx';
import MaterialIcons from '@react-native-vector-icons/material-icons';

const CompanyProfileScreen = ({ route }) => {
  const navigation = useNavigation();
  const profile = useSelector(state => state.CompanyProfile.profile);
  const { myId } = useNetwork();
  const profileUserId = route.params?.userId ?? myId
  const isMyProfile = profileUserId === myId
  const [isProductDropdownVisible, setProductDropdownVisible] = useState(false);
  const [isServiceDropdownVisible, setServiceDropdownVisible] = useState(false);

  const [isLogoutModalVisible, setLogoutModalVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);

  const { openFile } = useFileOpener();
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);
  const { logoutNow } = useLogoutManager();

  const handleOpenResume = async () => {
    if (!profile?.brochureKey) return;
    setLoading1(true);
    try {
      await openFile(profile?.brochureKey);
    } finally {
      setLoading1(false);
    }
  };

  const navigateToDetails = (product) => {
    navigation.navigate('ProductDetails', { product_id: product.product_id, company_id: product.company_id });

  };

  const navigateToServiceDetails = (service) => {
    navigation.navigate('ServiceDetails', { service_id: service.service_id, company_id: service.company_id });

  };
  const handleAddProduct = () => {
    setProductDropdownVisible(false);
    setTimeout(() => {
      navigation.navigate('CreateProduct')
    }, 300);
  };

  const handleAddService = () => {
    setServiceDropdownVisible(false);
    setTimeout(() => {
      navigation.navigate('CreateService')
    }, 300);
  };


  const fetchProducts = async () => {
    setLoading(true);
    const payload = {
      command: 'getProductsByCompanyId',
      company_id: myId,
    };


    try {
      const response = await apiClient.post('/getProductsByCompanyId', payload);

      const data = response.data;
      if (data.status === 'success' && Array.isArray(data.response)) {
        setProducts(data.response);
      } else {
        setProducts([]);
      }
    } catch (error) {

      setProducts([]);

    }
    setLoading(false);

  };


  const fetchServices = async () => {
    setLoading(true);
    const payload = {
      command: 'getServicesByCompanyId',
      company_id: myId,
    };

    try {
      const response = await apiClient.post('/getServicesByCompanyId', payload);

      const data = response.data;

      if (data.status === 'success' && Array.isArray(data.response)) {
        setServices(data.response);

      } else {
        setServices([]);
      }
    } catch (error) {

      setServices([]);
    }
    setLoading(false);
  };


  useEffect(() => {
    if (isServiceDropdownVisible) {
      fetchServices();
    }
  }, [isServiceDropdownVisible]);

  useEffect(() => {
    if (isProductDropdownVisible) {
      fetchProducts();
    }
  }, [isProductDropdownVisible]);



  const openLogoutModal = () => {
    setLogoutModalVisible(true);
  };

  const handleProductSelect = (product) => {
    setProductDropdownVisible(false);
    navigateToDetails(product);
  };

  const handleSevicesSelect = (service) => {
    setServiceDropdownVisible(false);
    navigateToServiceDetails(service);
  };


  const handleUpdate = () => {
    navigation.navigate('CompanyProfileUpdate', {
      profile,
      imageUrl: profile?.imageUrl,
    });
  };



  if (!profile) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#075cab" />
      </View>
    );
  }

  const Row = ({ icon, label, value, isLink = false, verified = false }) => {

    const handlePress = async () => {
      if (!isLink || !value) return;

      let url = value.trim();

      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
      }

      try {
        const supported = await Linking.canOpenURL(url);
        if (supported) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Invalid URL', 'Cannot open this website');
        }
      } catch (err) {
        Alert.alert('Error', 'Failed to open website');
      }
    };

    return (
      <TouchableOpacity
        activeOpacity={isLink ? 0.7 : 1}
        style={styles.row}
        onPress={isLink ? handlePress : undefined}
        disabled={!isLink}
      >
        <View style={styles.left}>
          <View style={styles.iconWrap}>
            <MaterialIcons
              name={icon}
              size={20}
              color={isLink ? '#1a73e8' : '#000'}
            />
          </View>

          <View style={styles.textWrap}>
            <Text
              style={[
                styles.value,
                isLink && { color: '#1a73e8', textDecorationLine: 'underline' },
              ]}
            >
              {value}
            </Text>
            {verified && (
              <MaterialIcons
                name="verified"
                size={16}
                color="#2ecc71"   // green verified
                style={{ marginLeft: 6 }}
              />
            )}

            <Text style={styles.label}>{label}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };


  return (

    <View style={styles.container}>


      <AppHeader
        title={profile?.company_name}
        onEdit={handleUpdate}
      />

      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingHorizontal: 16 }}>

        <View style={styles.profileBox}>


          <TouchableOpacity activeOpacity={1} onPress={() => openMediaViewer([{ type: 'image', url: profile?.imageUrl }])}
            style={styles.imageContainer} >
            <Avatar
              imageUrl={profile?.imageUrl}
              name={profile?.company_name}
              size={60}
              radius={8}
            />
          </TouchableOpacity>


          <View style={styles.textContainer}>
            <Text style={[styles.title]} numberOfLines={1} ellipsizeMode='tail'>
              {profile?.company_name}
            </Text>
            <Text style={styles.category}>{profile?.category || ""}</Text>
          </View>

        </View>
        <Text style={styles.header}>About Me</Text>

        <Row
          icon="email"
          value={(profile?.company_email_id || "").trimStart().trimEnd()}
          label="E-mail Address"
          verified={profile?.is_email_verified === true}

        />

        <Row
          icon="phone"
          value={profile?.company_contact_number}
          label="Business phone no."
        />
        <Row
          icon="app-registration"
          value={profile?.business_registration_number}
          label="CIN / Business registration number"
        />
        {profile?.company_address && (
          <Row
            icon="location-on"
            value={profile.company_address.trimStart().trimEnd()}
            label="Company address"
          />
        )}

        <Row
          icon="location-on"
          value={`${profile?.company_located_city || ''}, ${profile?.company_located_state || ''}`.trim()}
          label="Location"
        />

        <Row
          icon="person"
          value={profile?.select_your_profile}
          label="Profile"
        />
        <Row
          icon="category"
          value={profile?.category}
          label="Category"
        />
        {profile?.Website && (
          <Row
            icon="open-in-new"
            value={profile.Website.trim()}
            label="Website"
            isLink
          />
        )}
        {profile?.company_description && (

          <Row
            icon="description"
            value={profile?.company_description}
            label="Description"
          />
        )}
        <TouchableOpacity
          onPress={() => navigation.navigate('Timeline', { userId: profileUserId, profileType: "company", })}
          style={styles.halfButtonPrimary}
        >
          <View style={{ flexDirection: 'row' }}>
            <MaterialIcons
              name="timeline"
              size={20}
              color={colors.primary}
              style={styles.icon}
            />
            <Text
              style={styles.buttonTextPrimary}>Timeline</Text>
          </View>

          <MaterialIcons name='chevron-right' size={26} color={colors.primary} />

        </TouchableOpacity>

        <View style={styles.rowContainer}>

          {
            profile?.brochureKey &&
            (<TouchableOpacity onPress={handleOpenResume} disabled={loading} style={styles.tabButton}>
              {loading1 ? (
                <ActivityIndicator size="small" color="#075cab" style={styles.pdfButtonText} />
              ) : (
                <Text style={styles.tabButtonText} numberOfLines={1}>View Catalogue</Text>
              )}
            </TouchableOpacity>)
          }
          <TouchableOpacity
            activeOpacity={1}
            style={[styles.tabButton]}
            onPress={() => setProductDropdownVisible(true)}
          >
            <Text style={styles.tabButtonText} numberOfLines={1}>Products</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={1}
            style={[styles.tabButton]}
            onPress={() => setServiceDropdownVisible(true)}
          >
            <Text style={styles.tabButtonText} numberOfLines={1}>Services</Text>
          </TouchableOpacity>
        </View>




        <TouchableOpacity style={styles.halfButtonDelete} onPress={openLogoutModal}>
          <MaterialIcons
            name="logout"
            size={20}
            color={colors.danger}
            style={styles.icon}
          />
          <Text style={styles.buttonTextDelete} numberOfLines={1} ellipsizeMode='tail'>Logout</Text>

        </TouchableOpacity>



      </ScrollView>

      <Modal
        transparent={true}
        visible={isProductDropdownVisible}
        onRequestClose={() => setProductDropdownVisible(false)}
      >
        <Pressable style={styles.modalContainer} onPress={() => setProductDropdownVisible(false)}>
          <View style={styles.modalContent}>
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                {products.length === 0 ? (
                  <Text style={styles.noServicesText}>No products available</Text>
                ) : (
                  <FlatList
                    data={products}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        activeOpacity={1}
                        style={styles.dropdownItem}
                        onPress={() => handleProductSelect(item)}
                      >
                        <Text style={styles.dropdownItemText}>
                          🛒 {item.title || 'Unnamed Product'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                  />
                )}

                {/* Add Product Button */}
                <TouchableOpacity style={styles.addProductButton} onPress={handleAddProduct}>
                  <Add width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />

                  <Text style={styles.addProductText}>Add Product</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>



      <Modal
        transparent={true}
        visible={isServiceDropdownVisible}
        onRequestClose={() => setServiceDropdownVisible(false)}
      >
        <Pressable style={styles.modalContainer} onPress={() => setServiceDropdownVisible(false)}>
          <View style={styles.modalContent}>
            {loading ? (
              <ActivityIndicator size="small" color="#000" />
            ) : (
              <>
                {services.length === 0 ? (
                  <Text style={styles.noServicesText}>No services available</Text>
                ) : (
                  <FlatList
                    data={services}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        activeOpacity={1}
                        style={styles.dropdownItem}
                        onPress={() => handleSevicesSelect(item)}
                      >
                        <Text style={styles.dropdownItemText}>
                          🛠️ {item.title || 'Unnamed Services'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    keyExtractor={(item, index) => index.toString()}
                  />
                )}

                {/* Add Service Button */}
                <TouchableOpacity style={styles.addProductButton} onPress={handleAddService}>
                  <Add width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />

                  <Text style={styles.addProductText}>Add Service</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
      {isLogoutModalVisible && (
        <Message
          visible={isLogoutModalVisible}
          onClose={() => setLogoutModalVisible(false)}
          onCancel={() => setLogoutModalVisible(false)}
          onOk={() => {
            setLogoutModalVisible(false);
            logoutNow();
          }}
          title="Confirm Logout"
          message="Are you sure you want to logout?"
          iconType="warning"
        />
      )}



    </View >

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  noServicesText: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
    fontSize: 16,
  },

  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',

  },
  noProductsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'black',
    fontWeight: '500',
    marginBottom: 100
  },

  backButton: {
    alignSelf: 'flex-start',
    padding: 10,

  },

  circle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: 10,
    padding: 10,
    // marginTop: 10,
    borderRadius: 8,
  },

  shareText: {
    color: '#075cab',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 4,

  },



  scrollViewContent: {
    elevation: 1,
    backgroundColor: 'white'
  },


  label: {
    flex: 1, // Take up available space
    color: 'black',
    fontWeight: '500',
    fontSize: 15,
    textAlign: 'left', // Align text to the left
    alignSelf: 'flex-start',
  },




  addProductButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  addProductText: {
    fontSize: 16,
    color: '#075cab',
    marginLeft: 8,
  },

  productImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginTop: 10,

  },
  serviceImage: {
    width: '100%',
    height: 150,
    borderRadius: 10,
    marginTop: 10,

  },

  signOutButton: {
    padding: 10,
    flexDirection: 'row',
    marginTop: 5,
    alignItems: 'center',

  },
  signOutButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',


  },
  deleteAccountButton: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  deleteAccountButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },

  modalContainerImage: { flex: 1, backgroundColor: 'black' },
  modalContainerImage2: { flex: 1, backgroundColor: 'white' },
  closeButton1: { position: 'absolute', top: 70, right: 20 },
  modalImage: { width: '100%', height: '100%', resizeMode: 'contain' },

  imageContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginVertical: 10
  },
  category: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text_secondary,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text_primary,

  },
  textContainer: {
    marginLeft: 10,
    flex: 1
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text_primary,
    marginBottom: 8,
  },
  profileBox: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 10,

  },
  actionRow: {
    flexDirection: 'row',
    // marginVertical: 20, 
    // borderTopWidth: 1,
    // borderColor: '#e0e0e0',
    overflow: 'hidden',
    // backgroundColor: 'red'
    top: 2
  },
  centerDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',   // 👈 vertical center line
  },
  halfButtonDelete: {
    flex: 1,               // 👈 takes half
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    // borderWidth: 1,
    // borderColor: colors.danger,
    backgroundColor: '#f2f2f2',
  },

  halfButtonPrimary: {
    flex: 1,               // 👈 takes half
    flexDirection: 'row',
    paddingVertical: 14,

    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#e2e2e2',
    // backgroundColor: '#fff',
  },

  buttonTextPrimary: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.primary,
  },
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    marginRight: 6,
  },

  buttonTextDelete: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.danger,
  },

  detailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    overflow: 'hidden',

  },

  avatarContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  avatarText: {
    fontSize: 50,
    fontWeight: 'bold',
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // or 'flex-start'
    gap: 10, // RN 0.71+ (otherwise use marginRight)
    marginVertical: 10,
  },

  pdfButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#075cab',
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#075cab',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pdfButtonText: {
    color: '#075cab',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  tabButtonText: {
    color: '#075cab',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.3,
  },

  timeLine: {
    marginTop: 5,
    padding: 10,
    textDecorationLine: 'underline',
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },


  dropdownItem: {
    padding: 10,
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#000',
  },
  selectedDetailsContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    elevation: 4, // Shadow for Android
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
    shadowOpacity: 0.2, // Shadow opacity for iOS
    shadowRadius: 4, // Shadow radius for iOS
  },

  modalContainer1: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',

  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  closeIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  warningContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 50,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5, // Add shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },

  deletionText: {
    fontSize: 14,
    color: 'black',
    textAlign: 'justify',
    lineHeight: 23,
    marginBottom: 25,
    fontWeight: '500'
  },
  deletionText1: {
    fontSize: 16,
    color: 'black',
    textAlign: 'justify',
    lineHeight: 22,
    marginBottom: 25,
    fontWeight: '500',
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 20,
    marginTop: 15,
  },
  confirmButton: {
    // backgroundColor: '#e53935',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginHorizontal: 10,
    //  ?

  },
  confirmButtonText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  cancelButton: {
    // backgroundColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 25,
    marginHorizontal: 10,
    // borderWidth: 1,
    // borderColor: '#ccc',
  },
  cancelButtonText: {
    color: 'green',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },



  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  pinCodeContainer: {
    borderWidth: 0,
    borderColor: '#ccc',
    borderRadius: 10,
    width: 40,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activePinCodeContainer: {
    borderColor: '#075cab',
  },
  filledPinCodeContainer: {
    backgroundColor: '#eaf4ff',
    borderColor: '#075cab',
  },
  disabledPinCodeContainer: {
    backgroundColor: '#f2f2f2',
  },
  pinCodeText: {
    fontSize: 20,
    color: '#000',
    fontWeight: '400',
  },
  focusStick: {
    width: 2,
    height: 25,
    backgroundColor: '#075cab',
  },
  placeholderText: {
    color: '#aaa',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 15
  },

  resendButtonText: {
    color: '#075cab',
    fontSize: 16,
    fontWeight: '600',
    padding: 10,

  },
  timerText: {
    color: '#999',
    fontSize: 13,
    padding: 10,

  },

  infoText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
    fontWeight: '500'
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 10,
    justifyContent: 'flex-start',

  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#e2e2e2',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flexShrink: 1
  },
  value: {
    flex: 1,
    fontSize: 15,
    color: colors.text_primary,
    fontWeight: '400',
    flexWrap: 'wrap'
  },

  label: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
});

export default CompanyProfileScreen;