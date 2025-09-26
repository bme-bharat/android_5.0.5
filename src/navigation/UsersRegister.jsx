import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


import LoginPhoneScreen from '../screens/AuthRegister/Login';
import LoginVerifyOTPScreen from '../screens/AuthRegister/LoginOTP';
import UserSignupScreen from '../screens/AuthRegister/UserSignup';
import EnterPhoneScreen from '../screens/AuthRegister/SignUp';
import VerifyOTPScreen from '../screens/AuthRegister/SignUpOTP';
import ProfileTypeScreen from '../screens/AuthRegister/ProfileType';
import CompanyUserSignupScreen from '../screens/AuthRegister/CompanyUserSignup';
import UserSubscriptionScreen from '../screens/subscription/UserSubscriptionScreen';
import UserBottomTabNav from './UserNav/UserBottomTabNav';
import CompanyBottomTab from './CompanyNav/CompanyBottomTabNav';
import UserSettingScreen from '../screens/Profile/UserSettingScreen';
import LoginTimeUserSubscriptionScreen from '../screens/subscription/LoginTimeUserSubscriptionScreen';
import LoginTimeCompanySubscrption from '../screens/subscription/LoginTimeCompanySubscrption';
import PrivacyPolicy from '../screens/Bme_content/PrivacyPolicy';
import TermsAndConditionsScreen from '../screens/Bme_content/TermsAndConditions';
import CreateProduct from '../screens/Products/ProductUploads';


const AuthRegisterStack = createNativeStackNavigator();
const UserLoginStack = createNativeStackNavigator();


const screenOptionStyle = {
  statusBarColor: '#075cab',
  headerStyle: {
    backgroundColor: '#075cab',
    height: 10, 
  },
  headerTintColor: '#fff',
  headerTitleAlign: 'center',
  headerTitleStyle: {
    fontSize: 16, 
  },
};


const screenOption = {
  title: null, 
  headerBackTitleVisible: false,
  headerShown: false,
  gestureEnabled: false,
};

const UsersRegister = () => (
  <AuthRegisterStack.Navigator screenOptions={screenOptionStyle} initialRouteName='ProfileType' options={screenOption} >
    <AuthRegisterStack.Screen name="ProfileType" component={ProfileTypeScreen} options={screenOption} />
    <AuthRegisterStack.Screen name="EnterPhone" component={EnterPhoneScreen} options={screenOption} />
    <AuthRegisterStack.Screen name="VerifyOTP" component={VerifyOTPScreen} options={screenOption} />
    <AuthRegisterStack.Screen name="UserSignup" component={UserSignupScreen} options={screenOption} />
    <AuthRegisterStack.Screen name="CompanyUserSignup" component={CompanyUserSignupScreen} options={screenOption} />
    <AuthRegisterStack.Screen name="UserBottom" component={UserBottomTabNav} options={screenOption} />
    <AuthRegisterStack.Screen name="CompanyBottom" component={CompanyBottomTab} options={screenOption} />
   
    <AuthRegisterStack.Screen name="LoginStack" component={LoginStack} options={screenOption} />
    <AuthRegisterStack.Screen name="PrivacyPolicy" component={PrivacyPolicy} options={screenOption} />
    <AuthRegisterStack.Screen name="CreateProduct" component={CreateProduct} options={screenOption} />
    <AuthRegisterStack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} options={screenOption} />
  </AuthRegisterStack.Navigator>
);

const LoginStack = () => (
  <UserLoginStack.Navigator screenOptions={screenOptionStyle} >
    <UserLoginStack.Screen name="LoginPhone" component={LoginPhoneScreen} options={screenOption} />
    <UserLoginStack.Screen name="LoginVerifyOTP" component={LoginVerifyOTPScreen} options={screenOption} />
    <UserLoginStack.Screen name="UserBottom" component={UserBottomTabNav} options={screenOption} />
    <UserLoginStack.Screen name="CompanyBottom" component={CompanyBottomTab} options={screenOption} />
   
    <UserLoginStack.Screen name="Register" component={UsersRegister} options={screenOption} />
    <UserLoginStack.Screen name="UserSetting" component={UserSettingScreen} />
    <UserLoginStack.Screen name="UserSubscriptionLogin" component={LoginTimeUserSubscriptionScreen} options={screenOption} />
    <UserLoginStack.Screen name="CompanySubscriptionLogin" component={LoginTimeCompanySubscrption} options={screenOption} />
    <UserLoginStack.Screen name="PrivacyPolicy" component={PrivacyPolicy} options={screenOption} />
    <UserLoginStack.Screen name="CreateProduct" component={CreateProduct} options={screenOption} />
    <UserLoginStack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} options={screenOption} />
  </UserLoginStack.Navigator>
)

export { UsersRegister, LoginStack };



