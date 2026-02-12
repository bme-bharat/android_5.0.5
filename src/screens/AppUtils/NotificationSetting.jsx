import { useState, useEffect, useRef } from 'react';
import { Alert, Linking, Platform, AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../ApiClient';
import { showToast } from './CustomToast';
import { useNetwork } from './IdProvider';
import { useFcmToken } from './fcmToken';

export const useNotificationToggle = () => {
  const { myId, myData, updateMyData } = useNetwork();
  const { fcmToken, refreshFcmToken } = useFcmToken();

  const [status, setStatus] = useState(myData?.notification_status ?? true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [waitingForPermission, setWaitingForPermission] = useState(false);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    if (typeof myData?.notification_status === 'boolean') {
      setStatus(myData.notification_status);
    }
  }, [myData?.notification_status]);

  const openAppSettings = () => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  const persistStatus = async (value) => {
    const keys = ['normalUserData', 'CompanyUserData', 'AdminUserData'];

    for (const key of keys) {
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        const userData = JSON.parse(stored);
        userData.notification_status = value;
        await AsyncStorage.setItem(key, JSON.stringify(userData));
      }
    }
  };

  const updateNotificationSetting = async (value, tokenToSend = '') => {
    const res = await apiClient.post('/updateUserSettings', {
      command: 'updateUserSettings',
      user_id: myId,
      notification_status: value,
      fcm_token: tokenToSend,
    });

    if (res.status === 200 && res.data.status === 'success') {
      updateMyData({ notification_status: value });
      await persistStatus(value);
      showToast(`Notifications ${value ? 'enabled' : 'disabled'} successfully.`, 'success');
    } else {
      throw new Error(res.data?.message || 'Failed to update settings');
    }
  };

  const toggleNotifications = async (value) => {
    if (!myId) {
      showToast('User ID not available', 'error');
      return;
    }

    const prev = status;
    setStatus(value);
    setIsProcessing(true);

    try {
      let tokenToSend = '';

      if (value) {
        await refreshFcmToken(true);

        if (!fcmToken || fcmToken === 'FCM_NOT_AVAILABLE') {
          setWaitingForPermission(true);

          Alert.alert(
            'Notifications Disabled',
            'Please enable notifications in Settings.',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: openAppSettings },
            ]
          );

          setStatus(prev);
          setIsProcessing(false);
          return;
        }

        tokenToSend = fcmToken;
      }

      await updateNotificationSetting(value, tokenToSend);
    } catch (err) {
      setStatus(prev);
      showToast(err.message || 'Something went wrong', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle return from Settings
  useEffect(() => {
    const sub = AppState.addEventListener('change', async (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        waitingForPermission
      ) {
        const newToken = await refreshFcmToken(false);

        if (newToken && newToken !== 'FCM_NOT_AVAILABLE') {
          setStatus(true);
          await updateNotificationSetting(true, newToken);
        }

        setWaitingForPermission(false);
      }

      appState.current = nextAppState;
    });

    return () => sub.remove();
  }, [waitingForPermission]);

  return {
    notificationEnabled: status,
    toggleNotifications,
    isProcessing,
  };
};
