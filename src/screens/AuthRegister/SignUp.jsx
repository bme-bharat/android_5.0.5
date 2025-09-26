import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, useWindowDimensions, TouchableOpacity, ScrollView, Modal, StyleSheet, FlatList, TextInput, StatusBar, Image, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import logo_png from '../../images/homepage/logo.jpeg';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CountryCodes } from '../../assets/Constants';
import axios from 'axios';
import { showToast } from '../AppUtils/CustomToast';
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import Phone from '../../assets/svgIcons/phone.svg';
import Check from '../../assets/svgIcons/check.svg';
import ArrowDown from '../../assets/svgIcons/arrow-down.svg';

import { colors, dimensions } from '../../assets/theme.jsx';
const EnterPhoneScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedCategory, selectedProfile, userType } = route.params;
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState('');
  const [phoneVerify, setPhoneVerify] = useState(false);
  const [countryCode, setCountryCode] = useState('+91'); // Default country code
  const [selectedCountry, setSelectedCountry] = useState('IN'); // Default country
  const [modalVisible, setModalVisible] = useState(null); // null | 'country'
  const [countryVerify, setCountryVerify] = useState(true);
  const [isChecked, setIsChecked] = useState(false); // Checkbox state
  const [phoneNumber, setPhoneNumber] = useState(""); // Phone number state
  const { width: screenWidth } = useWindowDimensions();
  const handleCountrySelection = (country) => {
    setCountryCode(country.value); // Update country code
    setSelectedCountry(country.label);
    setCountryVerify(country.value !== '');
    setModalVisible(null); // Close modal after selection
  };

  const companyProfiles = [
    "Biomedical Engineering Company Manufacturer",
    "Dealer/Distributor",
    "Biomedical Engineering Company - Service Provider",
    "Healthcare Provider - Biomedical",
    "Academic Institution - Biomedical",
    "Regulatory Body",
    "Investor/Venture Capitalist",
    "Patient Advocate",
    "Healthcare IT Developer"
  ];

  const handlePhone = (phoneVar) => {
    setPhone(phoneVar);
    setPhoneVerify(/^[1-9]\d{9}$/.test(phoneVar));

    // Dismiss keyboard when 10 digits are entered
    if (phoneVar.length === 10) {
      Keyboard.dismiss();
    }
  };


  const sendOTPHandle = () => {
    setLoading(true); // Start loader
    const fullPhoneNumber = `${countryCode}${phone}`;

    if (!phoneVerify || !countryVerify) {

      showToast("Please enter a valid phone number\nSelect a country", 'info');

      setLoading(false);
      return;
    }

    // Check if the phone number already exists
    axios
      .post('https://h7l1568kga.execute-api.ap-south-1.amazonaws.com/dev/loginUser', {
        command: 'loginUser',
        user_phone_number: fullPhoneNumber,
      }, {
        headers: { 'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk' },
      })
      .then((res) => {
        if (res.data.status === 'success') {

          showToast("This user already exists. Login", 'info');

          setLoading(false);
        } else {
          // If user does not exist, send OTP
          axios
            .post('https://h7l1568kga.execute-api.ap-south-1.amazonaws.com/dev/sendVerifyOtpMsg91', {
              command: 'sendVerifyOtpMsg91',
              user_phone_number: fullPhoneNumber,
            }, {
              headers: { 'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk' },
            })
            .then((otpRes) => {
              if (otpRes.status === 200) {

                navigation.navigate('VerifyOTP', {
                  fullPhoneNumber,
                  selectedProfile,
                  selectedCategory,
                  userType,
                });
              } else {

                showToast("Failed to send OTP. Please try again", 'error');

                setLoading(false);
              }
            })
            .catch(() => {

              showToast("You don't have an internet connection", 'error');

              setLoading(false);
            });
        }
      })
      .catch(() => {

        showToast("You don't have an internet connection", 'error');
        setLoading(false);
      });
  };

  const renderInstructionText = () => {
    if (selectedProfile && selectedCategory) {
      return companyProfiles.includes(selectedProfile) ? 'Enter your business phone number' : 'Enter your phone number';
    }
    return 'Enter phone number';
  };


  useLayoutEffect(() => {
    navigation.setOptions({
      gestureEnabled: false,
      headerLeft: () => null,
    });
  }, [navigation]);


  return (
    <View style={{ backgroundColor: '#fff', flex: 1, alignItems: 'center' }}>
   <StatusBar
        barStyle='light-content'
        backgroundColor="#075cab"
      />
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <ArrowLeftIcon width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />

      </TouchableOpacity>

      <ScrollView style={{ backgroundColor: '#fff', flexWrap: 1, }} showsVerticalScrollIndicator={false}>

        <View style={{ alignItems: 'center' }}>
          <Image source={logo_png} style={{
            width: 200,
            height: 200,
          }}
            resizeMode="contain" />
        </View>
        <View style={{ paddingTop: 20, alignSelf: 'center' }}>
          <Text style={{ color: '#000', fontSize: 19, fontWeight: 'bold' }}>
            Welcome to <Text style={{ color: '#075cab', fontSize: 19, fontWeight: 'bold' }}>BME Bharat..!</Text>
          </Text>
          <View style={{ marginVertical: 10 }} />
          <Text style={{ color: '#000', fontSize: 15, fontWeight: 'bold', marginTop: 12 }}>
            {/* Replace with your instruction rendering function */}
            {renderInstructionText()}
          </Text>
          <View style={{ marginTop: 10, }}>
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: '#075cab',
              borderRadius: 10,
              paddingHorizontal: 12,
              height: 50,
              marginTop: 10,
            }}>
              <TouchableOpacity
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingRight: 10,
                }}
                onPress={() => setModalVisible('country')}
              >
                <Text style={{ fontSize: 16, color: 'black' }}>
                  {selectedCountry}
                </Text>
                <ArrowDown width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />

              </TouchableOpacity>

              <Modal
                transparent
                visible={modalVisible === 'country'}
                animationType="slide"
                onRequestClose={() => setModalVisible(null)}
              >
                <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                  <View style={{ flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ backgroundColor: 'white', height: 400, padding: 20, borderRadius: 10, marginHorizontal: 30 }}>
                      <FlatList
                        data={CountryCodes}
                        showsVerticalScrollIndicator={false}
                        keyExtractor={(item, index) => item.value + index}
                        renderItem={({ item }) => (
                          <TouchableOpacity
                            style={{ padding: 10, borderBottomWidth: 1, borderColor: '#ccc' }}
                            onPress={() => handleCountrySelection(item)}
                          >
                            <Text style={{ color: 'black', fontWeight: '400', fontSize: 13 }}>{item.label} ({item.value})</Text>
                          </TouchableOpacity>
                        )}
                      />
                    </View>
                  </View>
                </TouchableWithoutFeedback>

              </Modal>
              <View style={{
                height: '100%',
                width: 1,
                backgroundColor: '#075cab',
                // marginHorizontal: 10,
              }} />

              <View style={styles.phoneInputFlex}>
                <Phone width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />
                <TextInput
                  style={{ flex: 1, fontSize: 16, color: 'black', paddingVertical: 5, marginLeft: 10, }}
                  placeholder="Phone number"
                  onChangeText={(text) => {
                    setPhoneNumber(text); // Update phoneNumber directly
                    handlePhone(text);    // Validate the phone number
                  }}
                  keyboardType="phone-pad"
                  placeholderTextColor="gray"
                  maxLength={10}
                  value={phone}

                />

              </View>
            </View>

          </View>
          <TouchableOpacity
            onPress={async () => {
              setLoading(true); // Start loading
              await sendOTPHandle(); // Execute the OTP sending logic
              setTimeout(() => {
                setLoading(false); // Stop loading after 1 second
              }, 1000); // Delay for 1 second
            }}
            disabled={loading || !isChecked}
            style={{ alignSelf: 'center' }}
          >
            <Text style={[styles.buttonText, (loading || !isChecked) && { opacity: 0.5 }]}>
              {loading ? 'Sending...' : 'Send OTP'}
            </Text>
          </TouchableOpacity>
          <View style={[styles.checkboxContainer]}>
            <TouchableOpacity onPress={() => setIsChecked(!isChecked)} style={styles.checkbox}>
              {isChecked && <Check width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.success} />
              }
            </TouchableOpacity>
            <Text style={styles.checkboxText}> Accept </Text>
            <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
              <Text style={styles.linkText}> Privacy Policy </Text>
            </TouchableOpacity>
            <Text style={styles.checkboxText}> and </Text>
            <TouchableOpacity onPress={() => navigation.navigate('TermsAndConditions')}>
              <Text style={styles.linkText}> Terms and Conditions </Text>
            </TouchableOpacity>
          </View>

        </View>

      </ScrollView>
    </View>

  );
};

const styles = StyleSheet.create({
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  checkbox: {
    // borderRadius: 8,
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    fontWeight: '500',
    color: 'black'
  },
  phoneInputFlex: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,

  },
  checkboxText: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  linkText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#075cab',
    textDecorationLine: 'underline'
  },
  buttonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: "500",
    color: '#075cab',
    paddingTop: 20,
    borderRadius: 10,
    textAlign: 'center',
    marginVertical: 5,
  },
  backButton: {
    padding: 10,

    alignSelf: 'flex-start',
  }


})

export default EnterPhoneScreen;