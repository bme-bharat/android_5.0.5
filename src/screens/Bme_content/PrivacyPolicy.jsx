import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity,  } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Linking } from 'react-native';
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import { colors, dimensions } from '../../assets/theme.jsx';


const PrivacyPolicyScreen = () => {
  const navigation = useNavigation();

  const handleDeleteAccount = () => {
    // Navigate to a different screen or open a URL
    // Example: Linking.openURL('your-deletion-url') or navigate to a specific screen
    Linking.openURL('https://bmebharat.com/delete_account');
  };


  return (
    <View style={styles.container1} >
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                          <ArrowLeftIcon width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />
       
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        <Text style={styles.heading}>Privacy Policy</Text>
        <Text style={styles.paragraph}>
          This Privacy Policy outlines how B M E Bharat ("we," "us," or "our") collects, uses, discloses, and protects the personal information of users of our biomedical engineering app, B M E Bharat. We are committed to safeguarding your privacy and ensuring the security of your personal data.
          By using the App, you agree to the terms and practices described in this Privacy Policy.
        </Text>
        <Text style={styles.heading}>Information We Collect:</Text>
        <Text style={styles.paragraph}>User-Provided Information:</Text>
        <Text style={styles.paragraph}>
          We may collect information that you voluntarily provide when using our App, including but not limited to:
        </Text>
        <Text style={styles.list}>
          • Your name{'\n'}
          • Email address{'\n'}
          • Contact information{'\n'}
          • Profile information{'\n'}
          • Content you submit, post, or share on the App
        </Text>

        <Text style={styles.heading}>Automatically Collected Information:</Text>
        <Text style={styles.paragraph}>
          We may automatically collect information about your usage of the App, such as:
        </Text>
        <Text style={styles.list}>
          • Device information (e.g., device type, operating system){'\n'}
          • Log data (e.g., IP address, browser type, date and time of access){'\n'}
          • Location data (if you enable location services)
        </Text>

        <Text style={styles.heading}>How We Use Your Information:</Text>
        <Text style={styles.paragraph}>
          We use the collected information for the following purposes:
        </Text>
        <Text style={styles.list}>
          • To provide and maintain the App.{'\n'}
          • To personalize and improve your experience with the App.{'\n'}
          • To communicate with you, including sending notifications, updates, and important communications about your account and our services. This includes push notifications, which may be used to share updates, reminders, or critical alerts. You can manage your
          notification preferences through your device settings.{'\n'}
          • To respond to your requests, comments, or questions.{'\n'}
          • To analyze user trends and preferences to enhance the App's features and content.{'\n'}
          • To fulfill legal and regulatory obligations.
        </Text>

        <Text style={styles.heading}>Sharing of Your Information:</Text>
        <Text style={styles.paragraph}>
          We do not sell, trade, or rent your personal information to third parties. However, we may share your information with:
        </Text>
        <Text style={styles.list}>
          • Service providers and third-party vendors who assist us in operating and maintaining the App.{'\n'}
          • Legal authorities or other entities when required to comply with the law or protect our rights and interests.
        </Text>

        <Text style={styles.heading}>Your Choices and Controls:</Text>
        <Text style={styles.paragraph}>
          You have certain rights and choices regarding your personal information:
        </Text>
        <Text style={styles.list}>
          • You can review and update your account information at any time.{'\n'}
          • You may opt out of receiving marketing communications from us.{'\n'}
          • You can disable location services through your device settings.{'\n'}
          </Text>
          <Text style={styles.heading}>Opt-Out Procedure:</Text>
          <Text style={styles.list}>
          • If you wish to withdraw your consent for the use and disclosure of your personal information as outlined in this policy, or if you want your data to be deleted, please write to us at admin@bmebharat.com or bmebharat@gmail.com. We will process your request promptly.{'\n'}
          <Text style={styles.paragraph}> Please note:</Text>{'\n'}
          • Your request shall take effect no later than Five (5) business days from the receipt of your request.{'\n'}
          • After processing, we will no longer use your personal data for any processing activities unless it is required to comply with our legal obligations.{'\n'}
          • Upon withdrawing your consent, some or all of our services may no longer be available to you.{'\n'}
          • We value your privacy and will ensure your request is handled with care.{'\n'}
          •Also, you can request the deletion of your account and associated data by clicking on the  <Text style={styles.link} onPress={handleDeleteAccount}> Delete Account </Text>
          {' '}link.
        
        </Text>

        <Text style={styles.heading}>Security:</Text>
        <Text style={styles.paragraph}>
          We take reasonable measures to protect your information from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the internet or electronic storage is entirely secure. We cannot guarantee the absolute security of your data.
        </Text>

        <Text style={styles.heading}>Children's Privacy:</Text>
        <Text style={styles.paragraph}>
          Our App is not intended for children under the age of 13. We do not knowingly collect personal information from individuals under the age of 13. If you believe we have inadvertently collected such information, please contact us to have it removed.
        </Text>

        <Text style={styles.heading}>Changes to this Privacy Policy:</Text>
        <Text style={styles.paragraph}>
          We may update this Privacy Policy to reflect changes in our practices or for other operational, legal, or regulatory reasons. We will provide notice of any material changes and obtain your consent if required by applicable laws.
        </Text>

        <Text style={styles.heading}>Contact Us:</Text>
        <Text style={styles.paragraph}>
          If you have any questions, concerns, or requests related to this Privacy Policy or require assistance related to legal matters, please contact us at:
        </Text>
      
        <Text style={styles.list1}>• Email: admin@bmebharat.com </Text>
        <Text style={styles.list1}>              bmebharat@gmail.com</Text>
        <Text style={styles.list1}>• Phone Number: +91 8310491223</Text>

        <Text style={styles.paragraph}>
          By using our App, you consent to the practices described in this Privacy Policy. Please review this policy regularly to stay informed about how we handle your personal information.
        </Text>
      </ScrollView>
    </View >
  );
};


const styles = StyleSheet.create({
  backButton: {
    alignSelf: 'flex-start',

    padding:10
    
  },
  container1: {
    flex: 1,
 
    backgroundColor: '#fff',
  },
  container: {
    padding: 10,
    backgroundColor: "white"

  },
  list1:{
color:'gray'
  },
  title: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 10,
    color: "black",
    textAlign: 'justify',
  },
  link:{
color:'#075cab',
textDecorationLine:'underline'
  },
  heading: {
    fontSize: 14,
    fontWeight: '500',
    marginVertical:5,
    color: "black",
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 5,
    marginBottom: 3,
    color: "black",
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
    // textAlign: 'justify',
    color: "black",
    fontWeight: '300',
  },
  list: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
    paddingLeft: 10,
    color: "black",
    fontWeight: '300',

  },
});


export default PrivacyPolicyScreen;