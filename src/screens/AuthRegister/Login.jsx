


import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, FlatList, TextInput, StatusBar, StyleSheet, Image, TouchableWithoutFeedback } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { COLORS, CountryCodes } from '../../assets/Constants';
import MerticalIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import logo_png from '../../images/homepage/logo.jpeg';
import { Keyboard } from 'react-native';
import { Image as FastImage } from 'react-native';
import { showToast } from '../AppUtils/CustomToast';
import apiClient from '../ApiClient';
import ArrowDown from '../../assets/svgIcons/arrow-down.svg';
import Phone from '../../assets/svgIcons/phone.svg';
import Email from '../../assets/svgIcons/mail.svg';

import { colors, dimensions } from '../../assets/theme.jsx';
import { useFcmToken } from '../AppUtils/fcmToken.jsx';

const LoginPhoneScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [countryCode, setCountryCode] = useState('+91');
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [modalVisible, setModalVisible] = useState(false);
  const [countryVerify, setCountryVerify] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [isPhoneLogin, setIsPhoneLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const { fcmToken, refreshFcmToken } = useFcmToken();


  const handleCountrySelection = (country) => {
    setCountryCode(country.value);
    setSelectedCountry(country.label);
    setCountryVerify(country.value !== '');
    setModalVisible(false);
  };


  const sendOTPHandle = async () => {
    if (!phone) {
      showToast("Please enter a valid phone number or email Id", 'error');
      return;
    }

    setLoading(true);

    try {
      let loginData, otpData;

      if (isPhoneLogin) {
        const fullPhoneNumber = `${countryCode}${phone}`;

        loginData = await apiClient.post('/loginUser', {
          command: 'loginUser',
          user_phone_number: fullPhoneNumber,
        });

        if (loginData.data.status === 'success') {
          const { user_id: userId } = loginData.data.login_user_details;

          otpData = await apiClient.post('/sendVerifyOtpMsg91', {
            command: 'sendVerifyOtpMsg91',
            user_phone_number: fullPhoneNumber,
          });

          if (otpData.data.type === 'success') {
            showToast("OTP sent", 'success');
            navigation.navigate('LoginVerifyOTP', { fullPhoneNumber, userid: String(userId) });
          } else {
            throw new Error('Failed to send OTP to phone. Please try again.');
          }
        } else {
          throw new Error('User does not exist with this phone number.');
        }

      } else {
        loginData = await apiClient.post('/loginUser', {
          command: 'loginUser',
          email: phone,
        });

        if (loginData.data.status === 'success') {
          const { user_id: userId } = loginData.data.login_user_details;

          const res = await apiClient.post('/sendEmailOtp', {
            command: 'sendEmailOtp',
            email: phone,
          });

          if (res.data.status === 'success') {
            showToast("OTP sent", 'success');
            navigation.navigate('LoginVerifyOTP', { phone, userid: String(userId) });
          } else {
            throw new Error('Failed to send OTP to email. Please try again.');
          }
        } else {
          console.log(loginData.data.errorMessage)
          throw new Error('User does not exist with this email.');
        }
      }
    } catch (error) {
      showToast(error.message, 'info');
    } finally {
      setLoading(false);
      Keyboard.dismiss();
    }
  };




  const handleLoginMethodSwitch = () => {
    setIsPhoneLogin(!isPhoneLogin); // Toggle the login method
    setPhone(''); // Reset the phone/email input
    setPhoneError(''); // Reset any phone errors
    setEmailError(''); // Reset any email errors
  };


  useLayoutEffect(() => {
    navigation.setOptions({
      gestureEnabled: false, // disables swipe back on iOS
      headerLeft: () => null, // hides back button
    });
  }, [navigation]);


  return (
    <View style={styles.container}>
      <StatusBar
        barStyle='light-content'
        backgroundColor="#075cab"
      />
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => Keyboard.dismiss()}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <FastImage source={logo_png} style={styles.logo} resizeMode="contain" />
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <Text style={styles.title}>Login</Text>

          {/* Input Container */}
          <View style={styles.phoneInputContainer}>
            {isPhoneLogin && (
              <View style={styles.countryCodeContainer}>
                <TouchableOpacity style={styles.countrySelector} onPress={() => setModalVisible(true)}>
                  <Text style={styles.countryCodeText}>
                    {selectedCountry} <ArrowDown width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View style={styles.phoneInputFlex}>
              {isPhoneLogin ? (
                <Phone width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />
              ) : (
                <Email width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />
              )}

              <TextInput
                style={styles.input}
                placeholder={isPhoneLogin ? "Phone number" : "Enter your email"}
                onChangeText={(text) => {
                  if (isPhoneLogin) {
                    const formattedText = text.replace(/\D/g, '').slice(0, 10);
                    setPhone(formattedText);
                    if (formattedText.length === 10) Keyboard.dismiss();
                  } else {
                    setPhone(text.trim());
                  }
                }}
                keyboardType={isPhoneLogin ? "numeric" : "email-address"}
                placeholderTextColor="gray"
                value={phone}
                textContentType="oneTimeCode"
                autoFocus
              />
            </View>

            {/* Country Modal */}
            <Modal
              transparent={true}
              visible={modalVisible}
              animationType="slide"
              onRequestClose={() => setModalVisible(false)}
            >
              <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                <View style={styles.modalBackground}>
                  <View style={styles.modalContainer}>
                    <FlatList
                      data={CountryCodes}
                      keyExtractor={(item, index) => `${item.label}-${item.value}-${index}`}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={styles.countryItem}
                          onPress={() => handleCountrySelection(item)}
                        >
                          <Text style={styles.countryItemText}>{item.label} ({item.value})</Text>
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </Modal>
          </View>

          {/* Error Messages */}
          {isPhoneLogin ? (
            phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null
          ) : (
            emailError ? <Text style={styles.errorText}>{emailError}</Text> : null
          )}

          {/* Switch Login */}
          <TouchableOpacity onPress={handleLoginMethodSwitch} style={styles.switchLoginButton}>
            <Text style={styles.switchLoginText}>
              Login with <Text style={styles.switchLoginHighlight}>{isPhoneLogin ? 'Email' : 'phone number'}</Text> instead
            </Text>
          </TouchableOpacity>

          {/* Send OTP */}
          <TouchableOpacity onPress={sendOTPHandle} disabled={loading} style={styles.sendOtpButton}>
            <Text style={[styles.sendOtpText, loading && { opacity: 0.5 }]}>
              {loading ? 'Sending...' : 'Send OTP'}
            </Text>
          </TouchableOpacity>

          {/* Register */}
          <TouchableOpacity style={styles.registerButton} activeOpacity={1}>
            <Text style={styles.registerText}>
              Don't have an account? <Text style={styles.registerLink} onPress={() => navigation.navigate('Register')}>Register</Text>
            </Text>
          </TouchableOpacity>

          {/* Policy Links */}
          <View style={styles.policyContainer}>
            <TouchableOpacity style={styles.policyButton} onPress={() => navigation.navigate('PrivacyPolicy')}>
              <Text style={styles.policyText}>Privacy Policy</Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <TouchableOpacity style={styles.policyButton} onPress={() => navigation.navigate('TermsAndConditions')}>
              <Text style={styles.policyText}>Terms And Conditions</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scrollContainer: { paddingTop: 50, paddingHorizontal: 20 },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 200, height: 200 },
  formContainer: { paddingHorizontal: 10 },
  title: { color: '#075cab', fontSize: 23, fontWeight: '500', textAlign: 'center', marginBottom: 15 },

  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#075cab',
    height: 50,
    marginBottom: 10,
  },
  countryCodeContainer: { width: '20%', alignItems: 'center', justifyContent: 'center', borderRightWidth: 1, borderRightColor: '#075cab', height: '100%' },
  countrySelector: { width: '100%', alignItems: 'center', justifyContent: 'center' },
  countryCodeText: { fontSize: 16, color: 'black', textAlign: 'center' },
  phoneInputFlex: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10 },
  input: { flex: 1, fontSize: 14, fontWeight: '500', color: 'black', paddingHorizontal: 10, height: '100%' },

  errorText: { color: 'red', textAlign: 'center', marginVertical: 8 },

  switchLoginButton: { alignSelf: 'center', marginTop: 15 },
  switchLoginText: { fontSize: 15, color: 'black' },
  switchLoginHighlight: { color: '#075cab', fontWeight: '500' },

  sendOtpButton: { alignSelf: 'center', marginTop: 20 },
  sendOtpText: { fontSize: 20, color: '#075cab', fontWeight: '500', padding: 14, borderRadius: 10, textAlign: 'center' },

  registerButton: { alignSelf: 'center', marginTop: 15 },
  registerText: { color: 'black', fontSize: 15 },
  registerLink: { color: '#075cab', fontWeight: '500' },

  policyContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 20 },
  policyButton: { paddingHorizontal: 10 },
  policyText: { color: '#075cab', fontSize: 16, textAlign: 'center' },
  divider: { width: 1, height: 20, backgroundColor: '#075cab', marginHorizontal: 10 },

  modalBackground: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContainer: { width: '70%', backgroundColor: 'white', borderRadius: 10, maxHeight: 300 },
  countryItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  countryItemText: { fontSize: 16, color: 'black' },
});

export default LoginPhoneScreen;
