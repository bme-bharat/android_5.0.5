import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginPhoneScreen from '../screens/AuthRegister/Login';
import LoginVerifyOTPScreen from '../screens/AuthRegister/LoginOTP';
import UserSignupScreen from '../screens/AuthRegister/UserSignup';
import EnterPhoneScreen from '../screens/AuthRegister/SignUp';
import VerifyOTPScreen from '../screens/AuthRegister/SignUpOTP';
import ProfileTypeScreen from '../screens/AuthRegister/ProfileType';
import CompanyUserSignupScreen from '../screens/AuthRegister/CompanyUserSignup';
import UserSettingScreen from '../screens/Profile/UserSettingScreen';
import SubscriptionScreen from '../screens/subscription/SubscriptionScreen';
import LoginTimeCompanySubscrption from '../screens/subscription/LoginTimeCompanySubscrption';
import PrivacyPolicy from '../screens/Bme_content/PrivacyPolicy';
import TermsAndConditionsScreen from '../screens/Bme_content/TermsAndConditions';
import CreateProduct from '../screens/Products/ProductUploads';
import DeleteAccountFlow from '../screens/AppUtils/DeleteAccountFlow';


const AuthRegisterStack = createNativeStackNavigator();
const UserLoginStack = createNativeStackNavigator();


const screenOptionStyle = {
  headerShown: false,

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
  animation: 'none',
};


const LoginStack = () => (
  <UserLoginStack.Navigator screenOptions={screenOptionStyle} >
    <UserLoginStack.Screen name="LoginPhone" component={LoginPhoneScreen} options={screenOption} />
    <UserLoginStack.Screen name="LoginVerifyOTP" component={LoginVerifyOTPScreen} options={screenOption} />   
    <AuthRegisterStack.Screen name="ProfileType" component={ProfileTypeScreen} options={screenOption} />
    <AuthRegisterStack.Screen name="EnterPhone" component={EnterPhoneScreen} options={screenOption} />
    <AuthRegisterStack.Screen name="VerifyOTP" component={VerifyOTPScreen} options={screenOption} />
    <AuthRegisterStack.Screen name="UserSignup" component={UserSignupScreen} options={screenOption} />
    <AuthRegisterStack.Screen name="CompanyUserSignup" component={CompanyUserSignupScreen} options={screenOption} /> 
    <UserLoginStack.Screen name="UserSetting" component={UserSettingScreen} />
    <UserLoginStack.Screen name="UserSubscriptionLogin" component={SubscriptionScreen} options={screenOption} />
    <UserLoginStack.Screen name="CompanySubscriptionLogin" component={LoginTimeCompanySubscrption} options={screenOption} />
    <UserLoginStack.Screen name="PrivacyPolicy" component={PrivacyPolicy} options={screenOption} />
    <UserLoginStack.Screen name="CreateProduct" component={CreateProduct} options={screenOption} />
    <UserLoginStack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} options={screenOption} />
    <UserLoginStack.Screen name="DeleteAccountFlow" component={DeleteAccountFlow} />

  </UserLoginStack.Navigator>
)

export { LoginStack };



