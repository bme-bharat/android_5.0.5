import { useEffect } from 'react';
import { AppState, NativeEventEmitter, NativeModules, Platform } from 'react-native';
import QuickActions from 'react-native-quick-actions';
import { navigationRef } from '../../App';
import { CommonActions, StackActions } from '@react-navigation/native';

const TAB_SCREENS = [
  { name: 'UserSubscription', type: 'OpenSubscription', title: 'Subscription', icon: 'creditcard' },
  { name: 'AllNotification', type: 'OpenNotifications', title: 'Activity', icon: 'bell' }
];

let navigationReady = false;
let pendingAction = null;
let retryCount = 0;
const maxRetries = 5;

const normalizeActionData = (data) => {
  if (typeof data === 'string') {
    const screenConfig = TAB_SCREENS.find(item => item.type === data);
    return { userInfo: { screen: screenConfig?.name || '', type: data }, type: data };
  }
  return data;
};

export const setupQuickActions = () => {
  setupQuickActionItems();
  checkInitialAction();

  const subscriptions = [];
  if (Platform.OS === 'ios') {
    const quickActionEmitter = new NativeEventEmitter(NativeModules.RNShortcuts);
    const sub = quickActionEmitter.addListener('onShortcutUsed', (data) => {
      handleQuickAction(normalizeActionData(data));
    });
    subscriptions.push(sub);
  }

  const appStateSub = AppState.addEventListener('change', handleAppStateChange);
  subscriptions.push({ remove: () => AppState.removeEventListener('change', handleAppStateChange) });

  return () => subscriptions.forEach(sub => sub.remove());
};

const handleAppStateChange = (nextAppState) => {
  if (nextAppState === 'active' && pendingAction) {
    handleQuickAction(pendingAction);
  }
};

const setupQuickActionItems = () => {
  try {
    QuickActions.setShortcutItems(TAB_SCREENS.map(item => ({
      type: item.type,
      title: item.title,
      icon: item.icon,
      userInfo: { screen: item.name, type: item.type },
    })));
  } catch (err) {
    console.error('[QuickActions] Failed to set items:', err);
  }
};

const checkInitialAction = () => {
  QuickActions.popInitialAction().then(action => {
    if (action) handleQuickAction(normalizeActionData(action));
  }).catch(console.error);
};

export const onNavigationContainerReady = () => {
  navigationReady = true;
  if (pendingAction) handleQuickAction(pendingAction);
};

const handleQuickAction = (action) => {
  if (!action) return;

  const normalizedAction = normalizeActionData(action);
  const screen = normalizedAction?.userInfo?.screen;
  if (!screen) return;

  const isAppActive = AppState.currentState === 'active';

  if (!navigationReady || !navigationRef.isReady() || !navigationRef.current) {
    pendingAction = normalizedAction;
    retryCount = 0;
    if (isAppActive) setTimeout(() => handleQuickAction(normalizedAction), 500);
    return;
  }

  try {
    if (retryCount >= maxRetries) {
      pendingAction = null;
      return;
    }
    
    // Always reset to Home first, then navigate to target screen
    // This ensures back button always goes to Home
    navigationRef.current.dispatch(
      CommonActions.reset({
        index: 1, // This makes the back button go to Home
        routes: [
          { 
            name: 'Home ', 
            state: { 
              routes: [{ 
                name: 'Home',
                state: {
                  routes: [
                    { name: 'Home3' }, // Default home screen
                    { name: screen }   // Target screen
                  ],
                  index: 1 // Start on target screen
                }
              }],
              index: 0
            }
          }
        ]
      })
    );

    pendingAction = null;
    retryCount = 0;
  } catch (err) {
    retryCount++;
    if (retryCount < maxRetries && isAppActive) {
      setTimeout(() => handleQuickAction(normalizedAction), 500);
    } else {
      pendingAction = null;
    }
  }
};