import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet, TextInput, Text, TouchableOpacity, Modal, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import defaultImage from '../../images/homepage/dummy.png';

import Message from '../../components/Message';
import RNRestart from 'react-native-restart';
import { useSelector } from 'react-redux';
import { showToast } from '../AppUtils/CustomToast';
import apiClient from '../ApiClient';
import { useNetwork } from '../AppUtils/IdProvider';
import { updateLastSeen } from '../AppUtils/LastSeen';
import { OtpInput } from "react-native-otp-entry";
import { openMediaViewer } from '../helperComponents/mediaViewer';
import EditIcon from '../../assets/svgIcons/edit.svg';
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import Logout from '../../assets/svgIcons/logout.svg';
import Close from '../../assets/svgIcons/close.svg';
import Warning from '../../assets/svgIcons/warning.svg';
import Account from '../../assets/svgIcons/account.svg';
import Sucess from '../../assets/svgIcons/success.svg';

import { colors, dimensions } from '../../assets/theme.jsx';
import Animated from 'react-native-reanimated';
import { useLogoutManager } from '../AppUtils/useLogoutManager.jsx';
import { getSignedUrl } from '../helperComponents/signedUrls.jsx';
import FastImage from '@d11/react-native-fast-image';
import Timeline from './Timeline.jsx';
import Avatar from '../helperComponents/Avatar.jsx';
import { smartGoBack } from '../../navigation/smartGoBack.jsx';
import Job from '../../assets/svgIcons/jobs.svg';
import { AppHeader } from '../AppUtils/AppHeader.jsx';
import MaterialIcons from '@react-native-vector-icons/material-icons';


