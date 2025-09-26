import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UserStackNav from './UserNav/UserStackNav';


const RootStack = createNativeStackNavigator();

const AppNavigator = ({ userType }) => {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'none', // Disable animations at root level
      }}
    >
      {userType === 'users' ? (
        <RootStack.Screen 
          name="UserStack" 
          component={UserStackNav} 
        />
      ) : userType === 'company' ? (
        <RootStack.Screen 
          name="CompanyStack" 
          component={CompanyBottomTab} 
        />
      ) : (
        <RootStack.Screen 
          name="AuthStack" 
          component={LoginStack} 
          options={{ gestureEnabled: false }} // Disable back gesture for auth stack
        />
      )}
    </RootStack.Navigator>
  );
};

export default AppNavigator;