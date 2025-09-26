import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import InAppReview from 'react-native-in-app-review';

export default function useReviewPrompt() {
  const appState = useRef(AppState.currentState);
  const sessionStart = useRef(Date.now());
  const timerRef = useRef(null);

  const askForReview = async () => {
    if (InAppReview.isAvailable()) {
      console.log('✅ InAppReview available');

      const result = await InAppReview.RequestInAppReview();
      console.log('📣 In-App Review completed?', result);

      if (result) {
        await AsyncStorage.setItem('lastReviewPromptTime', Date.now().toString());
      }
    } else {
      console.log('❌ InAppReview not supported');
    }
  };

  const startUsageTimer = () => {
    if (timerRef.current) return;
    timerRef.current = setInterval(async () => {
      const prevUsage = parseInt(await AsyncStorage.getItem('totalUsageTime') || '0', 10);
      const updatedUsage = prevUsage + 10;
      await AsyncStorage.setItem('totalUsageTime', updatedUsage.toString());
 

      if (updatedUsage >= 1800) { // 30 mins
        const lastPrompt = parseInt(await AsyncStorage.getItem('lastReviewPromptTime') || '0', 10);
        if (Date.now() - lastPrompt >= 30 * 60 * 1000) {
          console.log('⏰ Triggering review after 30 mins usage');
          askForReview();
          await AsyncStorage.setItem('totalUsageTime', '0'); 
        }
      }
    }, 10000); 
  };

  const trackLaunch = async () => {
    const installTime = await AsyncStorage.getItem('installTime');
    const launchCount = parseInt(await AsyncStorage.getItem('launchCount') || '0', 10);

    if (!installTime) {
      await AsyncStorage.setItem('installTime', Date.now().toString());
      await AsyncStorage.setItem('launchCount', '1');
      console.log('🆕 First launch, skip review');
      return;
    }

    const newCount = launchCount + 1;
    await AsyncStorage.setItem('launchCount', newCount.toString());

    if (newCount === 2) {
      console.log('🕓 Waiting 5 mins to show review on 2nd launch');
      setTimeout(() => {
        askForReview();
      }, 500000);
    }

    if (newCount >= 3) {
      startUsageTimer();
    }
  };

  const saveSessionDuration = async () => {
    const duration = Math.floor((Date.now() - sessionStart.current) / 1000);
    const prev = parseInt(await AsyncStorage.getItem('totalUsageTime') || '0', 10);
    await AsyncStorage.setItem('totalUsageTime', (prev + duration).toString());
    console.log('📥 Session duration added:', duration, 'sec');
  };

  useEffect(() => {
    trackLaunch();

    const sub = AppState.addEventListener('change', next => {
      if (appState.current === 'active' && next.match(/inactive|background/)) {
        saveSessionDuration();
      }
      if (next === 'active') {
        sessionStart.current = Date.now();
      }
      appState.current = next;
    });

    return () => {
      sub.remove();
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);
}
