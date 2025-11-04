import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from '../../../App'; // your ref

const NAVIGATION_STATE_KEY = 'NAVIGATION_STATE_V1';

export const AppNavigator = ({ children }) => {
  const [initialState, setInitialState] = useState();
  const [isReady, setIsReady] = useState(false);

  // Restore navigation state on app start
  useEffect(() => {
    const restoreState = async () => {
      try {
        const savedStateString = await AsyncStorage.getItem(NAVIGATION_STATE_KEY);
        const state = savedStateString ? JSON.parse(savedStateString) : undefined;
        if (state !== undefined) {
          setInitialState(state);
        }
      } catch (e) {
        console.log('❌ Error restoring navigation state', e);
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) {
      restoreState();
    }
  }, [isReady]);

  if (!isReady) {
    return null; // or return <SplashScreen />
  }

  return (
    <NavigationContainer
      ref={navigationRef}
      initialState={initialState}
      onStateChange={async (state) => {
        try {
          const stateString = JSON.stringify(state);
          await AsyncStorage.setItem(NAVIGATION_STATE_KEY, stateString);
        } catch (e) {
          console.log('❌ Error saving navigation state', e);
        }
      }}
    >
      {children}
    </NavigationContainer>
  );
};