const UserDetailsPage = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const profileUserId = route.params?.userId

  const [profile, setData] = useState({})

  const fetchProfile = async () => {
    try {
      const response = await apiClient.post('/getUserDetails', {
        command: 'getUserDetails',
        user_id: profileUserId,
      });

      if (response.data.status === 'success') {
        let profileData = response.data.status_message;

        if (profileData?.fileKey) {
          try {
            const signedUrl = await getSignedUrl(
              'profileImage',
              profileData.fileKey
            );

            profileData = {
              ...profileData,
              imageUrl: signedUrl, // ✅ attach here
            };
          } catch (e) {
            console.warn('Failed to fetch profile image URL', e);
          }
        }

        setData(profileData); // ✅ single source of truth
      }
    } catch (error) {
      console.log('error', error);
    }
  };



  useEffect(() => {
    fetchProfile()
  }, [profileUserId])




  const imageUri =
    typeof profile?.imageUrl === 'string'
      ? profile.imageUrl
      : profile?.imageUrl?.profileImage || null;



  const Row = ({ icon, label, value }) => (
    <TouchableOpacity activeOpacity={0.7} style={styles.row}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <MaterialIcons name={icon} size={20} color="#000" />
        </View>
        <View>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      </View>

      {/* <MaterialIcons name="chevron-right" size={24} color="#777" /> */}
    </TouchableOpacity>
  );

  return (

    <View style={{ flex: 1 }}>



      <AppHeader
        title={profile?.first_name || ''}
      // onEdit={() => handleUpdate()}
      />
      {/* <TouchableOpacity style={{ padding: 8, gap: 6, borderRadius: 4, backgroundColor: '#e2e2e2', alignSelf: 'flex-start', flexDirection: 'row' }} onPress={() => smartGoBack(navigation)}>
        <ArrowLeftIcon width={dimensions.icon.medium} height={dimensions.icon.medium} fill={colors.text_primary} />
        <Text>Back</Text>
      </TouchableOpacity> */}
      <ScrollView keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{  padding: 16 }}
      >

        <View style={styles.profileBox}>


          <TouchableOpacity activeOpacity={1} style={{ marginVertical: 10 }} onPress={() => openMediaViewer([{ type: 'image', url: imageUri }])} >

            <Avatar
              imageUrl={imageUri}
              name={profile?.first_name}
              size={60}
              radius={8}
            />
          </TouchableOpacity>


          <View style={styles.textContainer}>
            <Text style={[styles.title]}>
              {`${(profile?.first_name || '').trim()} ${(profile?.last_name || '').trim()}`}
            </Text>
            <Text style={styles.category}>{profile?.category || ""}</Text>
          </View>

        </View>

        <Text style={styles.header}>About Me</Text>

        {/* <Row
          icon="person"
          value="@reallygreatsite"
          label="Username"
        /> */}

   

        <Row
          icon="location-on"
          value={`${profile?.city || ''}, ${profile?.state || ''}`.trim()}
          label="Address"
        />

        <Row
          icon="person"
          value={profile?.select_your_profile}
          label="Profile"
        />
        <Row
          icon="transgender"
          value={profile?.gender}
          label="Gender"
        />
   
        {(profile?.college?.trimStart().trimEnd()) && (
          <Row
            icon="work"
            value={profile?.college.trimStart().trimEnd()}
            label="Institute / Company"
          />
        )}



        {/* <View style={commonStyles.labValContainer}>
          <Text style={commonStyles.label}>Profile</Text>
          <Text style={commonStyles.colon}>:</Text>

          <Text style={commonStyles.value}>{profile?.select_your_profile || ""}</Text>
        </View>
        <View style={commonStyles.labValContainer}>
          <Text style={commonStyles.label}>Category         </Text>
          <Text style={commonStyles.colon}>:</Text>

          <Text style={commonStyles.value}>{profile?.category || ""}</Text>
        </View>
        <View style={commonStyles.labValContainer}>
          <Text style={commonStyles.label}>State               </Text>
          <Text style={commonStyles.colon}>:</Text>

          <Text style={commonStyles.value}>{profile?.state || ""}</Text>
        </View>
        <View style={commonStyles.labValContainer}>
          <Text style={commonStyles.label}>City          </Text>
          <Text style={commonStyles.colon}>:</Text>

          <Text style={commonStyles.value}>{profile?.city || ""}</Text>
        </View>
        <View style={commonStyles.labValContainer}>
          <Text style={commonStyles.label}>Gender</Text>
          <Text style={commonStyles.colon}>:</Text>
          <Text style={commonStyles.value}>{profile?.gender || ""}</Text>
        </View>

        <View style={commonStyles.labValContainer}>
          <Text style={commonStyles.label}>Date of birth </Text>
          <Text style={commonStyles.colon}>:</Text>
          <Text style={commonStyles.value}>{profile?.date_of_birth ? (profile?.date_of_birth) : ""}</Text>
        </View>

        {(profile?.college?.trimStart().trimEnd()) ? (
          <View style={commonStyles.labValContainer}>
            <Text style={commonStyles.label}>Institute / Company</Text>
            <Text style={commonStyles.colon}>:</Text>
            <Text style={commonStyles.value}>{profile?.college.trimStart().trimEnd()}</Text>
          </View>
        ) : null} */}

        <TouchableOpacity
          onPress={() => navigation.navigate('Timeline', { userId: profileUserId, profileType: "user", })}
          style={styles.halfButtonPrimary}
        >
          <View style={{ flexDirection: 'row' }}>
            <MaterialIcons
              name="timeline"
              size={20}
              color={colors.primary}
              style={styles.icon}
            />
            <Text style={styles.buttonTextPrimary}>Timeline</Text>
          </View>
          <MaterialIcons name='chevron-right' size={26} color={colors.primary} />

        </TouchableOpacity>
      </ScrollView >
    </View >
  );
};

