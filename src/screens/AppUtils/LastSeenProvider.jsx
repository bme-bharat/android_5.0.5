import { AppState } from 'react-native';
import { useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateLastSeen } from './LastSeen';

export default function useLastActivityTracker() {
  const lastActiveRef = useRef(new Date());
  const appState = useRef(AppState.currentState);
  const myIdRef = useRef(null);

  useEffect(() => {
    const getUserId = async () => {
      const keys = [
        'CompanyUserData',
        'CompanyUserlogintimeData',
        'normalUserData',
        'NormalUserlogintimeData',
        'AdminUserData',
      ];
      for (const key of keys) {
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          try {
            const userData = JSON.parse(stored);
            let id = userData.company_id || userData.user_id || null;
            if (typeof id === 'string') {
              id = id.trim().toLowerCase();
              if (id && id !== 'null') {
                myIdRef.current = id;
                break;
              }
            }
          } catch {}
        }
      }
    };

    getUserId();
  }, []);

  useEffect(() => {
    const appStateSub = AppState.addEventListener('change', nextAppState => {
      if (
        appState.current === 'active' &&
        (nextAppState === 'background' || nextAppState === 'inactive')
      ) {
        if (myIdRef.current) {
          updateLastSeen(myIdRef.current, new Date().toISOString());
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      appStateSub.remove();
    };
  }, []);
}
