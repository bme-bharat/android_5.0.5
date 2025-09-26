import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Keyboard, BackHandler, StatusBar } from 'react-native';
import { CommonActions, useNavigation, useRoute } from '@react-navigation/native';
import axios from 'axios';
import { showToast } from '../AppUtils/CustomToast';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { OtpInput } from "react-native-otp-entry";
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import ArrowRight from '../../assets/svgIcons/arrow-right-circle.svg';

import { colors, dimensions } from '../../assets/theme.jsx';

const VerifyOTPScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedCategory, selectedProfile, userType, fullPhoneNumber } = route.params;

  const [otp, setOTP] = useState('');
const otpRef = useRef('');

  const otpInputs = useRef([]);
  const [resendVisible, setResendVisible] = useState(false);
  const [timer, setTimer] = useState(30);
  const [loading, setLoading] = useState(false);
  const [isResendEnabled, setIsResendEnabled] = useState(false);


  useEffect(() => {
    if (timer > 0) {
      const countdown = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(countdown);
    } else {
      setResendVisible(true);
      setIsResendEnabled(true);
    }
  }, [timer]);

  useEffect(() => {

    if (otpInputs.current[0]) {
      otpInputs.current[0].focus();
    }
  }, []);

  const handleOTPChange = (index, value) => {
    setOTP((prevOTP) => {
      const otpCopy = [...prevOTP];

      if (value === '') {
        console.log(`Clearing digit at index: ${index}`);
        otpCopy[index] = ''; // Clear digit

        if (index > 0) {
          console.log(`Moving focus to index: ${index - 1}`);
          requestAnimationFrame(() => otpInputs.current[index - 1]?.focus());
        }
      } else if (/^\d$/.test(value)) {
        otpCopy[index] = value;
        if (index < otpCopy.length - 1 && otpCopy[index + 1] === '') {
          requestAnimationFrame(() => otpInputs.current[index + 1]?.focus());
        } else if (index === otpCopy.length - 1) {

          Keyboard.dismiss();
        }
      }

      return otpCopy;
    });
  };


  const handleKeyPress = ({ nativeEvent }, index) => {

    if (nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      setOTP((prevOTP) => {
        const otpCopy = [...prevOTP];
        otpCopy[index - 1] = '';
        requestAnimationFrame(() => otpInputs.current[index - 1]?.focus());
        return otpCopy;
      });
    }
  };




  useLayoutEffect(() => {
    navigation.setOptions({
      gestureEnabled: false, // disables swipe back on iOS
      headerLeft: () => null, // hides back button
    });
  }, [navigation]);



  const handleVerifyOTP = () => {
    const enteredOTP = otpRef.current; 
    console.log('Entered OTP:', enteredOTP); // ✅ LOGGING

    if (enteredOTP.length !== 6 || !/^\d+$/.test(enteredOTP)) {

      showToast("Please enter a valid 6 digit OTP", 'error');

      return;
    }

    axios.post('https://h7l1568kga.execute-api.ap-south-1.amazonaws.com/dev/verifyOtpMsg91', {
      command: 'verifyOtpMsg91',
      otp: enteredOTP,
      user_phone_number: fullPhoneNumber,
    }, {
      headers: {
        'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk',
      },
    })
      .then((res) => {
        if (res.data.type === "success") {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [
                {
                  name: userType === 'company' ? "CompanyUserSignup" : "UserSignup",
                  params: { fullPhoneNumber, selectedProfile, selectedCategory, userType },
                },
              ],
            })
          );

        } else {

          showToast("OTP doesn't match", 'error');

        }
      })
      .catch((error) => {

        showToast("Try again later", 'error');
      });
  };

  const resendHandle = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        'https://h7l1568kga.execute-api.ap-south-1.amazonaws.com/dev/resendOtpMsg91',
        { command: 'resendOtpMsg91', user_phone_number: fullPhoneNumber },
        { headers: { 'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk' } }
      );
      setLoading(false);

      if (response.data.type === 'success') {

        showToast("OTP sent", 'success');

        setTimer(30);
        setIsResendEnabled(false);
      } else {

        showToast("Failed to resend OTP. Check your connection and try again", 'error');
      }
    } catch (error) {
      setLoading(false);

      showToast("Failed to resend OTP. Check your connection and try again", 'error');
    }
  };

  return (
    <View style={styles.container}>
   <StatusBar
        barStyle='light-content'
        backgroundColor="#075cab"
      />
      <View style={styles.headerContainer}>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate("ProfileType")}>
         <ArrowLeftIcon width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />
         
        </TouchableOpacity>

      </View>

      <View style={styles.scrollViewContainer} showsVerticalScrollIndicator={false}>
        <Text style={styles.infoText}>
          Enter the OTP sent to: {fullPhoneNumber || phone}
        </Text>
        <View style={styles.inputContainer}>
          <OtpInput
            numberOfDigits={6}
            focusColor="#075cab"
            autoFocus={true}
            // hideStick={true}
            placeholder="•"
            // blurOnFilled={true}
            disabled={false}
            type="numeric"
            secureTextEntry={false}
            focusStickBlinkingDuration={500}
            onTextChange={(text) => {
              setOTP(text);
              otpRef.current = text; // ✅ latest OTP
            }}
            onFilled={(text) => {
              setOTP(text);
              otpRef.current = text;
              handleVerifyOTP();
            }}

            textInputProps={{
              accessibilityLabel: "One-Time Password",
            }}
            textProps={{
              accessibilityRole: "text",
              accessibilityLabel: "OTP digit",
              allowFontScaling: false,
            }}
            theme={{
              containerStyle: styles.otpContainer,
              pinCodeContainerStyle: styles.pinCodeContainer,
              pinCodeTextStyle: styles.pinCodeText,
              focusStickStyle: styles.focusStick,
              focusedPinCodeContainerStyle: styles.activePinCodeContainer,
              placeholderTextStyle: styles.placeholderText,
              filledPinCodeContainerStyle: styles.filledPinCodeContainer,
              disabledPinCodeContainerStyle: styles.disabledPinCodeContainer,
            }}
          />
        </View>
        <View style={styles.actionsRow}>
          {isResendEnabled ? (
            <TouchableOpacity onPress={resendHandle} style={styles.resendButton}>
              <Text style={styles.resendButtonText}>Resend OTP</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.timerText}>Resend in {timer}s</Text>
          )}

          <TouchableOpacity onPress={handleVerifyOTP} style={styles.verifyButton}>
          <ArrowRight width={dimensions.icon.xl} height={dimensions.icon.xl} color={colors.primary} />
          
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'whitesmoke',
    elevation: 1,  // for Android
    shadowColor: '#000',  // shadow color for iOS
    shadowOffset: { width: 0, height: 1 },  // shadow offset for iOS
    shadowOpacity: 0.1,  // shadow opacity for iOS
    shadowRadius: 2,  // shadow radius for iOS

  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 40,
    justifyContent: 'flex-start',
    
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
    fontWeight:'500'
  },
  inputContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  pinCodeContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    width: 45,
    height: 50,
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
    fontSize: 24,
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
    marginTop: 10,
  },
  resendButton: {
    padding:10
  },
  resendButtonText: {
    color: '#075cab',
    fontSize: 16,
    fontWeight: '500',
  },
  timerText: {
    color: '#999',
    fontSize: 13,
    padding:10

  },
  verifyButton: {
    alignSelf: 'flex-end',
  },
});

export default VerifyOTPScreen;
