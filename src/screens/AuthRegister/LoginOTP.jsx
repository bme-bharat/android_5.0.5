

import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, Keyboard,
  Platform,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';

import { showToast } from '../AppUtils/CustomToast';
import { OtpInput } from "react-native-otp-entry";
import { useFcmToken } from '../AppUtils/fcmToken';
import apiClient from '../ApiClient';
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import ArrowRight from '../../assets/svgIcons/arrow-right-circle.svg';

import { colors, dimensions } from '../../assets/theme.jsx';
import { addSmsListener, startSmsListener, useOtpRetriever } from '../SmsRetriever.js';

const LoginVerifyOTPScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { fullPhoneNumber, userid, phone } = route.params;

  const [OTP, setOTP] = useState('');
  const [timer, setTimer] = useState(30);
  const [isResendEnabled, setIsResendEnabled] = useState(false);

  const { fcmToken, refreshFcmToken } = useFcmToken();
  const [otpMode, setOtpMode] = useState("user");
  const [isProcessing, setIsProcessing] = useState(false);
  const otpInputRef = useRef(null); // 👈 reference to OTP input

  useEffect(() => {
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // When keyboard hides, blur the input to remove focus
      if (otpInputRef.current) {
        otpInputRef.current.blur();
      }
    });

    return () => {
      keyboardDidHideListener.remove();
    };
  }, []);
  
  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      setIsResendEnabled(true);
    }
  }, [timer]);



  useOtpRetriever((receivedOtp) => {
    if (receivedOtp && /^\d{6}$/.test(receivedOtp)) {
      setOtpMode("auto"); // disable manual typing
      setOTP(receivedOtp); // triggers verification via useEffect
    }
  });


  useEffect(() => {
    if (OTP.length === 6 && !isProcessing) {
      setOtpMode("auto"); // show overlay
      handleVerifyOTP(OTP);
    }
  }, [OTP]);


  const handleVerifyOTP = async (otpValue) => {
    if (isProcessing) return;
    if (!otpValue || otpValue.length !== 6) {
      showToast("Please enter a valid 6 digit OTP", "error");
      return;
    }

    setIsProcessing(true);

    try {
      let response = null;

      if (fullPhoneNumber) {
        response = await apiClient.post('/verifyOtpMsg91', {
          command: 'verifyOtpMsg91',
          otp: otpValue,
          user_phone_number: fullPhoneNumber,
        });
      } else if (phone) {
        response = await apiClient.post('/verifyEmailOtp', {
          command: 'verifyEmailOtp',
          otp: otpValue,
          email: phone,
        });
      } else {
        throw new Error("No valid phone number or email provided.");
      }

      const status = response?.data?.status || response?.data?.type;
      const message = response?.data?.message;

      if (status === "success") {
        const sessionCreated = await createUserSession(userid);

        if (!sessionCreated) {
          showToast("Failed to create session. Please try again.", "error");
          setIsProcessing(false);
          return;  // ⛔ STOP LOGIN HERE
        }
        await handleLoginSuccess(userid);
        showToast("Login Successful", 'success');
      } else {
        showToast(message || "Failed to verify OTP. Please try again", 'error');
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Please try again.";
      showToast(errorMessage, 'error');
    } finally {
      setTimeout(() => setOtpMode("user"), 400);
      setIsProcessing(false);
      setOtpMode("user"); // re-enable manual input

    }
  };


  const createUserSession = async (userId) => {
    if (!userId) {
      // console.error("❌ [User ID Missing]: Cannot create session");
      return;
    }

    const finalFcmToken = fcmToken || "FCM_NOT_AVAILABLE";
    const [deviceName, model, userAgent, ipAddress] = await Promise.allSettled([
      DeviceInfo.getDeviceName(),
      DeviceInfo.getModel(),
      DeviceInfo.getUserAgent(),
      DeviceInfo.getIpAddress(),
    ]);

    const deviceInfo = {
      os: Platform.OS,
      deviceName: deviceName.status === 'fulfilled' ? deviceName.value : 'Unknown',
      model: model.status === 'fulfilled' ? model.value : 'Unknown',
      appVersion: DeviceInfo.getVersion(),
      userAgent: userAgent.status === 'fulfilled' ? userAgent.value : 'Unknown',
      ipAddress: ipAddress.status === 'fulfilled' ? ipAddress.value : '0.0.0.0',
    };


    const payload = {
      command: "createUserSession",
      user_id: userId,
      fcm_token: finalFcmToken,
      deviceInfo: deviceInfo,
    };

    try {
      const response = await apiClient.post('/createUserSession', payload);

      if (response?.data?.status === "success") {
        const sessionId = response.data.data.session_id;
        await AsyncStorage.setItem("userSession", JSON.stringify({ sessionId }));
        return true;
      } else {
        return false; 
      }
    } catch (error) {
      return false; 
    }
  };



  const handleLoginSuccess = async (userid) => {
    try {
      const userResponse = await axios.post(
        'https://h7l1568kga.execute-api.ap-south-1.amazonaws.com/dev/getUserDetails',
        { command: "getUserDetails", user_id: userid },
        { headers: { 'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk' } }
      );

      const fetchedUserData = userResponse.data.status_message;

      const currentTime = Math.floor(Date.now() / 1000);

      if (fetchedUserData.subscription_expires_on < currentTime) {
        // Get the formatted expiration date
        const formattedExpirationDate = formatTimestamp(fetchedUserData.subscription_expires_on);

        // Show alert before navigation
        Alert.alert(
          "Your subscription has expired!",
          `Your subscription expired on ${formattedExpirationDate}. Please renew your subscription.`,
          [
            {
              text: "OK",
              onPress: () => {
                if (fetchedUserData.user_type === "company") {
                  navigation.navigate('CompanySubscriptionLogin', { userId: userid, userDetails: fetchedUserData });
                } else {
                  navigation.navigate('UserSubscriptionLogin', { userId: userid, userDetails: fetchedUserData });
                }
              }
            }
          ]
        );
        return;
      }

      switch (fetchedUserData.user_type) {
        case 'users':
          await handleNormalUser(fetchedUserData);
          break;
        case 'company':
          await handleCompanyUser(userid);
          break;
        case 'BME_ADMIN':
        case 'BME_EDITOR':
          await AsyncStorage.setItem('AdminUserData', JSON.stringify(fetchedUserData));
          // navigation.navigate('AdminBottom');
          navigation.reset({
            index: 0,
            routes: [{ name: 'AdminBottom' }],
          });

          break;
        default:

      }
    } catch (error) {

    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert to milliseconds
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are 0-indexed, so we add 1
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };


  const handleNormalUser = async (userData) => {
    try {
      await AsyncStorage.setItem('normalUserData', JSON.stringify(userData));
      // navigation.navigate('UserBottom');
      navigation.reset({
        index: 0,
        routes: [{ name: 'UserBottom' }],
      });

    } catch (error) {

      showToast("You don't have an internet connection", 'error');
    }
  };

  const handleCompanyUser = async (userid) => {
    try {
      const companyResponse = await axios.post(
        'https://h7l1568kga.execute-api.ap-south-1.amazonaws.com/dev/getCompanyDetails',
        { command: "getCompanyDetails", company_id: userid },
        { headers: { 'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk' } }
      );

      const companyData = companyResponse.data.status_message;

      const currentTime = Math.floor(Date.now() / 1000);
      if (companyData.subscription_expires_on < currentTime) {

        Alert.alert(
          "Your subscription has expired!",
          " renew your subscription."
        );
        navigation.navigate('CompanySubscriptionLogin', { userId: userid, companyDetails: companyData });
        return;
      }

      const adminApproval = companyData.admin_approval;
      if (adminApproval === "Pending") {
        Alert.alert("Please wait for admin approval");
      } else if (adminApproval === 'Approved') {
        await handleCompanyApproval(companyData);
      } else if (adminApproval === "Rejected") {
        Alert.alert("Your company has been rejected. Press OK to Delete Account");
      }
    } catch (error) {

    }
  };

  const handleCompanyApproval = async (companyData) => {
    try {

      await AsyncStorage.setItem('CompanyUserData', JSON.stringify(companyData));

      navigation.reset({
        index: 0,
        routes: [{ name: 'CompanyBottom' }],
      });

    } catch (error) {
      showToast("You don't have an internet connection", 'error');

    }
  };



  const resendHandle = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      const response = await axios.post(
        'https://h7l1568kga.execute-api.ap-south-1.amazonaws.com/dev/resendOtpMsg91',
        { command: 'resendOtpMsg91', user_phone_number: fullPhoneNumber },
        { headers: { 'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk' } }
      );
      if (response.data.type === 'success') {

        showToast("OTP sent", 'success');

        setTimer(30);
        setIsResendEnabled(false);
      } else {

        showToast("Unable to resend\nTry again later", 'error');

      }
    } catch (error) {

      showToast("Unable to resend\nTry again later", 'error');

    } finally {
      setTimeout(() => setOtpMode("user"), 400);
      setIsProcessing(false);

    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      gestureEnabled: false, // disables swipe back on iOS
      headerLeft: () => null, // hides back button
    });
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#075cab" barStyle="default" />

      <View style={styles.headerContainer}>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ArrowLeftIcon width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />

        </TouchableOpacity>

      </View>
      <View style={styles.content}>
        <Text style={styles.title}>OTP Verification</Text>

        <Text style={styles.infoText}>
          Enter OTP sent to <Text style={styles.phoneNumber}>{fullPhoneNumber || phone}</Text>
        </Text>

        <OtpInput
        ref={otpInputRef} 
          numberOfDigits={6}
          focusColor="#075cab"
          placeholder="•"
          type="numeric"
          value={OTP}
          editable={otpMode === "user"}
          onTextChange={(text) => {
            if (otpMode === "user") setOTP(text);
          }}
          theme={{
            containerStyle: styles.otpContainer,
            pinCodeContainerStyle: styles.pinCodeContainer,
            pinCodeTextStyle: styles.pinCodeText,
            focusStickStyle: styles.focusStick,
            // focusedPinCodeContainerStyle: styles.activePinCodeContainer,
            // filledPinCodeContainerStyle: styles.filledPinCodeContainer,

          }}
        />


        <View style={styles.actionsContainer}>
          <View style={styles.resendRow}>
            <Text style={styles.subtitle}>Didn't receive OTP?</Text>

            {isResendEnabled ? (
              <TouchableOpacity onPress={resendHandle} style={styles.resendButton}>
                <Text style={styles.resendText}>Resend OTP</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.timerText}>Resend in {timer}s</Text>
            )}
          </View>


          <TouchableOpacity
            onPress={() => handleVerifyOTP(OTP)} // ✅ make sure OTP value is passed
            activeOpacity={0.8}
            disabled={OTP.length !== 6 || isProcessing} // ⛔ disable while verifying
            style={[
              styles.verifyButton,
              (OTP.length !== 6 || isProcessing) && styles.disabledButton, // 🔒 apply dim style when not ready or verifying
            ]}
          >
            <Text style={styles.verifyText}>
              {isProcessing ? 'Verifying...' : 'Verify OTP'} {/* 🕐 feedback text */}
            </Text>
          </TouchableOpacity>


        </View>
      </View>
      {(otpMode === "loading" || otpMode === "auto") && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.overlayText}>
            {otpMode === "loading" ? "Reading OTP..." : "Verifying..."}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },

  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    margin: 10,
    elevation: 3,
  },

  // ===== Main Content =====
  content: {
    flex: 1,
    paddingVertical: 60,

  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.primary,
    // textAlign: 'center',
    paddingHorizontal: 15,

  },

  infoText: {
    fontSize: 16,
    // textAlign: 'center',
    color: '#555',
    marginBottom: 24,
    marginTop: 10,
    paddingHorizontal: 15,

  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 6, // (React Native 0.71+)
  },

  subtitle: {
    fontSize: 15,
    color: '#555',

  },

  phoneNumber: {
    fontWeight: '600',
    color: colors.text_secondary,
    fontSize: 16,
  },

  // ===== OTP Input =====
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginVertical: 40,
    alignSelf: 'center',
  },
  pinCodeContainer: {
    width: 45,
    height: 55,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activePinCodeContainer: {
    borderColor: colors.primary,
  },
  filledPinCodeContainer: {
    borderColor: colors.primary,
    backgroundColor: '#eaf3ff',
  },
  pinCodeText: {
    fontSize: 24,
    color: '#222',
    fontWeight: '500',
  },
  focusStick: {
    width: 2,
    height: 25,
    backgroundColor: colors.primary,
  },

  // ===== Actions =====
  actionsContainer: {
    width: '100%',
    alignItems: 'center',
  },
  resendButton: {
    paddingHorizontal: 6,
  },
  resendText: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '500',
    textDecorationLine: 'underline'

  },
  timerText: {
    color: colors.text_secondary,
    fontSize: 14,
    marginLeft: 6,

  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    width: '90%',
    // borderWidth: 1,
    // borderColor: colors.primary
  },
  disabledButton: {
    opacity: 0.6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  verifyText: {
    color: colors.text_white,
    fontSize: 16,
    fontWeight: '600',

  },
});

export default LoginVerifyOTPScreen;
