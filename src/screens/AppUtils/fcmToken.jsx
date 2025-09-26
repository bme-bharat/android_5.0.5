import { useEffect, useState, useCallback } from 'react';
import { AppState, PermissionsAndroid, Platform } from 'react-native';
import { getApp } from '@react-native-firebase/app';
import {
  getMessaging,
  getToken,
  requestPermission,
  hasPermission,
  AuthorizationStatus,
} from '@react-native-firebase/messaging';

export const useFcmToken = () => {
  const [fcmToken, setFcmToken] = useState(null);

  async function ensureNotificationPermission() {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
      );
  
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  const fetchFcmToken = useCallback(async (askPermission = false) => {
    try {
      const app = getApp();
      const messaging = getMessaging(app);

      let authStatus = await hasPermission(messaging);
   

      if (authStatus === AuthorizationStatus.NOT_DETERMINED && askPermission) {
        authStatus = await requestPermission(messaging);
       
      }

      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
    
        setFcmToken(null);
        return null;
      }

      const token = await getToken(messaging);
      if (!token) {
   
        setFcmToken(null);
        return null;
      }

      setFcmToken(token);
 
      return token;
    } catch (err) {
   
      setFcmToken(null);
      return null;
    }
  }, []);

  // Initial load
  useEffect(() => {
    (async () => {
      const ok = await ensureNotificationPermission();
      if (ok) {
        fetchFcmToken(true);
      } else {
        console.warn('User denied notification permission → no FCM token');
      }
    })();
  }, []);
  

  // Refresh when app foregrounds
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        fetchFcmToken().then((token) => {
          // console.log('[useFcmToken] Token refreshed on foreground:', token);
        });
      }
    });
    return () => subscription.remove();
  }, [fetchFcmToken]);

  return { fcmToken, refreshFcmToken: fetchFcmToken };
};
