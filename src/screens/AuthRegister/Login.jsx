


import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, FlatList, TextInput, StatusBar, StyleSheet, Image, TouchableWithoutFeedback, Button } from 'react-native';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';
import { COLORS, CountryCodes } from '../../assets/Constants';
import logo_png from '../../images/homepage/bmelogo.jpeg';
import { Keyboard } from 'react-native';
import { Image as FastImage } from 'react-native';
import { showToast } from '../AppUtils/CustomToast';
import apiClient from '../ApiClient';
import ArrowDown from '../../assets/svgIcons/arrow-down.svg';
import Phone from '../../assets/svgIcons/phone.svg';
import Email from '../../assets/svgIcons/mail.svg';
import { colors, dimensions } from '../../assets/theme.jsx';
import { useFcmToken } from '../AppUtils/fcmToken.jsx';
import { startSmsListener, addSmsListener } from '../SmsRetriever.js';
import { addPhoneHintListener, requestPhoneNumber } from '../PhoneHint.js';

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

  const [message, setMessage] = useState('');
  const { fcmToken, refreshFcmToken } = useFcmToken();

  useEffect(() => {
    // Subscribe to Phone Hint events
    const removeListener = addPhoneHintListener(async (number) => {
      setPhone(number);
  
      if (number) {
        await sendOTPHandle(number);
      }
    });
  
    // Delay showing the phone hint picker
    const timer = setTimeout(() => {
      console.log("useEffect ran after 500ms");
      requestPhoneNumber();
    }, 100);
  
    // ONE cleanup function
    return () => {
      clearTimeout(timer);
      removeListener();
    };
  }, []);
  
  


  const handleCountrySelection = (country) => {
    setCountryCode(country.value);
    setSelectedCountry(country.label);
    setCountryVerify(country.value !== '');
    setModalVisible(false);
  };


  const sendOTPHandle = async (selectedNumber) => {
    const currentPhone = selectedNumber || phone; // ✅ use param if provided

    if (!currentPhone) {
      showToast("Please enter a valid phone number or email Id", 'error');
      return;
    }

    setLoading(true);

    try {
      let loginData, otpData;

      if (isPhoneLogin) {
        const fullPhoneNumber = `${countryCode}${currentPhone}`; // ✅ use currentPhone, not phone
        console.log('[sendOTPHandle] 📱 Phone login flow started with:', fullPhoneNumber);
      
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
    <View style={styles.safeArea}>
      <View style={styles.headerContainer}>
          <FastImage source={logo_png} style={styles.logo} resizeMode="contain" />
       
        <Text style={styles.headerTitle}>Welcome Back!</Text>
        {/* <Text style={styles.headerSubtitle}>Login to continue</Text> */}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Login</Text>

          {/* Input Section */}
          <View style={styles.inputWrapper}>
            {isPhoneLogin && (
              <TouchableOpacity
                style={styles.countrySelector}
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.countryCodeText}>{selectedCountry}</Text>
                <ArrowDown
                  width={dimensions.icon.small}
                  height={dimensions.icon.small}
                  color={colors.primary}
                />
              </TouchableOpacity>
            )}

            <View style={styles.inputContainer}>
              {isPhoneLogin ? (
                <Phone
                  width={dimensions.icon.medium}
                  height={dimensions.icon.medium}
                  color={colors.primary}
                />
              ) : (
                <Email
                  width={dimensions.icon.medium}
                  height={dimensions.icon.medium}
                  color={colors.primary}
                />
              )}
              <TextInput
                style={styles.input}
                placeholder={isPhoneLogin ? 'Phone number' : 'Email address'}
                keyboardType={isPhoneLogin ? 'numeric' : 'email-address'}
                placeholderTextColor="#9e9e9e"
                value={phone}
                onChangeText={(text) => {
                  if (isPhoneLogin) {
                    const formatted = text.replace(/\D/g, '').slice(0, 10);
                    setPhone(formatted);
                    if (formatted.length === 10) Keyboard.dismiss();
                  } else {
                    setPhone(text.trim());
                  }
                }}
              />
            </View>
          </View>

          {/* Error Messages */}
          {!!phoneError && isPhoneLogin && (
            <Text style={styles.errorText}>{phoneError}</Text>
          )}
          {!!emailError && !isPhoneLogin && (
            <Text style={styles.errorText}>{emailError}</Text>
          )}

          {/* Switch Login */}
          <TouchableOpacity
            onPress={handleLoginMethodSwitch}
            style={styles.switchLoginButton}
          >
            <Text style={styles.switchLoginText}>
              Login with{' '}
              <Text style={styles.switchLoginHighlight}>
                {isPhoneLogin ? 'Phone number' : 'Email'}
              </Text>{' '}
              instead
            </Text>
          </TouchableOpacity>

          {/* Send OTP */}
          <TouchableOpacity
            onPress={() => sendOTPHandle()}
            disabled={loading}
            style={[styles.sendOtpButton, loading && styles.disabledButton]}
          >
            <Text style={styles.sendOtpText}>
              {loading ? 'Sending...' : 'Send OTP'}
            </Text>
          </TouchableOpacity>

          {/* Register */}
          <TouchableOpacity style={styles.registerButton} activeOpacity={0.9}>
            <Text style={styles.registerText}>
              Don’t have an account?{' '}
              <Text
                style={styles.registerLink}
                onPress={() => navigation.navigate('Register')}
              >
                Register
              </Text>
            </Text>
          </TouchableOpacity>
        </View>

        {/* Policy Links */}
        <View style={styles.policyContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Text style={styles.policyText}>Privacy Policy</Text>
          </TouchableOpacity>

          <View style={styles.policyDivider} />

          <TouchableOpacity
            onPress={() => navigation.navigate('TermsAndConditions')}
          >
            <Text style={styles.policyText}>Terms & Conditions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Country Picker Modal */}
      <Modal
        transparent
        visible={modalVisible}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <FlatList
                data={CountryCodes}
                keyExtractor={(item, index) => `${item.value}-${index}`}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleCountrySelection(item)}
                  >
                    <Text style={styles.modalItemText}>
                      {item.label} ({item.value})
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );

};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  headerContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: colors.primary,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 12,
    backgroundColor: colors.text_white,
    borderRadius: 60,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
  },
  headerSubtitle: {
    color: '#f1f1f1',
    fontSize: 14,
    marginTop: 4,
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 40,
    marginTop:10,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    paddingVertical:30,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 28,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#dcdcdc',
    borderWidth: 1,
    borderRadius: 12,
    backgroundColor: '#fff',
    overflow: 'hidden',
    height: 50,

  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRightColor: '#dcdcdc',
    borderRightWidth: 1,
  },
  countryCodeText: {
    fontSize: 16,
    color: colors.primary,
    marginRight: 4,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight:'500',
    paddingVertical: 10,
    paddingHorizontal:15,
    color: '#333',
    
  },
  errorText: {
    color: 'red',
    fontSize: 13,
    marginTop: 6,
  },
  switchLoginButton: {
    marginTop: 16,
  },
  switchLoginText: {
    textAlign: 'center',
    color: '#555',
  },
  switchLoginHighlight: {
    color: colors.primary,
    fontWeight: '600',
  },
  sendOtpButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 24,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.6,
  },
  sendOtpText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  registerText: {
    color: '#555',
  },
  registerLink: {
    color: colors.primary,
    fontWeight: '600',
  },
  policyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    alignItems: 'center',
  },
  policyText: {
    fontSize: 13,
    color: '#777',
  },
  policyDivider: {
    width: 1,
    height: 14,
    backgroundColor: '#ccc',
    marginHorizontal: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    maxHeight: '70%',
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalItemText: {
    fontSize: 15,
    color: '#333',
  },
});



export default LoginPhoneScreen;
