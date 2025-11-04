import { NativeModules, NativeEventEmitter } from 'react-native';
import { parsePhoneNumberFromString } from 'libphonenumber-js';

const { PhoneHintModule } = NativeModules;
const phoneHintEmitter = new NativeEventEmitter(PhoneHintModule);

/**
 * Format phone number – only digits (no country code)
 */
const formatNumber = (num, defaultCountry = 'IN') => {
  try {
    const phoneNumber = parsePhoneNumberFromString(num, defaultCountry);
    if (phoneNumber) {
      // Extract only the national number part (without +91 etc.)
      return phoneNumber.nationalNumber;
    }
    // fallback: remove any non-digit characters
    return num.replace(/\D/g, '');
  } catch (e) {
    return num.replace(/\D/g, '');
  }
};

/**
 * Request the phone number via native Phone Hint API
 */
export const requestPhoneNumber = () => {
  PhoneHintModule.requestPhoneNumber();
};

/**
 * Add listener for Phone Hint events
 * @param {function} callback - called with the clean number or null if canceled
 */
export const addPhoneHintListener = (callback) => {
  const subscription = phoneHintEmitter.addListener('PhoneHintEvent', (event) => {

    switch (event.status) {
      case 'success':
        const cleanNumber = formatNumber(event.value);

        callback(cleanNumber);
        break;
      case 'canceled':
 
        callback(null);
        break;
      case 'error':

        break;
    }
  });

  return () => {

    subscription.remove();
  };
};
