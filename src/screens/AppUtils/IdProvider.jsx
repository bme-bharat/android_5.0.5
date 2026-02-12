import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../ApiClient';

const NetworkContext = createContext({
  myId: null,
  myData: null,
});

export const NetworkProvider = ({ children }) => {
  const [myId, setMyId] = useState(null);
  const [myData, setMyData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [bootstrapped, setBootstrapped] = useState(false);
  const [needsSubscription, setNeedsSubscription] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [subscriptionJustCompleted, setSubscriptionJustCompleted] = useState(false);
  const [subscriptionVerified, setSubscriptionVerified] = useState(false);

  const refreshUserFromBackend = async (userId, userType) => {
    try {
      let response;
  
      if (userType === 'company') {
        response = await apiClient.post('/getCompanyDetails', {
          command: 'getCompanyDetails',
          company_id: userId,
        });
      } else {
        response = await apiClient.post('/getUserDetails', {
          command: 'getUserDetails',
          user_id: userId,
        });
      }
  
      const userData = response?.data?.status_message;
      if (!userData) return null;
  
      // 🔐 persist fresh data
      const storageKey =
        userType === 'company' ? 'CompanyUserData' : 'normalUserData';
  
      await AsyncStorage.setItem(storageKey, JSON.stringify(userData));
  
      // ✅ subscription becomes trusted here
      setMyData(userData);
      setSubscriptionVerified(true);
  
      return userData;
    } catch (e) {
      console.error('refreshUserFromBackend failed:', e);
      return null;
    }
  };
  

  
  const requireSubscription = async (userData) => {
    setPendingUser(userData);
    setNeedsSubscription(true);
  
    // ✅ persist pending user
    await AsyncStorage.setItem(
      'PendingSubscriptionUser',
      JSON.stringify(userData)
    );
  };
  
  const completeSubscription = async () => {
    if (!myId || !myData?.user_type) {
      console.warn('completeSubscription called without identity');
      return;
    }
  
    await AsyncStorage.removeItem('PendingSubscriptionUser');
  
    setNeedsSubscription(false);
    setPendingUser(null);
    setSubscriptionJustCompleted(true);
    setIsLoggedIn(true);
  
    await refreshUserFromBackend(myId, myData.user_type);
  
    setTimeout(() => {
      setSubscriptionJustCompleted(false);
    }, 3000);
  };
  
  const rehydrateFromStorage = async () => {
    const keys = ['CompanyUserData', 'normalUserData', 'AdminUserData'];
  
    for (const key of keys) {
      const storedData = await AsyncStorage.getItem(key);
      if (storedData) {
        const userData = JSON.parse(storedData);
        const id = userData.company_id || userData.user_id;
  
        if (id) {
          setMyId(id);
          setMyData(userData);
          setIsLoggedIn(true);
          return true;
        }
      }
    }
  
    return false;
  };
  

  const login = async (id) => {
    if (!id) return;
  
    await rehydrateFromStorage();
    
  };
  
  
  

  useEffect(() => {
    if (bootstrapped || isLoggedIn) return;

    const getUserData = async () => {
      try {
        // 1️⃣ Check if there is a pending subscription
        const pending = await AsyncStorage.getItem('PendingSubscriptionUser');
        if (pending) {
          const pendingUserData = JSON.parse(pending);
  
          // Get full user info from normal storage if needed
          const keys = ['CompanyUserData', 'normalUserData', 'AdminUserData'];
          let fullUserData = pendingUserData;
  console.log('fullUserData',fullUserData)
          for (const key of keys) {
            const storedData = await AsyncStorage.getItem(key);
            if (storedData) {
              const data = JSON.parse(storedData);
  
              // Merge stored data with pending data, pending takes priority
              fullUserData = { ...data, ...pendingUserData };
              break; // stop at the first found
            }
          }
  
          const id = fullUserData.user_id || fullUserData.company_id;
  
          setPendingUser(fullUserData);
          setNeedsSubscription(true);
          setMyId(id);
          setMyData(fullUserData);
          setIsLoggedIn(true);
          setBootstrapped(true);
          return;
        }
  
        // 2️⃣ Normal login restore (no pending)
        const keys = ['CompanyUserData', 'normalUserData', 'AdminUserData'];
        for (const key of keys) {
          const storedData = await AsyncStorage.getItem(key);
          if (storedData) {
        
            const userData = JSON.parse(storedData);
            const id = userData.company_id || userData.user_id;
            if (id) {
              setMyId(id);
              setMyData(userData);
              setIsLoggedIn(true);
              setSubscriptionVerified(true);
              break;
            }
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
        setBootstrapped(true);
      }
    };
  
    getUserData();
  }, []);
  
  

  const updateMyData = (updates) => {
    setMyData((prev) => ({ ...prev, ...updates }));
  };


  return (
    <NetworkContext.Provider value={{
      myId, login, subscriptionJustCompleted, subscriptionVerified,
      requireSubscription,completeSubscription,
      needsSubscription,pendingUser, 
      myData, isLoggedIn, bootstrapped, updateMyData
    }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
