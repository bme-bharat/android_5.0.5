// components/InAppUpdateChecker.js
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Button,
  Alert,
  Platform,
  ActivityIndicator,
  Linking,
  StyleSheet,
  Modal,
  AppState,
} from 'react-native';

import SPInAppUpdates from 'sp-react-native-in-app-updates';

import DeviceInfo from 'react-native-device-info';

/**
 * Single-file In-App Update checker for Android (Play In-App Updates).
 * - Default package name set to your app: com.bmebharat.newapp
 * - Tries immediate update when `immediate` is true; otherwise offers flexible/update store.
 *
 * Usage:
 *  <InAppUpdateChecker />
 *
 * Notes:
 *  - Ensure your Play Console internal/test/production release has versionCode > installed build.
 *  - Test with an internal testing release to see update behavior.
 */

const PLAY_STORE_WEB = (pkg) => `https://play.google.com/store/apps/details?id=${pkg}`;
const PLAY_STORE_URI = (pkg) => `market://details?id=${pkg}`;

export default function InAppUpdateChecker({
  packageName = 'com.bmebharat.newapp', // your package name
  checkOnMount = true,
  immediate = false, // set true to prefer immediate updates
  showModalOnAvailable = true, // if false, will silently start update flows
}) {
  const inAppUpdatesRef = useRef(null);
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState(false);
  const [updateInfo, setUpdateInfo] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    if (Platform.OS !== 'android') return; // Play in-app updates only for Android

    inAppUpdatesRef.current = new SPInAppUpdates();

    // initial check
    if (checkOnMount) checkForUpdate();

    // resume listener — useful to complete flexible update after resume
    const sub = AppState.addEventListener('change', handleAppStateChange);
    return () => {
      sub.remove();
    };
  }, []);

  async function handleAppStateChange(next) {
    // if app resumed, re-check to handle flexible complete or to reflect new install
    if (appState.match(/inactive|background/) && next === 'active') {
      // small delay to allow Play UI to finish
      setTimeout(() => checkForUpdate(), 800);
    }
    setAppState(next);
  }

  async function checkForUpdate() {
    setChecking(true);
    try {
      const res = await inAppUpdatesRef.current.checkNeedsUpdate();
      // Log the shape so you can see what fields your device/wrapper returns
      console.log('InAppUpdates.checkNeedsUpdate =>', res);

      // Typical wrapper fields: { shouldUpdate: boolean, updateAvailability, isUpdateTypeAllowed, ... }
      if (res && res.shouldUpdate) {
        setAvailable(true);
        setUpdateInfo(res);

        if (showModalOnAvailable) setModalVisible(true);

        if (immediate) {
          // try immediate first (blocks UI). If it fails, fallback to flexible/open store.
          tryImmediateUpdate();
        }
      } else {
        setAvailable(false);
        setUpdateInfo(null);
        setModalVisible(false);
      }
    } catch (err) {
      console.warn('checkForUpdate failed', err);
      setAvailable(false);
      setUpdateInfo(null);
    } finally {
      setChecking(false);
    }
  }

  async function tryFlexibleUpdate() {
    try {
      const result = await inAppUpdatesRef.current.startFlexibleUpdate();
      console.log('Flexible update started:', result);
      Alert.alert('Update started', 'The update is downloading. You can install it from the Play notification.');
      // Optionally, call completeUpdate() on resume if wrapper requires it:
      // await inAppUpdatesRef.current.completeUpdate();
      setModalVisible(false);
    } catch (err) {
      console.warn('Flexible update failed', err);
      // fallback to opening Play Store page
      await openPlayStore();
    }
  }

  async function tryImmediateUpdate() {
    try {
      await inAppUpdatesRef.current.startImmediateUpdate();
      // If this resolves normally, Play's UI handled the flow
    } catch (err) {
      console.warn('Immediate update failed', err);
      // fallback to flexible (safer) or Play Store
      await tryFlexibleUpdate();
    }
  }

  async function openPlayStore() {
    const pkg = packageName || (DeviceInfo && DeviceInfo.getBundleId && DeviceInfo.getBundleId());
    const playUri = PLAY_STORE_URI(pkg);
    const webUrl = PLAY_STORE_WEB(pkg);

    try {
      // Try Play Store app first
      const canOpen = await Linking.canOpenURL(playUri);
      if (canOpen) {
        await Linking.openURL(playUri);
        return;
      }
    } catch (err) {
      // ignore and fallback to web
      console.warn('Linking.canOpenURL error for playUri', err);
    }

    try {
      await Linking.openURL(webUrl);
    } catch (err) {
      console.warn('Could not open Play Store web URL', err);
      Alert.alert('Update', 'Please visit the Play Store to update the app.');
    } finally {
      setModalVisible(false);
    }
  }
  
  return (
    <>
      {/* small checking indicator (optional) */}
      {checking && (
        <View style={styles.checkingContainer}>
          <ActivityIndicator />
          <Text style={styles.checkingText}>Checking for updates…</Text>
        </View>
      )}

      {/* Modal shown when update is available (flexible fallback + play store button) */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.title}>Update available</Text>
            <Text style={styles.body}>
              A new version of the app is available on the Play Store. Install it for the best experience.
            </Text>

            {updateInfo && (
              <Text style={{ marginBottom: 8, fontSize: 12, color: '#333' }}>
                {/* show some helpful debug info (optional) */}
                {`Update info: ${JSON.stringify(
                  // small safe stringify so modal stays readable
                  { shouldUpdate: !!updateInfo.shouldUpdate, ...('updateAvailability' in updateInfo ? { updateAvailability: updateInfo.updateAvailability } : {}) },
                )}`}
              </Text>
            )}

            <View style={styles.row}>
              <Button title="Later" onPress={() => setModalVisible(false)} />
              <View style={{ width: 12 }} />
              <Button
                title="Update (Flexible)"
                onPress={() => {
                  tryFlexibleUpdate();
                }}
              />
            </View>

            <View style={{ height: 8 }} />

            <Button
              title="Open Play Store"
              onPress={() => {
                openPlayStore();
              }}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  checkingContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    elevation: 4,
  },
  checkingText: { marginLeft: 8 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '86%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    elevation: 8,
  },
  title: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  body: { fontSize: 14, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'flex-end' },
});
