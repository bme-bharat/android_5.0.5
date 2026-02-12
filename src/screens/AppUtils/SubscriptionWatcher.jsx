import { useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import { useNetwork } from '../AppUtils/IdProvider';


export default function SubscriptionWatcher() {
  const {
    myData,
    isLoggedIn,
    requireSubscription,
    needsSubscription,
    pendingUser,
    subscriptionVerified,
    subscriptionJustCompleted
  } = useNetwork();

  const triggeredRef = useRef(false);

  useEffect(() => {
    triggeredRef.current = false;
  }, [myData?.subscription_expires_on]);
  
  useEffect(() => {
    if (
      !subscriptionVerified ||
      needsSubscription ||
      pendingUser ||
      subscriptionJustCompleted ||
      !myData?.subscription_expires_on ||
      !isLoggedIn
    ) {
      return;
    }
  
    const intervalId = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);
  
      if (
        currentTime > myData.subscription_expires_on &&
        !triggeredRef.current
      ) {
        triggeredRef.current = true;
        clearInterval(intervalId);
  
        const date = new Date(myData.subscription_expires_on * 1000);
        const formattedDate = date.toLocaleDateString(undefined, {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        });
  
        Alert.alert(
          'Subscription Expired',
          `Your subscription expired on ${formattedDate}.`,
          [
            {
              text: 'OK',
              onPress: () => requireSubscription(myData),
            },
          ],
          { cancelable: false }
        );
      }
    }, 3000);
  
    return () => clearInterval(intervalId);
  }, [
    subscriptionVerified,
    subscriptionJustCompleted,
    needsSubscription,
    pendingUser,
    myData?.subscription_expires_on,
    isLoggedIn,
    requireSubscription,
  ]);
  

  return null;
}

