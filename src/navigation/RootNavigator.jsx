import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useNetwork } from "../screens/AppUtils/IdProvider";
import { LoginStack } from "./UsersRegister";
import { UserNavigator } from "./UserNav/UserNavigator";
import { CompanyNavigator } from "./CompanyNav/CompanyNavigator";
import SplashScreen from "../screens/SplashScreen";
import Subscription from "../screens/subscription/Subscription";
import SubscriptionWatcher from "../screens/AppUtils/SubscriptionWatcher";

const RootStack = createNativeStackNavigator();

export function RootNavigator() {
  const {
    isLoggedIn,
    bootstrapped,
    myData,
    needsSubscription,
    pendingUser
  } = useNetwork();

  if (!bootstrapped) {
    return <SplashScreen />; // ✅ app frozen until ready
  }

  return (
    <>
      <SubscriptionWatcher />

      <RootStack.Navigator 
      screenOptions={{  
        headerShown: false,      // 🔥 Show the header bar
        headerTitle: '',   
      
        }}>
        {needsSubscription ? (
          <RootStack.Screen
            name="Subscription"
            component={Subscription}
          />
        ) : !isLoggedIn ? (
          <RootStack.Screen name="Auth" component={LoginStack} />
        ) : myData?.user_type === 'users' ? (
          <RootStack.Screen name="User" component={UserNavigator} />
        ) : (
          <RootStack.Screen name="Company" component={CompanyNavigator} />
        )}

      </RootStack.Navigator>
    </>
  );
}
