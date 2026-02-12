import React, { useEffect, useRef, useState, Suspense } from 'react';
import { createNavigationContainerRef, NavigationContainer } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginStack } from './src/navigation/UsersRegister';

import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import 'react-native-gesture-handler';
import RNRestart from 'react-native-restart';
import axios from 'axios';
import RNFS from 'react-native-fs';
import SplashScreen from "./src/screens/SplashScreen"
import { Alert, Linking, Modal, StyleSheet, TouchableOpacity, View, Text, Platform, StatusBar, useColorScheme, BackHandler } from 'react-native';

import DeviceInfo from 'react-native-device-info';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import store from './src/screens/Redux/Store';

import apiClient from './src/screens/ApiClient';
import { ToastProvider } from './src/screens/AppUtils/CustomToast';
import NotificationHandler from './src/screens/NotificationHandler';
import DeepLinkHandler from './src/screens/DeepLinkHandler';
import { ConnectionProvider } from './src/screens/AppUtils/ConnectionProvider';
import { BottomSheetProvider } from './src/screens/AppUtils/SheetProvider';
import { NetworkProvider, useNetwork } from './src/screens/AppUtils/IdProvider';

import { enableScreens } from 'react-native-screens';
import MediaViewer from './src/screens/helperComponents/mediaViewer';
import { KeyboardInputProvider } from "./src/screens/AppUtils/KeyboardAvoidingContainer"
import Message1 from './src/components/Message1';
import useLastActivityTracker from './src/screens/AppUtils/LastSeenProvider';
import { RootNavigator } from './src/navigation/RootNavigator';
import { useLogoutManager } from './src/screens/AppUtils/useLogoutManager';
import { PaperProvider } from 'react-native-paper';
import { smartGoBack } from './src/navigation/smartGoBack';

enableScreens();
export const navigationRef = createNavigationContainerRef();

function App() {

  return (
    <SafeAreaProvider>
      <NetworkProvider>

        <StatusBar
          translucent
          barStyle='dark-content'
          // backgroundColor="#FFFFFFB3"
          // backgroundColor="rgba(255, 255, 255, 0 )" 
          backgroundColor={"transparent"}

        />

        <AppContent />
      </NetworkProvider>
    </SafeAreaProvider>
  );
}

