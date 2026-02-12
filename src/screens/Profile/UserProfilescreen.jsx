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


const UserProfileScreen = () => {
  const route = useRoute()
  const navigation = useNavigation()
  const { myId } = useNetwork();
  const reduxProfile = useSelector(state => state.CompanyProfile.profile)

  const profileUserId = route.params?.userId ?? myId
  const isMyProfile = profileUserId === myId

  const [data, setData] = useState({})
  const [url, setUrl] = useState({});

  const profile = isMyProfile ? reduxProfile : data
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

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isOtpModalVisible, setIsOtpModalVisible] = useState(false); // Modal
  const [isDeleting, setIsDeleting] = useState(false);
  const [messageVisible, setMessageVisible] = useState(false);
  const [isResendEnabled, setIsResendEnabled] = useState(true);
  const [timer, setTimer] = useState(30);
  const [step, setStep] = useState(1);
  const [otp, setOTP] = useState('');
  const otpRef = useRef('');
  const [phoneNumber, setPhoneNumber] = useState(profile?.user_phone_number);
  const { logoutNow } = useLogoutManager();
  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(countdown);
    } else {
      setIsResendEnabled(true);
    }
  }, [timer]);







  const handleDeleteClick = () => {
    setIsModalVisible(true);
    setStep(1);
  };


  const handleUpdate = () => {
    navigation.navigate('UserProfileUpdate', { profile, imageUrl: profile?.imageUrl, });
  };

  const imageUri =
    typeof profile?.imageUrl === 'string'
      ? profile.imageUrl
      : profile?.imageUrl?.profileImage || null;

  const title = isMyProfile
    ? "My Profile"
    : `${profile?.first_name}'s Profile`;


  const Row = ({ icon, label, value, verified = false }) => (
    <TouchableOpacity activeOpacity={0.7} style={styles.row}>
      <View style={styles.left}>
        <View style={styles.iconWrap}>
          <MaterialIcons name={icon} size={20} color="#000" />
        </View>

        <View style={styles.textWrap}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.value}>{value}</Text>

            {verified && (
              <MaterialIcons
                name="verified"
                size={16}
                color="#2ecc71"   // green verified
                style={{ marginLeft: 6 }}
              />
            )}
          </View>

          <Text style={styles.label}>{label}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );


  return (

    <View style={{ flex: 1, }}>



      <AppHeader
        title={'Profile'}
        onEdit={() => handleUpdate()}
      />

      <ScrollView keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16 }}
      >

        <View style={styles.profileBox}>


          <TouchableOpacity activeOpacity={1} style={styles.imageContainer} onPress={() => openMediaViewer([{ type: 'image', url: imageUri }])} >

            <Avatar
              imageUrl={imageUri}
              name={profile?.first_name}
              size={60}
              radius={8}
            />
          </TouchableOpacity>


          <View style={styles.textContainer}>
            <Text style={[styles.title]} numberOfLines={1} ellipsizeMode='tail'>
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
          icon="email"
          value={(profile?.user_email_id || '').trim()}
          label="E-mail Address"
          verified={profile?.is_email_verified === true}
        />


        <Row
          icon="phone"
          value={profile?.user_phone_number}
          label="Phone Number"
        />

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
        <Row
          icon="date-range"
          value={profile?.date_of_birth}
          label="Date of Birth"
        />
        {(profile?.college?.trimStart().trimEnd()) && (
          <Row
            icon="work"
            value={profile?.college.trimStart().trimEnd()}
            label="Institute / Company"
          />
        )}
        {/* {isMyProfile && (
          <View style={commonStyles.labValContainer}>
            <Text style={commonStyles.label}>Email ID   </Text>
            <Text style={commonStyles.colon}>:</Text>

            <Text style={commonStyles.value}>{(profile?.user_email_id || "").trimStart().trimEnd()}
              <Text>{profile.is_email_verified && (
                <Sucess width={dimensions.icon.small} height={dimensions.icon.small} color={colors.success} />

              )}</Text>
            </Text>

          </View>
        )} */}

        {/* {isMyProfile && (
          <View style={commonStyles.labValContainer}>
            <Text style={commonStyles.label}>Phone no.        </Text>
            <Text style={commonStyles.colon}>:</Text>

            <Text style={commonStyles.value}>{profile?.user_phone_number || ""}</Text>
          </View>
        )} */}

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


        {/* <Text onPress={() => navigation.navigate('Timeline', { userId: profileUserId })}
          style={styles.timeLine}>{profile?.first_name}'s timeline</Text>


        < TouchableOpacity style={styles.signOutButton} onPress={() => setMessageVisible(true)}>
          <Logout width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.danger} />

          <Text style={styles.signOutButtonText}>Logout</Text>
        </TouchableOpacity> */}

        <TouchableOpacity
          onPress={() => navigation.navigate('Timeline', { userId: profileUserId, profileType: "user" })}
          style={styles.halfButtonPrimary}
        >
          <View style={{ flexDirection: 'row' }}>
            <MaterialIcons
              name="timeline"
              size={20}
              color={colors.primary}
            />
            <Text
              style={styles.buttonTextPrimary}>Timeline</Text>
          </View>
          <MaterialIcons name='chevron-right' size={26} color={colors.primary} />

        </TouchableOpacity>

        <View style={styles.actionRow}>

          <TouchableOpacity style={styles.halfButtonDelete} onPress={() => setMessageVisible(true)}>
            <MaterialIcons
              name="logout"
              size={20}
              color={colors.danger}
              style={styles.icon}
            />
            <Text style={styles.buttonTextDelete} numberOfLines={1} ellipsizeMode='tail'>Logout</Text>

          </TouchableOpacity>


        </View>

      </ScrollView >

      {messageVisible && (
        <Message
          visible={messageVisible}
          onCancel={() => setMessageVisible(false)}
          onClose={() => setMessageVisible(false)}
          onOk={() => {
            setMessageVisible(false);
            logoutNow();
          }}
          title="Confirm Logout"
          message="Are you sure you want to logout?"
          iconType="info"
        />
      )}



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
    flex: 1
  },
  profileBox: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginBottom: 16

  },
  imageContainer: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    marginVertical: 10
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


  detailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 80,

  },

  actionRow: {
    flexDirection: 'row',
    // marginVertical: 20, 
    // borderTopWidth: 1,
    // borderColor: '#e0e0e0',
    overflow: 'hidden',
    // backgroundColor: 'red'
    top: 2
  },
  centerDivider: {
    width: 1,
    backgroundColor: '#e0e0e0',   // 👈 vertical center line
  },
  halfButtonDelete: {
    flex: 1,               // 👈 takes half
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    // borderWidth: 1,
    // borderColor: colors.danger,
    backgroundColor: '#f2f2f2',

  },

  halfButtonPrimary: {
    flex: 1,               // 👈 takes half
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
  rowCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  icon: {
    marginRight: 6,
  },

  buttonTextDelete: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.danger,
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
    alignItems: 'flex-start',
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

export default UserProfileScreen