import React, { useCallback, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

////user job nav
import UserJobProfileScreen from '../../screens/Job/UserJobProfileScreen';
import UserJobListScreen from '../../screens/Job/JobListScreen';
import JobDetailScreen from '../../screens/Job/JobDetailScreen';

//company list
import CompanyListScreen from '../../screens/CompanyList/CompanyList';
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

//homescreen
import HomeScreen from '../../screens/CompanyHomeScreen';

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
import AllPosts from '../../screens/Forum/Feed';
import LatestPosts from '../../screens/Forum/FeedLatest';
import TrendingPosts from '../../screens/Forum/FeedTrending';
import InlineVideo from '../../screens/FullScreenMediaViewer';
import CompanyProfileScreen from '../../screens/Profile/CompanyProfileScreen';
import CompanyProfileUpdateScreen from '../../screens/Profile/CompanyProfileUpdateScreen';
import ComapanyPostedJob from '../../screens/Job/myJobs';
import CompanyGetJobCandidatesScreen from '../../screens/Job/JobSeekerDetails';
import CompanyJobPostScreen from '../../screens/Job/CompanyJobPostScreen';
import CompanyJobEditScreen from '../../screens/Job/CompanyJobEditScreen';
import CompanyListJobCandiates from '../../screens/Job/JobSeekers';
import CompanyAppliedJobScreen from '../../screens/Job/CompanyAppliedJobList';
import CompanyGetAppliedJobsScreen from '../../screens/Job/CompanyAppliedJobDetail';
import CompanySettingScreen from '../../screens/Profile/CompanySettingScreen';
import CompanySubscriptionScreen from '../../screens/subscription/CompanySubscriptionScreen';
import CompanyGetallEnquiries from '../../screens/Services/EnqueriesReceived';
import EditService from '../../screens/Services/ServiceEdit';
import CreateService from '../../screens/Services/ServiceUploads';
import MyServices from '../../screens/Services/MyServices';
import CompanyDrawerNav from './CompanyDrawerContent';
import SubscriptionScreen from '../../screens/subscription/SubscriptionScreen';
import Timeline from '../../screens/Profile/Timeline';
import Subscription from '../../screens/subscription/Subscription';
import Policies from '../../screens/Bme_content/Policies';
import DeleteAccountFlow from '../../screens/AppUtils/DeleteAccountFlow'
import UserDetails from '../../screens/Profile/UserDetailPage';

import { View } from 'react-native';

const Stack = createNativeStackNavigator();

export function CompanyNavigator() {
    return (
        <Stack.Navigator 
        screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            animation: 'slide_from_right',
            // cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
            //   statusBarStyle:'dark',
            headerShown: false,      // 🔥 Show the header bar
            headerTitle: '',         // 🔥 Remove the title text
            contentStyle: { backgroundColor: '#F7F8FA' },
        }}
   
            screenLayout={({ children }) => (
                <View
                    colors={['#075cab', '#EAF1FF', '#ffffff']}
                    style={{
                        backgroundColor: '#F7F8FA',
                        flex: 1,
                        // borderRadius: 20,
                        overflow: 'hidden',
                    }} >
                    {children}
                </View>
            )} >

            {/* Home */}
            <Stack.Screen name="AppDrawer" component={CompanyDrawerNav} />
            <Stack.Screen name="Home" component={HomeScreen} />

            {/* Auth / Profile */}
            <Stack.Screen name="UserProfile" component={UserProfilescreen} />
            <Stack.Screen name="UserProfileUpdate" component={UserProfileUpdateScreen} />
            <Stack.Screen name="UserSetting" component={UserSettingScreen} />
            <Stack.Screen name="BlockedUsers" component={BlockedUsers} />
            <Stack.Screen name="CompanyProfile" component={CompanyProfileScreen} />
            <Stack.Screen name="CompanyProfileUpdate" component={CompanyProfileUpdateScreen} />
            <Stack.Screen name="CompanySetting" component={CompanySettingScreen} />
            <Stack.Screen name="UserDetails" component={UserDetails} />
            <Stack.Screen name="CompanyDetailsPage" component={CompanyDetailsPage} />
            <Stack.Screen name="Timeline" component={Timeline} />

            {/* Jobs */}
            <Stack.Screen name="UserJobProfile" component={UserJobProfileScreen} />
            <Stack.Screen name="UserJobProfileCreate" component={UserJobProfileCreateScreen} />
            <Stack.Screen name="UserJobProfileUpdate" component={UserJobProfileUpdateScreen} />
            <Stack.Screen name="UserJobList" component={UserJobListScreen} />
            <Stack.Screen name="UserJobApplied" component={UserJobAppliedScreen} />
            <Stack.Screen name="UserAppliedJobDetails" component={UserAppliedJobDetailsScreen} />
            <Stack.Screen name="JobDetail" component={JobDetailScreen} />
            <Stack.Screen name="PostedJob" component={ComapanyPostedJob} />
            <Stack.Screen name="CompanyGetJobCandidates" component={CompanyGetJobCandidatesScreen} />
            <Stack.Screen name="CompanyJobPost" component={CompanyJobPostScreen} />
            <Stack.Screen name="CompanyJobEdit" component={CompanyJobEditScreen} />
            <Stack.Screen name="CompanyListJobCandiates" component={CompanyListJobCandiates} />
            <Stack.Screen name="CompanyAppliedJob" component={CompanyAppliedJobScreen} />
            <Stack.Screen name="CompanyGetAppliedJobs" component={CompanyGetAppliedJobsScreen} />

            {/* Forum */}
            <Stack.Screen name="AllPosts" component={AllPosts} />
            <Stack.Screen name="Latest" component={LatestPosts} />
            <Stack.Screen name="Trending" component={TrendingPosts} />
            <Stack.Screen name="ForumPost" component={ForumPostScreen} />
            <Stack.Screen name="ForumEdit" component={ForumEditScreen} />
            <Stack.Screen name="YourForumList" component={YourForumListScreen} />
            <Stack.Screen name="Comment" component={CommentScreen} />

            {/* Company / Services */}
            {/* <Stack.Screen name="CompanyList" component={CompanyListScreen} /> */}
            <Stack.Screen name="CompanyDetails" component={CompanyDetailsScreen} />
            <Stack.Screen name="ServicesList" component={ServicesList} />
            <Stack.Screen name="ServiceDetails" component={ServiceDetails} />
            <Stack.Screen name="CreateService" component={CreateService} />
            <Stack.Screen name="ServiceEdit" component={EditService} />
            <Stack.Screen name="MyServices" component={MyServices} />

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
            <Stack.Screen name="YourSubscriptionList" component={YourSubscriptionListScreen} />
            <Stack.Screen name="CompanySubscription" component={CompanySubscriptionScreen} />
            <Stack.Screen name="SubscriptionScreen" component={SubscriptionScreen} />
            <Stack.Screen name="Subscription" component={Subscription} />


            {/* Notifications */}
            <Stack.Screen name="AllNotification" component={AllNotification} />

            {/* Enquiry */}
            <Stack.Screen name="EnquiryForm" component={EnquiryForm} />
            <Stack.Screen name="MyEnqueries" component={MyEnqueries} />
            <Stack.Screen name="EnquiryDetails" component={EnquiryDetails} />
            <Stack.Screen name="CompanyGetallEnquiries" component={CompanyGetallEnquiries} />

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