const AppContent = () => {
  const { myId, myData } = useNetwork();
  const userId = myId

  const [currentVersion, setCurrentVersion] = useState(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [visible, setVisible] = useState(false);
  const [deleteVisible, setDeleteVisible] = useState(false);

  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertIconType, setAlertIconType] = useState('');

  const [updateDismissedCount, setUpdateDismissedCount] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(false);

  const userCheckIntervalRef = useRef(null);
  const routeNameRef = useRef();
  useLastActivityTracker();
  // useReviewPrompt();
  // const { saveCurrentScreen } = useLastScreenTracker();

  const { startSessionWatcher } = useLogoutManager();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    startSessionWatcher(() => {
      setVisible(true);
    });
  }, []);

  const getCurrentVersion = async () => {
    const version = await DeviceInfo.getVersion();

    setCurrentVersion(version);
  };


  const compareVersions = (currentVersion, updateVersion) => {
    const currentParts = currentVersion.split('.').map(num => parseInt(num, 10));
    const updateParts = updateVersion.split('.').map(num => parseInt(num, 10));

    for (let i = 0; i < currentParts.length; i++) {
      if (updateParts[i] > currentParts[i]) {
        return true; // New version is available
      } else if (updateParts[i] < currentParts[i]) {
        return false; // Current version is newer or the same
      }
    }
    return false; // Versions are the same
  };



  const checkForUpdate = async () => {
    if (forceUpdate) return; // Stop checking if the update is forced

    try {
      const response = await apiClient.post('/getAppUpdateVersionNumber', {
        command: 'getAppUpdateVersionNumber',
        user_id: userId,
      });

      if (response.status === 200 && response.data.status === 'success') {
        const newVersion = response.data.android_version_number;

        const isUpdateAvailable = compareVersions(currentVersion, newVersion);

        if (isUpdateAvailable) {
          if (updateDismissedCount >= 2) {
            setForceUpdate(true);
          }
          setModalVisible(true);
        }
      }
    } catch (error) {

    }
  };

  useEffect(() => {
    getCurrentVersion();
  }, []);



  const handleUpdate = () => {
    Linking.openURL('https://play.google.com/store/apps/details?id=com.bmebharat.newapp&hl=en');
    setModalVisible(false);
  };

  const handleUpdateDismiss = () => {
    if (updateDismissedCount >= 2) {
      setForceUpdate(true);
    } else {
      setUpdateDismissedCount(prevCount => prevCount + 1);
      setModalVisible(false);
    }
  };


  useEffect(() => {
    if (userId && !forceUpdate) {
      const intervalId = setInterval(() => {
        checkForUpdate();
      }, updateDismissedCount === 0 ? 10000 : 300000);

      return () => clearInterval(intervalId);
    }
  }, [userId, updateDismissedCount, forceUpdate]);

  const forceExitRef = useRef(false);
  const [stopPolling, setStopPolling] = useState(false);

  const handleAccountDeletion = async () => {
    try {
      if (forceExitRef.current !== true) {
        forceExitRef.current = true;
      }

      await AsyncStorage.clear();

      setVisible(false);

      setTimeout(() => {
        RNRestart.restart();
      }, 500);
    } catch (e) {
      console.log('Account deletion cleanup failed:', e);
      RNRestart.restart();
    }
  };


  const triggerDeleteFlow = () => {
    if (forceExitRef.current) return;
    forceExitRef.current = true;

    setAlertTitle('Account Deleted');
    setAlertMessage('Your account no longer exists. Logging out…');
    setAlertIconType('warning');
    setDeleteVisible(true);

    setTimeout(() => {
      handleAccountDeletion();
    }, 2000);
  };


  const fetchProfile1 = async () => {
    if (!userId || forceExitRef.current || stopPolling) return false;

    try {
      const response = await apiClient.post('/getUserDetails', {
        command: 'getUserDetails',
        user_id: userId,
        timestamp: Date.now(),
      });

      if (
        response.data?.errorType === 'Error' &&
        response.data?.errorMessage === 'Oops! User not found! please sign up!'
      ) {
        console.log('response.data', response.data)
        triggerDeleteFlow(); // your delete logic
        setStopPolling(true); // stop further polling
        return false;
      }

      return true;
    } catch (err) {
      console.error('Fetch profile error:', err);
      return false;
    }
  };

  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      fetchProfile1();
    }, 5000); // every 5 seconds

    return () => clearInterval(interval); // cleanup on unmount
  }, [userId, stopPolling]);


  const getDirectorySize = async (dirPath) => {
    let totalSize = 0;

    const files = await RNFS.readDir(dirPath);
    for (const file of files) {
      if (file.isDirectory()) {
        totalSize += await getDirectorySize(file.path);
      } else {
        const stats = await RNFS.stat(file.path);
        totalSize += stats.size;
      }
    }

    return totalSize;
  };

  const checkAndClearCache = async () => {
    try {
      const cacheDir = RNFS.CachesDirectoryPath;


      const cacheSizeInBytes = await getDirectorySize(cacheDir);
      const cacheSizeInMB = cacheSizeInBytes / (5 * 1024 * 1024 * 1024);

      const lastClearedTimestamp = await AsyncStorage.getItem('lastCacheCleared');
      const currentTime = new Date().getTime();
      const timeDifference = currentTime - (lastClearedTimestamp ? parseInt(lastClearedTimestamp) : 0);

      if (cacheSizeInMB > 500 || timeDifference > 12 * 60 * 60 * 1000) {

        await clearCache();

        await AsyncStorage.setItem('lastCacheCleared', currentTime.toString());
      }


      else if (cacheSizeInMB > 500 && timeDifference <= 12 * 60 * 60 * 1000) {

        await clearCache();

        await AsyncStorage.setItem('lastCacheCleared', currentTime.toString());
      }
    } catch (error) {

    }
  };

  const clearCache = async () => {
    try {
      const cacheDir = RNFS.CachesDirectoryPath;
      const files = await RNFS.readDir(cacheDir);


      for (const file of files) {
        await RNFS.unlink(file.path);

      }
    } catch (error) {

    }
  };

  useEffect(() => {

    checkAndClearCache();
  }, []);

  // useEffect(() => {
  //   setupQuickActions();
  // }, []);




  // useEffect(() => {
  //   setupQuickActions();

  //   return () => {
  //     cleanupQuickActions();
  //   };
  // }, []);



  useEffect(() => {
    const subscription = BackHandler.addEventListener(
      'hardwareBackPress',
      () => smartGoBack()
    );

    return () => subscription.remove();
  }, []);


  return (

    <Provider store={store}>
      <Suspense fallback={<SplashScreen />}>
        <GestureHandlerRootView style={{ flex: 1, paddingBottom: insets?.bottom, }}>
          <ToastProvider>
            <PaperProvider>

              <NavigationContainer
                ref={navigationRef} >
                <ConnectionProvider>

                  <BottomSheetProvider>

                    <MediaViewer />
                    <NotificationHandler />
                    <DeepLinkHandler />
                    <RootNavigator />

                  </BottomSheetProvider>

                </ConnectionProvider>

              </NavigationContainer>
            </PaperProvider>



          </ToastProvider>

        </GestureHandlerRootView>
      </Suspense>

      <UpdateModal
        modalVisible={modalVisible}
        onClose={() => setModalVisible(false)}
        onUpdate={handleUpdate}
        handleUpdateDismiss={handleUpdateDismiss}
        forceUpdate={forceUpdate}
      />

      <Message1
        visible={visible}
        showOkButton={false}
        title="Session Expired"
        message="Your account is logged in on another device. Logging out …"
        iconType="warning"
      />

      <Message1
        visible={deleteVisible}
        showOkButton={false}
        title={alertTitle}
        message={alertMessage}
        iconType={alertIconType}
      />
    </Provider>

  );
};

const UpdateModal = ({ modalVisible, onClose, onUpdate, handleUpdateDismiss, forceUpdate }) => {
  return (
    <Modal statusBarTranslucent transparent visible={modalVisible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Update Available</Text>
          <Text style={styles.modalMessage}>
            A new version is available. Please update to the latest version for the best experience.
          </Text>

          <View style={forceUpdate ? styles.buttonContainerSingle : styles.buttonContainer}>
            <TouchableOpacity style={styles.button} onPress={onUpdate}>
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>

            {!forceUpdate && handleUpdateDismiss && (
              <TouchableOpacity
                style={[styles.button, styles.leaveButton]}
                onPress={() => {
                  onClose();
                  handleUpdateDismiss();
                }}
              >
                <Text style={styles.buttonText1}>Leave</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default App;

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker background for better contrast
  },
  modalContainer: {
    width: 320,
    padding: 30,
    backgroundColor: '#fff',
    borderRadius: 15,
    alignItems: 'center',
    elevation: 5, // Add shadow for modern look
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  modalMessage: {
    fontSize: 15,
    marginBottom: 20,
    textAlign: 'center',
    color: '#555',
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
  },
  buttonContainerSingle: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    margin: 5,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#007BFF',
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 8,
  },
  buttonText1: {
    color: '#FF0000',
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 8,
  },
});