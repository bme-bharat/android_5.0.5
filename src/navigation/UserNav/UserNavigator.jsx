import React, { useCallback, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

////user job nav
import UserJobProfileScreen from '../../screens/Job/UserJobProfileScreen';
import UserJobListScreen from '../../screens/Job/JobListScreen';
import JobDetailScreen from '../../screens/Job/JobDetailScreen';

//company list
import CompanyDetailsScreen from '../../screens/CompanyList/CompanyDetialsScreen';
import ForumEditScreen from '../../screens/Forum/ForumEditScreen';
import YourForumListScreen from '../../screens/Forum/myForums';
import CommentScreen from '../../screens/Forum/forumPostDetails';
//user Profile nav
import UserProfilescreen from '../../screens/Profile/UserProfilescreen';
import UserSettingScreen from '../../screens/Profile/UserSettingScreen';
import UserJobAppliedScreen from '../../screens/Job/UserJobAppliedScreen';
import UserAppliedJobDetailsScreen from '../../screens/Job/UserAppliedJobDetailsScreen';
import UserSubscriptionScreen from '../../screens/subscription/UserSubscriptionScreen';
import UserDetails from '../../screens/Profile/UserDetailPage';
//homescreen
import HomeScreen from '../../screens/UserHomeScreen';
//content
import AboutUs from '../../screens/Bme_content/AboutUs';
import PrivacyPolicy from '../../screens/Bme_content/PrivacyPolicy';

import UserProfileUpdateScreen from '../../screens/Profile/UserProfileUpdateScreen';
import YourSubscriptionListScreen from '../../screens/subscription/YourSubscriptionListScreen';
import UserJobProfileUpdateScreen from '../../screens/Job/UserJobProfileUpdateScreen';
import UserJobProfileCreateScreen from '../../screens/Job/UserJobProfileCreateScreen';
import CancellationPolicy from '../../screens/Bme_content/CancellationPolicy';
import LegalPolicy from '../../screens/Bme_content/LegalPolicy';
import TermsAndConditionsScreen from '../../screens/Bme_content/TermsAndConditions';
import CompanyDetailsPage from '../../screens/Profile/CompanyDetailsPage';
import UserDetailsPage from '../../screens/Profile/UserDetailPage';
import AllNotification from '../../screens/AllNotification';

import { createDrawerNavigator } from '@react-navigation/drawer';
import ResourcesPost from '../../screens/Resources/ResourcesPost';
import ResourcesList from '../../screens/Resources/ResourcesList';
import AllEvents from '../../screens/Resources/Events';
import ResourcesEdit from '../../screens/Resources/ResourcesEdit';
import YourResourcesList from '../../screens/Resources/MyResources';
import ProductDetails from '../../screens/Products/ProductDetails';
import CreateProduct from '../../screens/Products/ProductUploads';
import ProductsList from '../../screens/Products/ProductsList';
import MyProducts from '../../screens/Products/MyProducts';
import EditProduct from '../../screens/Products/ProductEdit';

import ResourceDetails from '../../screens/Resources/ResourceDetails';
import ForumPostScreen from '../../screens/Forum/ForumPost';
import BlockedUsers from '../../screens/Profile/BlockedUsers';
import ServicesList from '../../screens/Services/ServicesList';
import ServiceDetails from '../../screens/Services/ServiceDetails';
import EnquiryForm from '../../screens/Services/Enquiry';
import MyEnqueries from '../../screens/Services/MyEnqueries';

import EnquiryDetails from '../../screens/Services/EnquiryDetails';
import UserHomeScreen from '../../screens/UserHomeScreen';
import { CardStyleInterpolators, createStackNavigator } from '@react-navigation/stack';
import AllPosts from '../../screens/Forum/Feed';
import LatestPosts from '../../screens/Forum/FeedLatest';
import TrendingPosts from '../../screens/Forum/FeedTrending';
import InlineVideo from '../../screens/FullScreenMediaViewer';
import UserDrawerNav from './UserDrawerContent';
import SubscriptionScreen from '../../screens/subscription/SubscriptionScreen';
import CompanySubscriptionScreen from '../../screens/subscription/CompanySubscriptionScreen';
import Timeline from '../../screens/Profile/Timeline';
import LinearGradient from 'react-native-linear-gradient';
import Subscription from '../../screens/subscription/Subscription';
import { View } from 'react-native';
import Policies from '../../screens/Bme_content/Policies';
import DeleteAccountFlow from '../../screens/AppUtils/DeleteAccountFlow';
const Stack = createNativeStackNavigator();

const defaultOptions = {
  statusBarStyle: 'light',

}


export function UserNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animation:'slide_from_right',
        // cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        //   statusBarStyle:'dark',
        headerShown: false,      // 🔥 Show the header bar
        headerTitle: '',         // 🔥 Remove the title text
        headerStyle: {
          backgroundColor: 'red', // Optional: customize header color
        },
      }}
      screenLayout={({ children }) => (
        <View
          colors={['#075cab', '#EAF1FF', '#ffffff']}
          style={{
            // backgroundColor: '#f2f2f2',
            backgroundColor: '#F7F8FA',

            flex: 1,
            // borderRadius: 20,
            overflow: 'hidden',
          }} >
          {children}
        </View>
      )} >
      {/* Home */}
      <Stack.Screen name="AppDrawer" component={UserDrawerNav} />
      <Stack.Screen name="Home" component={HomeScreen} />

      {/* Auth / Profile */}
      <Stack.Screen name="UserProfile" component={UserProfilescreen} />
      <Stack.Screen name="UserDetails" component={UserDetails} />
      <Stack.Screen name="UserProfileUpdate" component={UserProfileUpdateScreen} />
      <Stack.Screen name="UserSetting" component={UserSettingScreen} />
      <Stack.Screen name="BlockedUsers" component={BlockedUsers} />
      <Stack.Screen name="Timeline" component={Timeline} />


      {/* Jobs */}
      <Stack.Screen name="UserJobProfile" component={UserJobProfileScreen} />
      <Stack.Screen name="UserJobProfileCreate" component={UserJobProfileCreateScreen} />
      <Stack.Screen name="UserJobProfileUpdate" component={UserJobProfileUpdateScreen} />
      <Stack.Screen name="UserJobList" component={UserJobListScreen} />
      <Stack.Screen name="UserJobApplied" component={UserJobAppliedScreen} />
      <Stack.Screen name="UserAppliedJobDetails" component={UserAppliedJobDetailsScreen} />
      <Stack.Screen name="JobDetail" component={JobDetailScreen} />
      {/* <Stack.Screen
                name="JobDetail"
                component={JobDetailScreen}
                options={{
                    animation: 'slide_from_bottom',
                    presentation: 'modal',
                    
                }}
            /> */}

      {/* Forum */}
      <Stack.Screen name="AllPosts" component={AllPosts} />
      <Stack.Screen name="Latest" component={LatestPosts} />
      <Stack.Screen name="Trending" component={TrendingPosts} />
      <Stack.Screen name="ForumPost" component={ForumPostScreen} />
      <Stack.Screen name="ForumEdit" component={ForumEditScreen} />
      <Stack.Screen name="YourForumList" component={YourForumListScreen} />
      <Stack.Screen name="Comment" component={CommentScreen} />

      {/* Company / Services */}
      <Stack.Screen name="CompanyDetails" component={CompanyDetailsScreen} />
      <Stack.Screen name="CompanyDetailsPage" component={CompanyDetailsPage} />
      <Stack.Screen name="ServicesList" component={ServicesList} />
      <Stack.Screen name="ServiceDetails" component={ServiceDetails} />

      {/* Products */}
      <Stack.Screen name="ProductsList" component={ProductsList} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
      <Stack.Screen name="CreateProduct" component={CreateProduct} />
      <Stack.Screen name="EditProduct" component={EditProduct} />
      <Stack.Screen name="MyProducts" component={MyProducts} />

      {/* Resources */}
      <Stack.Screen name="ResourcesList" component={ResourcesList} />
      <Stack.Screen name="ResourceDetails" component={ResourceDetails} />
      <Stack.Screen name="ResourcesPost" component={ResourcesPost} />
      <Stack.Screen name="ResourcesEdit" component={ResourcesEdit} />
      <Stack.Screen name="Resourcesposted" component={YourResourcesList} />

      {/* Subscription */}
      <Stack.Screen name="UserSubscription" component={UserSubscriptionScreen} />
      <Stack.Screen name="CompanySubscription" component={CompanySubscriptionScreen} />
      <Stack.Screen name="YourSubscriptionList" component={YourSubscriptionListScreen} />
      <Stack.Screen name="SubscriptionScreen" component={SubscriptionScreen} />
      <Stack.Screen name="Subscription" component={Subscription} />


      {/* Notifications */}
      <Stack.Screen name="AllNotification" component={AllNotification} />

      {/* Enquiry */}
      <Stack.Screen name="EnquiryForm" component={EnquiryForm} />
      <Stack.Screen name="MyEnqueries" component={MyEnqueries} />
      <Stack.Screen name="EnquiryDetails" component={EnquiryDetails} />

      {/* CMS / Policies */}
      <Stack.Screen name="AboutUs" component={AboutUs} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
      <Stack.Screen name="CancellationPolicy" component={CancellationPolicy} />
      <Stack.Screen name="LegalPolicy" component={LegalPolicy} />
      <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
      <Stack.Screen name="Policies" component={Policies} />
      <Stack.Screen name="DeleteAccountFlow" component={DeleteAccountFlow} />


      {/* Misc */}
      <Stack.Screen name="InlineVideo" component={InlineVideo} />
      <Stack.Screen name="Event" component={AllEvents} />

    </Stack.Navigator>
  );
}