const styles = StyleSheet.create({
  
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text_primary,

  },
  category: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.text_secondary,
  },
  textContainer: {
    marginLeft: 10,
    flex: 1,
  },
  profileBox: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 16
  },
  editContainer: {
    marginLeft: 'auto',   // 👈 pushes Edit to extreme right
    paddingHorizontal: 8,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4
  },


  editText: {
    color: colors.primary || '#007bff',
    fontWeight: '600',
  },
  barText: {
    fontSize: 16,
    fontWeight: '600',
  },

  headerContainer: {
    backgroundColor: '#075cab',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

  },

  backButton: {
    alignSelf: 'flex-start',
    padding: 10,

  },
  circle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,

  },

  shareText: {
    color: colors.text_white,
    fontSize: 16,
    fontWeight: '600',


  },

  imageContainer: {
    width: 140,
    height: 140,
    borderRadius: 80,
    resizeMode: 'contain',
    overflow: 'hidden',
    marginBottom: 20,
    alignSelf: 'center',
    overflow: 'hidden',
    marginTop: 10

  },
  detailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 80,

  },

  createPostButton: {
    position: 'absolute',
    bottom: 60, // Adjust this value to move the button up or down
    right: 30, // Adjust this value to move the button left or right
    width: 50, // Set the width of the button
    height: 50,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#075cab"
  },
  halfButtonPrimary: {
    flex: 1,        
    flexDirection: 'row',
    paddingVertical: 14,

    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderColor: '#e2e2e2',
  },

  buttonTextPrimary: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.primary,
  },
  icon: {
    marginRight: 6,
  },
  signOutButton: {
    padding: 10,
    flexDirection: 'row',
    marginTop: 5,
    maxWidth: 200
  },
  signOutButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
    alignSelf: 'flex-start'


  },
  deleteAccountButton: {
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
    marginTop: 5,
    maxWidth: 200

  },

  deleteAccountButtonText: {
    color: colors.danger,
    fontSize: 16,
    fontWeight: '600',
  },
  modalContainerImage: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton1: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  modalImage: {
    width: '100%',
    height: '100%',

    borderRadius: 10,
  },


  warningContainer: {
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },

  deletionText: {
    fontSize: 14,
    color: 'black',
    textAlign: 'justify',
    lineHeight: 23,
    marginBottom: 25,
    fontWeight: '500'
  },
  deletionText1: {
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    width: '100%',
  },
  confirmButton: {
    // backgroundColor: 'green',
    paddingHorizontal: 29,
    borderRadius: 10,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    // backgroundColor: 'red',
    paddingHorizontal: 25,
    borderRadius: 10,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    color: 'red',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButtonText: {
    color: 'green',
    fontSize: 16,
    fontWeight: 'bold',
  },

  closeIconContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
    backgroundColor: colors.background,
    borderRadius: 20,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  modalContainer1: {
    width: '90%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',

  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  pinCodeContainer: {
    borderWidth: 0,
    borderColor: '#ccc',
    borderRadius: 10,
    width: 40,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  activePinCodeContainer: {
    borderColor: '#075cab',
  },
  filledPinCodeContainer: {
    backgroundColor: '#eaf4ff',
    borderColor: '#075cab',
  },
  disabledPinCodeContainer: {
    backgroundColor: '#f2f2f2',
  },
  pinCodeText: {
    fontSize: 20,
    color: '#000',
    fontWeight: '400',
  },
  focusStick: {
    width: 2,
    height: 25,
    backgroundColor: '#075cab',
  },
  placeholderText: {
    color: '#aaa',
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 15
  },

  resendButtonText: {
    color: '#075cab',
    fontSize: 16,
    fontWeight: '600',
    padding: 10,

  },
  timerText: {
    color: '#999',
    fontSize: 13,
    padding: 10,
  },
  verifyButton: {
    alignSelf: 'flex-end',
  },
  resendButton: {
    alignSelf: 'flex-end',
  },
  infoText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
    fontWeight: '500'
  },
  scrollViewContainer: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 10,
    justifyContent: 'flex-start',

  },

  avatarContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  avatarText: {
    fontSize: 50,
    fontWeight: 'bold',
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text_primary,
    marginBottom: 16,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#e2e2e2',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e2e2e2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  textWrap: {
    flexShrink: 1
  },
  value: {
    fontSize: 15,
    color: colors.text_primary,
    fontWeight: '400',
  },

  label: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },

});

export default UserDetailsPage