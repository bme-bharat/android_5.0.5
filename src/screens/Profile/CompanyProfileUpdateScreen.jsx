
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,

  Modal, Image,
  ActivityIndicator,
  ActionSheetIOS,
  Alert,
  Platform,
  Linking,
  NativeModules,
  KeyboardAvoidingView
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons'
import { CountryCodes, ProfileSelect } from '../../assets/Constants';
import { Keyboard } from 'react-native';
import axios from 'axios';
import { useNavigation, useRoute } from '@react-navigation/native';
import { stateCityData } from '../../assets/Constants';
import Toast from 'react-native-toast-message';

import RNFS from 'react-native-fs';


import ImagePicker from 'react-native-image-crop-picker';
import ImageResizer from 'react-native-image-resizer';

import PhoneDropDown from '../../components/PhoneDropDown';
import Message3 from '../../components/Message3';

import { updateCompanyProfile } from '../Redux/MyProfile/CompanyProfile_Actions';
import { useDispatch, useSelector } from 'react-redux';
import default_image from '../../images/homepage/buliding.jpg';
import { showToast } from '../AppUtils/CustomToast';
import AppStyles from '../AppUtils/AppStyles';
import apiClient from '../ApiClient';
import { Image as FastImage } from 'react-native';
import CustomDropdown from '../../components/CustomDropDown';
import CustomDropdown1 from '../../components/DropDownMenu';
import ImageCropPicker from 'react-native-image-crop-picker';
import { PERMISSIONS, RESULTS, request, check } from 'react-native-permissions';
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import Camera from '../../assets/svgIcons/camera.svg';
import Close from '../../assets/svgIcons/close.svg';
import Success from '../../assets/svgIcons/success.svg';

import { colors, dimensions } from '../../assets/theme.jsx';
import { MediaPreview } from '../helperComponents/MediaPreview.jsx';
import KeyboardAvoid from '../AppUtils/KeyboardAvoid.jsx';
const { DocumentPicker } = NativeModules;

const CompanyUserSignupScreen = () => {
  const { jobPosts: jobs } = useSelector(state => state.jobs);
  useEffect(() => {

  }, [jobs]);
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const route = useRoute();
  const { profile, imageUrl } = route.params;

  const [localImageUrl, setLocalImageUrl] = useState(imageUrl)
  const [imageUri, setImageUri] = useState(null);
  const [fileUri, setFileUri] = useState(null);
  const [fileType, setFileType] = useState('');
  const [file, setFile] = useState(null);
  const [pdf, setPdf] = useState(null);


  const [isStateChanged, setIsStateChanged] = useState(false);
  const [isCityChanged, setIsCityChanged] = useState(false);
  const [brochureKey, setBrochureKey] = useState(profile?.brochureKey || null);

  const [isModalVisiblephone, setModalVisiblePhone] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(""); // Phone number state
  const [countryCode, setCountryCode] = useState("+91"); // Default country code
  const [isOTPVerified, setIsOTPVerified] = useState(false); // OTP verified flag
  const [otp, setOtp] = useState('');
  const [isTypingOtp, setIsTypingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false); // Track OTP sent status
  const [timer, setTimer] = useState(30);  // Timer state (30 seconds)
  const [isResendEnabled, setIsResendEnabled] = useState(true);
  const [otpTimer, setOtpTimer] = useState(30); // Time left for resend OTP
  const [isOtpSent, setIsOtpSent] = useState(false); // Track if OTP is sent
  const [modalVisibleemail, setModalVisibleemail] = useState(false); // Modal visibility for OTP verification
  const [otp1, setOtp1] = useState('');
  const [isVerifyClicked, setIsVerifyClicked] = useState(false);
  const intervalRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isImageChanged, setIsImageChanged] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(profile?.select_your_profile || "");
  const [selectedCategory, setSelectedCategory] = useState(profile?.category || "");


  const [hasChanges, setHasChanges] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [pendingAction, setPendingAction] = React.useState(null);
  const [verifiedEmail, setVerifiedEmail] = useState(() => {
    return profile?.is_email_verified && postData?.company_email_id ? postData.company_email_id : '';
  });


  
  const [postData, setPostData] = useState({
    company_name: profile.company_name || "",
    business_registration_number: profile.business_registration_number || "",
    company_contact_number: profile.company_contact_number || "",
    company_email_id: profile.company_email_id || "",
    is_email_verified: profile.is_email_verified || false,
    company_located_city: profile.company_located_city || "",
    company_located_state: profile.company_located_state || "",
    Website: profile.Website || "",
    company_address: profile.company_address || "",
    company_description: profile.company_description || "",
    fileKey: profile.fileKey || null,
    brochureKey: profile.brochureKey || "",
    select_your_profile: profile.select_your_profile || "",
    category: profile.category || "",
  });

  // 🔍 Detect unsaved changes
  useEffect(() => {
    const hasChanges = Object.keys(postData).some(
      key => postData[key] !== (profile[key] ?? "")
    ) || isImageChanged;

    setHasChanges(hasChanges);
  }, [postData, isImageChanged, profile]);

  // 🚪 Prevent navigation if unsaved changes exist
  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (!hasChanges) return;
      e.preventDefault();
      setPendingAction(e.data.action);
      setShowModal(true);
    });

    return unsubscribe;
  }, [hasChanges, navigation]);


  const handleLeave = () => {
    setHasChanges(false);
    setShowModal(false);

    if (pendingAction) {
      navigation.dispatch(pendingAction);
      setPendingAction(null);
    }
  };

  const handleStay = () => {
    setShowModal(false);
  };

  const inputRefs = useRef([]);
  // Generic focus function for any field
  const focusInput = (index) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index].focus();
    }
  };

  const [availableCategories, setAvailableCategories] = useState([]);

  useEffect(() => {
    if (selectedProfile) {
      const categories =
        ProfileSelect.normalProfiles[selectedProfile] ||
        ProfileSelect.companyProfiles[selectedProfile] ||
        [];
      setAvailableCategories(categories);

      // Reset category if it's not valid for the new profile
      if (!categories.includes(selectedCategory)) {

        setSelectedCategory("");
      } else {

      }
    }
  }, [selectedProfile]);

  const handleProfileSelect = (item) => {

    setSelectedProfile(item.label); // store only the label string
    setHasChanges(true);
  };

  const handleCategorySelect = (item) => {

    setSelectedCategory(item.label); // store only the label string
    setHasChanges(true);
  };


  const states = Object.keys(stateCityData).map((state) => ({
    label: state,
    key: state,
  }));

  const cities =
    postData.company_located_state && stateCityData[postData.company_located_state]
      ? stateCityData[postData.company_located_state].map((city) => ({
        label: city,
        key: city,
      }))
      : [];

  const handleStateSelect = (item) => {
    setPostData({
      ...postData,
      company_located_state: item.label,
      company_located_city: "", // reset city when state changes
    });
    showToast('Please select city', 'info');
  };

  const handleCitySelect = (item) => {
    setPostData({
      ...postData,
      company_located_city: item.label,
    });
  };



  const sendOTPHandle = () => {
    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    // Check if the phone number is already registered
    axios
      .post(
        'https://h7l1568kga.execute-api.ap-south-1.amazonaws.com/dev/loginUser',
        {
          command: 'loginUser',
          user_phone_number: fullPhoneNumber,
        }, {
        headers: {
          'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk',
        },
      }

      )
      .then((response) => {

        if (response.data.status === 'success') {
          showToast('This user is already exists\nUse a new number', 'info');
          return;
        } else {

          if (validation()) {

            axios
              .post(
                'https://h7l1568kga.execute-api.ap-south-1.amazonaws.com/dev/sendOtpVerificationMsg91',
                {
                  command: 'sendOtpVerificationMsg91',
                  user_phone_number: fullPhoneNumber,
                },
                {
                  headers: {
                    'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk',
                  },
                }
              )
              .then((otpRes) => {
                if (otpRes.data.type === 'success') {
                  setOtpSent(true);
                  setIsOTPVerified(false);

                  showToast("OTP Sent", 'success');

                  setTimer(30);
                  setIsResendEnabled(false);
                }
              })
              .catch((error) => {
                showToast("You don't have internet connection", 'error');

              });
          }
        }
      })
      .catch((error) => {
        showToast("You don't have internet connection", 'error');


      });
  };

  useEffect(() => {
    let timerInterval;

    if (timer > 0 && !isResendEnabled) {

      timerInterval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {

      clearInterval(timerInterval);
      setIsResendEnabled(true);
    }

    return () => clearInterval(timerInterval);
  }, [timer, isResendEnabled]);


  const resendHandle = async () => {

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;

    try {
      const response = await axios.post(
        'https://h7l1568kga.execute-api.ap-south-1.amazonaws.com/dev/resendOtpMsg91',
        { command: 'resendOtpMsg91', user_phone_number: fullPhoneNumber },
        { headers: { 'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk' } }
      );

      if (response.data.type === 'success') {

        showToast("OTP Sent", 'success');

        setTimer(30);
        setIsResendEnabled(false);
      } else {

        showToast("Unable to resend OTP\nTry again later", 'error');
      }
    } catch (error) {
      showToast("You don't have internet connection", 'error');
    }
  };

  const handlePhoneNumberChange = (value) => {

    if (/^\d*$/.test(value) && value.length <= 10) {
      setPhoneNumber(value);

      if (value.length === 10) {
        Keyboard.dismiss();
      }
    }
  };


  const handleVerifyOTP = () => {
    const enteredOTP = otp;
    if (enteredOTP.length !== 6 || !/^\d+$/.test(enteredOTP)) {

      showToast("Please enter a valid 6 digit OTP", 'error');

      return;
    }

    const fullPhoneNumber = `${countryCode}${phoneNumber}`;
    axios.post('https://h7l1568kga.execute-api.ap-south-1.amazonaws.com/dev/verifyOtpMsg91', {
      command: 'verifyOtpMsg91',
      otp: enteredOTP,
      user_phone_number: fullPhoneNumber,
    }, {
      headers: { 'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk' },
    }).then((res) => {
      if (res.data.type === "success") {
        setIsOTPVerified(true);

        showToast("OTP verified", 'success');

      } else {

        showToast("OTP doesn't match", 'error');
      }
    }).catch((error) => {

      showToast("Please try again later", 'error');

    });
  };

  const validation = () => {
    // Check if the phone number is not empty and is a valid number
    if (!phoneNumber || phoneNumber.length < 10) {

      showToast("Please enter a valid phone number", 'error');

      return false;
    }
    return true;
  };

  // Handle phone number update
  const handlePhoneNumberUpdate = () => {
    const fullPhoneNumber = ` ${countryCode}${phoneNumber} `;
    setPostData((prevData) => ({
      ...prevData,
      company_contact_number: fullPhoneNumber,
    }));
    setModalVisiblePhone(false);
  };






  const deleteFileFromS3 = async (key) => {
    try {
      const response = await axios.post(
        'https://h7l1568kga.execute-api.ap-south-1.amazonaws.com/dev/deleteFileFromS3',
        { command: 'deleteFileFromS3', key },
        { headers: { 'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk' } }
      );

      if (response.status === 200) {

        return true;
      }

    } catch (error) {

    }
    return false;
  };




  const startOtpTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setOtpTimer(30); // Set the timer to 30 seconds
    setIsOtpSent(true); // Disable Resend OTP button initially

    intervalRef.current = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev === 1) {
          clearInterval(intervalRef.current); // Stop the timer
          intervalRef.current = null; // Reset interval reference
          setIsOtpSent(false); // Enable Resend OTP button
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };


  const handleOtpEmail = async () => {

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(postData.company_email_id.trim())) {

      showToast("Please provide a valid email Id", 'error');
      return;

    }
    if (!postData.company_email_id.trim()) {

      showToast("Please provide a valid email Id", 'error');
      return;
    }
    setIsVerifyClicked(true);

    setLoading(true);

    const otpResponse = await apiClient.post(
      "/sendUpdateEmailOtp",
      {
        command: "sendUpdateEmailOtp",
        email: postData.company_email_id,
        mode: "update"
      },
      {
        headers: {
          "x-api-key": "k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk",
        },
      }
    );

    if (otpResponse.data.status === "success") {

      showToast("OTP sent", 'success');
      setIsOtpSent(true);
      startOtpTimer();
      setModalVisibleemail(true);
    } else {

      showToast(otpResponse.data.errorMessage, 'error');
    }
    setLoading(false);
  };


  const handleOtpVerification1 = async () => {
    if (!String(postData.company_email_id || '').trim()) {

      showToast('Please provide a valid email Id', 'error');
      return;
    }

    if (!String(otp1 || '').trim()) {

      showToast('Please enter the OTP sent', 'success');
      return;
    }

    try {
      const response = await apiClient.post(
        '/verifyEmailOtp',
        {
          command: "verifyEmailOtp",
          email: postData.company_email_id,
          otp: otp1,
        },
        {
          headers: {
            'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk',
          },
        }
      );

      if (response.data.status === "success") {
        setVerifiedEmail(true);
        setPostData((prevState) => ({
          ...prevState,
          is_email_verified: true,
        }));
        Keyboard.dismiss();

        showToast('Email verified', 'success');
        setModalVisibleemail(false);
      } else {

        showToast(response.data.errorMessage, 'error');
      }
    } catch (error) {

      showToast("Error verifying OTP\nPlease try again", 'error');
    }
  };



  const handleResendOtp = async () => {
    if (!postData.company_email_id.trim()) {

      showToast('Please provide a valid email Id ', 'error');
      return;
    }

    if (otpTimer === 0) {
      handleOtpEmail(); // Resend OTP when timer expires
    }
    try {
      const response = await apiClient.post(
        '/resendEmailOtp',
        {
          command: "resendEmailOtp",
          email: postData.company_email_id,
        },
        {
          headers: {
            'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk',
          },
        }
      );

      if (response.data.status === "success") {

        showToast('OTP sent', 'success');

        startOtpTimer();
      } else {

        showToast(response.data.errorMessage, 'error');
      }
    } catch (error) {

      showToast("Try again later", 'error');
    }
  };


  const handleInputChange = (key, value) => {
    // If the input starts with a space, show a toast and return
    if (/^\s/.test(value)) {

      showToast("Leading spaces and special characters are not allowed", 'error');

      return;
    }

    if (value === "") {
      setPostData(prevState => ({
        ...prevState,
        [key]: "",
        ...(key === "company_email_id" && { is_email_verified: false }), // Reset email verification if email is cleared
      }));
      return;
    }

    if (key === "company_name" && !/^[A-Za-z0-9][A-Za-z0-9 ]*$/.test(value)) {
      showToast("Leading spaces and special characters are not allowed", 'error');
      return;
    }


    setPostData(prevState => {
      let updatedData = { ...prevState, [key]: value };

      if (key === "company_email_id") {
        updatedData.is_email_verified = value === verifiedEmail;
      }

      return updatedData;
    });
  };




  const handleImageSelectionIOS = () => {
    const fileKey = postData.fileKey?.trim();
    const imageUrl = route.params?.imageUrl?.trim();
    const hasImage = fileKey && imageUrl?.includes(fileKey);

    const options = ['Take Photo', 'Choose from Gallery'];
    const actions = [openCamera, openGallery];

    if (hasImage) {
      options.push('Remove Image');
      actions.push(handleRemoveImage);
    }

    options.push('Cancel');
    const cancelButtonIndex = options.length - 1;

    ActionSheetIOS.showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        userInterfaceStyle: 'light',
      },
      (buttonIndex) => {
        if (buttonIndex !== cancelButtonIndex) {
          actions[buttonIndex]?.();
        }
      }
    );
  };

  const handleImageSelection = () => {
    const hasImage = localImageUrl || file;
    const options = ['Take Photo', 'Choose from Gallery'];
    if (hasImage) options.push('Remove Image');

    if (Platform.OS === 'ios') {
      handleImageSelectionIOS(); // your ActionSheetIOS code
    } else {
      Alert.alert(
        'Select Image',
        '',
        [
          hasImage ? { text: 'Remove Image', onPress: handleRemoveImage, style: 'destructive' } : null,
          { text: 'Choose from Gallery', onPress: openGallery },
          { text: 'Take Photo', onPress: openCamera },
        ].filter(Boolean),
        { cancelable: true }
      );
    }
  };

  const openCamera = async () => {
    try {
      const cameraPermission =
        Platform.OS === 'ios'
          ? PERMISSIONS.IOS.CAMERA
          : PERMISSIONS.ANDROID.CAMERA;

      // 1️⃣ Check existing permission
      let result = await check(cameraPermission);

      // 2️⃣ Request if not already granted
      if (result !== RESULTS.GRANTED) {
        result = await request(cameraPermission);
      }

      if (result !== RESULTS.GRANTED) {
        showToast('Camera permission is required to take a photo', 'error');
        return;
      }

      // 3️⃣ If permission granted → continue your camera flow
      const capturedImage = await ImageCropPicker.openCamera({
        mediaType: 'photo',
        cropping: false,
        includeBase64: false,
      });

      if (!capturedImage?.path) return;

      // 🔄 Same crop/resize pipeline as gallery
      const croppedImage = await ImageCropPicker.openCropper({
        path: capturedImage.path,
        width: 800,
        height: 800,
        cropping: true,
        compressImageQuality: 0.8,
        cropperCircleOverlay: true,
        includeBase64: false,
      });

      const resizedImage = await ImageResizer.createResizedImage(
        croppedImage.path,
        800,
        800,
        'JPEG',
        80
      );

      const resizedSizeMB = resizedImage.size / 1024 / 1024;
      if (resizedSizeMB > 5) {
        showToast("Image size shouldn't exceed 5MB", 'error');
        return;
      }

      setFile({
        uri: resizedImage.uri,
        size: resizedImage.size,
        mime: capturedImage.mime || 'image/jpeg',
      });
      setImageUri(resizedImage.uri);
      setFileUri(resizedImage.uri);
      setFileType(capturedImage.mime || 'image/jpeg');
      setIsImageChanged(true);

    } catch (err) {
      if (err?.message?.includes('cancelled') || err?.code === 'E_PICKER_CANCELLED') return;
      console.error('Error capturing/cropping image:', err);
      showToast('Failed to capture or crop image', 'error');
    }
  };









  const handleRemoveImage = async () => {
    if (file && file.uri) {
      setFile(null);
      setFileUri(null);
      setIsImageChanged(true);
      setImageUri(null);
      return;
    }

    try {
      if (!postData.fileKey) {

        return;
      }
      const deleteResult = await deleteFileFromS3(postData.fileKey || imageUri);

      if (deleteResult) {
        setImageUri(null);
        setLocalImageUrl(null)
        setPostData(prevState => {
          const newState = {
            ...prevState,
            fileKey: null,
          };

          return newState;
        });


      } else {

        showToast("Failed to remove the image", 'error');
      }
    } catch (error) {

      showToast("An error occurred while removing the image", 'error');
    }
  };



  const openGallery = async () => {
    try {
      // 1️⃣ Pick the file using native DocumentPicker (type: image)
      const pickedFiles = await DocumentPicker.pick({
        allowMultiple: false,
        type: ['image/*'],
      });

      if (!pickedFiles || pickedFiles.length === 0) return;

      const file = pickedFiles[0];

      // 2️⃣ Crop the image using ImageCropPicker
      const croppedImage = await ImageCropPicker.openCropper({
        path: file.uri,         // the file picked from native picker
        width: 800,             // desired crop width
        height: 800,            // desired crop height
        cropping: true,
        compressImageQuality: 0.8, // same as old compression
        cropperCircleOverlay: true,
        includeBase64: false,
      });

      const maxWidth = 1080;   // max Instagram feed width
      const maxHeight = 1350;  // max portrait height
      const ratio = Math.min(maxWidth / file.width, maxHeight / file.height, 1);

      const resizedWidth = Math.round(file.width * ratio);
      const resizedHeight = Math.round(file.height * ratio);
      // 3️⃣ Optionally resize further using ImageResizer
      const resizedImage = await ImageResizer.createResizedImage(
        croppedImage.path,
        resizedWidth, // maxWidth
        resizedHeight, // maxHeight
        'JPEG',
        80   // quality %
      );

      const resizedSizeMB = resizedImage.size / 1024 / 1024;
      if (resizedSizeMB > 5) {
        showToast("Image size shouldn't exceed 5MB", 'error');
        return;
      }

      // 4️⃣ Save file exactly like your old pattern
      setFile({
        ...file,
        uri: resizedImage.uri,
        size: resizedImage.size,
      });
      setImageUri(resizedImage.uri);
      setFileUri(resizedImage.uri);
      setFileType(file.mime || 'image/jpeg');
      setIsImageChanged(true);

    } catch (err) {
      if (err?.message?.includes('cancelled') || err?.code === 'E_PICKER_CANCELLED') return;
      console.error('Error picking/cropping image:', err);
      showToast('Failed to pick or crop image', 'error');
    }
  };


  const FILE_SIZE_LIMIT_MB = 5;
  const FILE_SIZE_LIMIT_KB = FILE_SIZE_LIMIT_MB * 1024;

  const handleUploadImage = async () => {

    if (!imageUri) {

      return null;
    }

    try {

      const fileStat = await RNFS.stat(fileUri);
      const fileSize = fileStat.size;

      if (fileSize > FILE_SIZE_LIMIT_KB * 1024) {

        showToast("File size shouldn't exceed 5MB", 'error');

        return null;
      }

      const res = await apiClient.post('/uploadFileToS3', {
        command: 'uploadFileToS3',
        headers: {
          'Content-Type': fileType,
          'Content-Length': fileSize,
        },
      });

      if (res.data.status === 'success') {
        const uploadUrl = res.data.url;
        const fileKey = res.data.fileKey;

        // Convert the file to a Blob
        const fileBlob = await uriToBlob(imageUri);

        // Upload the file to S3 using the PUT method (sending the Blob as body)
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': fileType,
          },
          body: fileBlob,
        });

        if (uploadRes.status === 200) {

          return fileKey;
        } else {
          throw new Error('Failed to upload file to S3');
        }
      } else {
        throw new Error(res.data.errorMessage || 'Failed to get upload URL');
      }
    } catch (error) {

      showToast("An error occurred during file upload", 'error');
      return null;
    } finally {

    }
  };



  const handleDeleteBrochure = async () => {
    try {
      if (!brochureKey) {
        return;
      }

      const deleteResult = await deleteFileFromS3(brochureKey);
      if (deleteResult) {
        setPostData(prevState => ({
          ...prevState,
          brochureKey: "",
        }));

      } else {

        showToast("Failed to delete catalogue", 'error');
      }
    } catch (error) {

      showToast("Something went wrong", 'error');
    }
  };

  const handleUploadCatalogue = async () => {
    try {
      // Launch document picker to select a document (PDF)
      const response = await DocumentPicker.pick({
        type: [DocumentPicker.types.pdf],  // Ensure only PDF is selected
      });

      if (response) {
        const selectedFile = response[0];


        // Check if the selected file is a PDF
        if (selectedFile.type !== 'application/pdf') {

          showToast("Please select a valid PDF file", 'error');
          return;
        }

        setPostData(prevState => ({
          ...prevState,
          brochureKey: "",
        }));


        const fileSizeInMB = selectedFile.size / (1024 * 1024); // Size in MB
        if (fileSizeInMB > 5) {

          showToast("File size shouldn't exceed 5MB", 'error');
          return;
        }

        const documentFileKey = await uploadFile(selectedFile, 'document');

        setPostData(prevState => ({
          ...prevState,
          brochureKey: documentFileKey,
        }));


        showToast("Catalogue uploaded successfully", 'success');
      }
    } catch (error) {
      if (DocumentPicker.isCancel(error)) {

      } else {

        showToast("Failed to upload catalogue", 'error');
      }
    }
  };
  const handleRemoveMedia = () => {
    setPdf(null);
    setFileType('');

  };
  const handleFileChange = async () => {
    try {
      // Open the native document picker
      const pickedFiles = await DocumentPicker.pick({
        allowMultiple: false,
        type: ['application/pdf'], // restrict to PDF only
      });

      if (!pickedFiles || pickedFiles.length === 0) return;

      const pdf = pickedFiles[0];
      const fileSize = pdf.size;
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      const mimeType = pdf.mime || pdf.type || 'application/octet-stream';

      if (mimeType === 'application/pdf') {
        if (fileSize <= MAX_SIZE) {
          setPdf(pdf);
          setHasChanges(true);
          setFileType(mimeType);
        } else {
          showToast("File size must be less than 5MB.", "error");
          setPdf(null);
          setFileType(null);
        }
      } else {
        showToast("Please upload a PDF file.", "error");
        setPdf(null);
        setFileType(null);
      }
    } catch (err) {
      if (err?.message?.includes('cancelled')) {
        // User cancelled, no toast needed
        return;
      }
      console.error("Native DocumentPicker error:", err);
      showToast("An unexpected error occurred while picking the file.", "error");
    }
  };

  const uploadFile = async (file, type) => {
    try {


      const fileSizeInKB = file.size / 1024; // Size in KB
      const fileSizeInMB = file.size / (1024 * 1024); // Size in MB


      // File size validation (5MB limit)
      if (fileSizeInMB > 5) {  // 5MB limit
        throw new Error('Document size exceeds 5 MB limit.');
      }

      const fileBlob = await uriToBlob(file.uri); // Convert to Blob


      // Step 1: Request upload URL from backend
      const res = await apiClient.post('/uploadFileToS3', {
        command: 'uploadFileToS3',
        headers: {
          'Content-Type': file.type,
          'Content-Length': fileBlob.size,
        },
      });

      if (res.data.status === 'success') {
        const uploadUrl = res.data.url;
        const fileKey = res.data.fileKey;

        // Step 2: Upload to S3 using PUT request
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
          },
          body: fileBlob,
        });

        if (uploadRes.status === 200) {

          return fileKey;  // Return the file key after successful upload
        } else {
          throw new Error('Failed to upload file to S3');
        }
      } else {
        throw new Error(res.data.errorMessage || 'Failed to get upload URL');
      }
    } catch (error) {

      throw error;  // Re-throw error for further handling
    }
  };

  const handleUploadFile = async () => {
    console.log('🟡 handleUploadFile started');
    setLoading(true);

    if (!pdf) {

      setLoading(false);
      return null;
    }

    try {
      // Get the actual file size
      const fileStat = await RNFS.stat(pdf.uri);
      const fileSize = fileStat.size;
      console.log('📏 File size:', fileSize, 'bytes', 'File URI:', pdf.uri);

      // Request upload URL from the backend
      console.log('🌐 Requesting upload URL from backend...');
      const res = await apiClient.post('/uploadFileToS3', {
        command: 'uploadFileToS3',
        headers: {
          'Content-Type': fileType,
          'Content-Length': fileSize,
        },
      });
      console.log('📨 Upload URL response:', res.data);

      if (res.data.status === 'success') {
        const uploadUrl = res.data.url;
        const fileKey = res.data.fileKey;
        console.log('🔗 Received upload URL:', uploadUrl);
        console.log('🆔 File key:', fileKey);

        // Convert the file to a Blob for upload
        const fileBlob = await uriToBlob(pdf.uri);
        console.log('📦 File converted to Blob:', fileBlob);

        // Upload the file to S3 using PUT
        console.log('🚀 Uploading file to S3...');
        const uploadRes = await fetch(uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': fileType,
          },
          body: fileBlob,
        });
        console.log('📤 Upload response status:', uploadRes.status);

        if (uploadRes.status === 200) {
          console.log('✅ File uploaded successfully');

          if (postData.resume_key && postData.resume_key !== fileKey) {
            console.log('🗑 Deleting old resume with key:', postData.resume_key);
            const deleted = await handleDeleteOldImage(postData.resume_key);
            console.log('🗑 Old resume deleted:', deleted);
            if (!deleted) {
              showToast("Failed to delete the old resume. Please try again", "error");
              return null;
            }
          }

          return fileKey; // Return the file key for saving in post data
        } else {
          throw new Error('Failed to upload file to S3');
        }
      } else {
        throw new Error(res.data.errorMessage || 'Failed to get upload URL');
      }
    } catch (error) {
      console.error('❌ Error in handleUploadFile:', error);

      if (!error.response) {
        // Network or internet error
        showToast("You don't have an internet connection", 'error');
      } else {
        showToast('Something went wrong', 'error');
      }
      return null;
    } finally {
      setLoading(false);
      console.log('🔚 handleUploadFile finished');
    }
  };

  // Helper function to convert URI to Blob
  const uriToBlob = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();

    return blob;
  };



  const [isLoading, setIsLoading] = useState(false);

  const handlePostSubmission = async () => {
    setIsLoading(true); // Start loading

    if (!postData.company_name) {
      showToast("Please provide a company name", 'info');
      setIsLoading(false);
      return;
    }

    if (selectedProfile && !selectedCategory) {
      showToast("Please select category too", 'info');
      setIsLoading(false);
      return;
    }

    if (!postData.business_registration_number) {
      showToast("Please provide a Business registration number", 'info');
      setIsLoading(false);
      return;
    }

    if (!postData.company_located_city) { // <-- City validation
      showToast("Please select city", 'info');
      setIsLoading(false);
      return;
    }

    const FILE_SIZE_LIMIT_MB = 5;
    const FILE_SIZE_LIMIT_BYTES = FILE_SIZE_LIMIT_MB * 1024 * 1024;

    if (imageUri) {
      try {
        const fileStat = await RNFS.stat(fileUri);
        const fileSize = fileStat.size;

        if (fileSize > FILE_SIZE_LIMIT_BYTES) {

          showToast("File size shouldn't exceed 5MB", 'error');
          setIsLoading(false);
          return;
        }
      } catch (error) {

        setIsLoading(false);
        return;
      }
    }

    const emailToSend = postData.is_email_verified ? postData.company_email_id : verifiedEmail;

    try {
      const imageFileKey = imageUri ? await handleUploadImage(imageUri, fileType) : postData.fileKey;

      const uploadedFileKey = await handleUploadFile();

      setHasChanges(false);
      const payload = {
        command: "updateCompanyProfile",
        company_id: profile.company_id,
        company_name: postData.company_name?.trimStart().trimEnd(),
        business_registration_number: postData.business_registration_number?.trimStart().trimEnd(),
        company_contact_number: postData.company_contact_number?.trimStart().trimEnd(),
        company_email_id: emailToSend?.trimStart().trimEnd(),
        company_located_city: postData.company_located_city?.trimStart().trimEnd(),
        company_located_state: postData.company_located_state?.trimStart().trimEnd(),
        is_email_verified: verifiedEmail || profile?.is_email_verified,
        Website: postData.Website?.trimStart().trimEnd(),
        company_address: postData.company_address?.trimStart().trimEnd(),
        company_description: postData.company_description?.trimStart().trimEnd(),
        fileKey: imageFileKey || null,
        brochureKey: uploadedFileKey,
        select_your_profile: selectedProfile,
        category: selectedCategory,

        // dark_mode: { android: false, ios: false, web: false }, 
      };

      const response = await axios.post(
        'https://h7l1568kga.execute-api.ap-south-1.amazonaws.com/dev/updateCompanyProfile',
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': 'k1xuty5IpZ2oHOEOjgMz57wHfdFT8UQ16DxCFkzk',
          },
        }
      );

      if (response.data.status === 'success') {
        setIsImageChanged(false);
        setHasChanges(false);

        showToast("Profile updated successfully", 'success');

        await fetchProfile();

        setTimeout(() => {
          navigation.goBack();
        }, 100);

      } else {

        showToast(response.data.errorMessage, 'error');

      }
    } catch (error) {

      showToast(error.message, 'error');

    } finally {
      setIsLoading(false);

    }
  };

  const fetchProfile = async () => {
    try {
      const response = await apiClient.post('/getCompanyDetails', {
        command: 'getCompanyDetails',
        company_id: profile.company_id,
      });

      if (response.data.status === 'success') {
        const profileData = response.data.status_message;
        const fileKey = profileData.fileKey?.trim() || '';
        profileData.fileKey = fileKey;
        let imageUrl = null;

        if (fileKey) {
          try {
            const res = await apiClient.post('/getObjectSignedUrl', {
              command: 'getObjectSignedUrl',
              key: fileKey,
            });
            imageUrl = res.data;
            profileData.imageUrl = imageUrl;
          } catch {
            profileData.imageUrl = null;
          }
        } else {
          profileData.imageUrl = null;
        }

        const authorImagePayload = {
          authorId: profile.company_id,
          newFileKey: fileKey,
          ...(fileKey && imageUrl && { newImageUrl: imageUrl }),
        };

        dispatch({
          type: 'UPDATE_AUTHOR_IMAGE_FOR_POSTS',
          payload: authorImagePayload,
        });

        const matchingJobs = jobs.filter(job => job.company_id === profile.company_id);

        if (fileKey && imageUrl) {
          const updatedJobImages = {};
          matchingJobs.forEach(job => {
            updatedJobImages[job.post_id] = imageUrl;
          });

          dispatch({
            type: 'SET_JOB_IMAGE_URLS',
            payload: updatedJobImages,
          });
        } else {
          const resolvedDefaultImage = Image.resolveAssetSource(default_image).uri;

          const defaultJobImages = {};
          matchingJobs.forEach(job => {
            defaultJobImages[job.post_id] = resolvedDefaultImage;
          });

          dispatch({
            type: 'SET_JOB_IMAGE_URLS',
            payload: defaultJobImages,
          });
        }

        if (profileData.brochureKey?.trim()) {
          try {
            const brochureRes = await apiClient.post('/getObjectSignedUrl', {
              command: 'getObjectSignedUrl',
              key: profileData.brochureKey,
            });
            profileData.brochureUrl = brochureRes.data;
          } catch {
            profileData.brochureUrl = null;
          }
        }

        dispatch(updateCompanyProfile(profileData));
        return profileData;
      }
    } catch (error) {
      dispatch(updateCompanyProfile(null));
      return null;
    }
  };


  const imageSource = file?.uri
    ? { uri: file?.uri }
    : localImageUrl
      ? { uri: localImageUrl }
      : require("../../images/homepage/buliding.jpg");


  return (
    <KeyboardAvoid>
      <View style={{ backgroundColor: 'whitesmoke', flex: 1 }}>
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ArrowLeftIcon width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />

          </TouchableOpacity>
        </View>



        <FlatList
          showsVerticalScrollIndicator={false}
          onScrollBeginDrag={() => Keyboard.dismiss()}
          scrollEventThrottle={16}
          data={[{ key: 'image' }, { key: 'formInputs' }, { key: 'footer' }]}
          renderItem={({ item }) => {
            switch (item.key) {
              case 'image':
                return (
                  <>
                    <Text style={styles.header}>Edit your profile</Text>

                    <TouchableOpacity onPress={handleImageSelection} style={styles.imageContainer}>

                      <FastImage
                        source={imageSource}
                        style={styles.image}
                        resizeMode='cover'
                        onError={() => { }}
                      />

                      <TouchableOpacity style={styles.cameraIconContainer} onPress={handleImageSelection}>
                        <Camera width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />


                      </TouchableOpacity>
                    </TouchableOpacity>
                  </>
                );

              case 'formInputs':
                return (
                  <TouchableOpacity activeOpacity={1} style={{ paddingHorizontal: 5, paddingBottom: '20%' }}>
                    {[
                      {
                        placeholder: 'Company name',
                        value: postData.company_name || '',
                        onChange: (value) => handleInputChange('company_name', value),
                        required: true,
                      },
                      {
                        placeholder: 'CIN / Business registration number',
                        value: postData.business_registration_number || '',
                        onChange: (value) => handleInputChange('business_registration_number', value),
                        required: true,
                      },
                      {
                        placeholder: 'Website',
                        value: postData.Website || '',
                        onChange: (value) => handleInputChange('Website', value),
                      },
                      {
                        placeholder: 'Company address',
                        value: postData.company_address || '',
                        onChange: (value) => handleInputChange('company_address', value),
                        multiline: true,
                      },
                      {
                        placeholder: 'Company description',
                        value: postData.company_description || '',
                        onChange: (value) => handleInputChange('company_description', value),
                        multiline: true,
                      },
                    ].map((input, index) => (


                      <View key={index} style={styles.inputContainer}>
                        <Text style={styles.label}>
                          {input.placeholder} {input.required && <Text style={{ color: 'red' }}>*</Text>}
                        </Text>
                        <TextInput
                          ref={(el) => (inputRefs.current[index] = el)}
                          style={[styles.inputText, input.multiline]}
                          value={input.value}
                          onChangeText={input.onChange}
                          keyboardType={input.keyboardType || 'default'}
                          multiline={input.multiline}
                          placeholderTextColor="gray"
                        />

                      </View>


                    ))}

                    <View style={styles.inputContainer}>
                      <Text style={[styles.label]}>Email ID <Text style={{ color: 'red' }}>*</Text></Text>
                      <View style={styles.inputWithButton}>
                        <TextInput
                          style={styles.inputemail1}
                          value={postData.company_email_id || ''}
                          onChangeText={(value) => handleInputChange('company_email_id', value)}
                          placeholder="Email"

                        />

                        {profile.is_email_verified && postData.company_email_id === profile.company_email_id ? (
                          <Success
                            width={dimensions.icon.small}
                            height={dimensions.icon.small}
                            color={colors.success}
                          />
                        ) : (
                          <TouchableOpacity
                            style={styles.buttonemailmain}
                            onPress={handleOtpEmail}
                          >
                            <Text style={styles.buttonTextemailtext}>
                              {loading ? 'Sending' : 'Verify'}
                            </Text>
                          </TouchableOpacity>
                        )}

                      </View>
                    </View>

                    <View style={styles.inputContainer}>
                      <Text style={styles.label}>Profile type</Text>
                      <CustomDropdown1
                        items={Object.keys({ ...ProfileSelect.companyProfiles }).map(p => ({
                          label: p,
                          key: p,
                        }))}
                        onSelect={handleProfileSelect}
                        placeholder={selectedProfile || "Select Profile Type"}
                        buttonStyle={styles.dropdownButton}
                        buttonTextStyle={styles.dropdownButtonText}
                        placeholderTextColor="gray"
                      />
                    </View>
                    {selectedProfile && (
                      <View style={styles.inputContainer}>

                        <Text style={styles.label}>
                          Category <Text style={{ color: 'red' }}>*</Text>
                        </Text>

                        <CustomDropdown1
                          items={availableCategories.map((cat) => ({
                            label: cat,
                            key: cat,
                          }))}
                          onSelect={handleCategorySelect}
                          placeholder={selectedCategory || "Select category"}
                          buttonStyle={styles.dropdownButton}
                          buttonTextStyle={styles.dropdownButtonText}
                          placeholderTextColor="gray"
                          disabled={!selectedProfile}
                        />
                      </View>

                    )}

                    <View style={styles.inputContainer}>

                      <Text style={[styles.label]}>Business phone no. <Text style={{ color: 'red' }}>*</Text></Text>

                      <TouchableOpacity onPress={() => setModalVisiblePhone(true)} activeOpacity={1}>
                        <TextInput
                          onPress={() => setModalVisiblePhone(true)}
                          style={[styles.inputText]}
                          value={postData.company_contact_number || ''}
                          onChangeText={(value) => handleInputChange('company_contact_number', value)}
                          editable={false}
                          placeholder="Business Phone Number"
                        />
                      </TouchableOpacity>
                    </View>


                    <View style={[styles.inputContainer, {}]}>
                      <Text style={[styles.label]}>State <Text style={{ color: 'red' }}>*</Text></Text>
                      <CustomDropdown1
                        items={states}
                        onSelect={handleStateSelect}
                        placeholder={postData.company_located_state || "Select State"}
                        buttonStyle={styles.dropdownButton}
                        buttonTextStyle={styles.dropdownButtonText}
                        placeholderTextColor="gray"

                      />
                    </View>
                    <View style={[styles.inputContainer, {}]}>
                      <Text style={[styles.label]}>City <Text style={{ color: 'red' }}>*</Text></Text>

                      <CustomDropdown1
                        items={cities}
                        onSelect={handleCitySelect}
                        placeholder={postData.company_located_city || "Select City"}
                        buttonStyle={styles.dropdownButton}
                        buttonTextStyle={styles.dropdownButtonText}
                        placeholderTextColor="gray"
                        disabled={!postData.state}
                      />
                    </View>

                    <View style={{ marginVertical: 20 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: 'black' }}>
                          {postData?.brochureKey ? postData.brochureKey : 'No file uploaded'}
                        </Text>

                        {postData?.brochureKey && (
                          <TouchableOpacity onPress={handleDeleteBrochure} style={{ marginLeft: 10 }}>
                            <Close width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.gray} />

                          </TouchableOpacity>
                        )}
                      </View>

                      {!postData?.brochureKey && (
                        <TouchableOpacity
                          style={styles.uploadButton}
                          onPress={handleFileChange}
                        >
                          <Text style={styles.uploadButtonText}>Upload company catalogue</Text>
                        </TouchableOpacity>
                      )}

                      {!pdf?.mime?.startsWith('image') && (
                        <MediaPreview
                          uri={pdf?.uri}
                          mime={pdf?.mime || 'application/octet-stream'}
                          name={pdf?.name}
                          onRemove={handleRemoveMedia}
                        />
                      )}

                    </View>
                    <TouchableOpacity
                      style={[
                        AppStyles.Postbtn,
                        (!hasChanges || isLoading) && styles.submitButtonDisabled
                      ]}
                      disabled={!hasChanges || isLoading}
                      onPress={handlePostSubmission}
                    >
                      {isLoading ? (
                        <ActivityIndicator size='small' color={'#075cab'} />
                      ) : (
                        <Text
                          style={[
                            AppStyles.PostbtnText,
                            (!hasChanges || isLoading) && styles.submitButtonTextDisabled
                          ]}
                        >
                          Update
                        </Text>
                      )}
                    </TouchableOpacity>
                  </TouchableOpacity>

                );

            }
          }}
          keyExtractor={(item) => item.key}
        />


        <Modal
          visible={isModalVisiblephone}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setModalVisiblePhone(false)}
        >

          <View style={styles.modalOverlay}
            onPress={() => {
              setPhoneNumber('');
              setModalVisiblePhone(false);
              setOtpSent(false)
              setIsOTPVerified(false)
              setTimer(0)
              setCountryCode('+91')
              setOtp(['', '', '', '', '', '']);
            }}
          >

            <View style={styles.modalContainer} >

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => {
                  setPhoneNumber('');
                  setModalVisiblePhone(false);
                  setOtpSent(false)
                  setIsOTPVerified(false)
                  setTimer(0)
                  setCountryCode('+91')
                  setOtp(['', '', '', '', '', '']);
                }}
              >
                <Close width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.secondary} />

              </TouchableOpacity>
              <View style={styles.inputrow}>
                <View style={[styles.code, { width: "25%", }]}>
                  <PhoneDropDown
                    options={CountryCodes}
                    selectedValue={countryCode}
                    onSelect={(item) => setCountryCode(item.value)}
                  />
                </View>

                <TextInput
                  style={[
                    styles.inputPhoneNumber,
                    phoneNumber.length > 0 && { letterSpacing: 1 },
                  ]}
                  value={phoneNumber}
                  onChangeText={handlePhoneNumberChange}
                  placeholder="Enter phone number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  placeholderTextColor='gray'
                />
              </View>


              {otpSent && !isOTPVerified && (
                <View>

                  <TextInput
                    style={[
                      styles.otpInput,
                      isTypingOtp && { letterSpacing: 5 },
                    ]}
                    value={otp}
                    onChangeText={(value) => {
                      if (/^\d*$/.test(value)) {
                        setOtp(value);
                        setIsTypingOtp(value.length > 0); // update typing state

                        if (value.length === 6) {
                          Keyboard.dismiss();
                        }
                      }
                    }}
                    placeholder="Enter OTP"
                    keyboardType="numeric"
                    maxLength={6}
                    placeholderTextColor="gray"
                  />


                  <TouchableOpacity onPress={handleVerifyOTP} style={{ alignSelf: 'center', }}>
                    <Text style={styles.buttonText1}>Verify</Text>
                  </TouchableOpacity>

                  {!isResendEnabled ? (
                    <Text style={styles.timerText}>Resend in {timer}</Text>
                  ) : (
                    <TouchableOpacity onPress={resendHandle} style={{ alignSelf: 'center', }}>
                      <Text style={styles.buttonText1}>Resend OTP</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {!otpSent && (
                <TouchableOpacity onPress={sendOTPHandle} style={{ alignSelf: 'center', }}>
                  <Text style={styles.buttonText1}>Get verification code</Text>
                </TouchableOpacity>
              )}

              {isOTPVerified && (
                <TouchableOpacity onPress={handlePhoneNumberUpdate} style={{ alignSelf: 'center', }} >
                  <Text style={styles.buttonText1}>Update</Text>
                </TouchableOpacity>
              )}

              {/* <TouchableOpacity
                          style={styles.closeButton}
                          onPress={() => {
                            setModalVisiblePhone(false)
                          }}
                        >
                          <Ionicons name="close" size={24} color="black" />
                        </TouchableOpacity> */}

            </View>
          </View>
        </Modal>

        <Modal
          visible={modalVisibleemail}
          animationType="slide"
          onRequestClose={() => setModalVisibleemail(false)}
          transparent={true}
        >
          <View style={styles.modalContaineremail}>
            <View style={styles.modalContentemail}>
              {/* Close Icon */}
              <TouchableOpacity
                style={styles.closeButton1}
                onPress={() => {
                  setModalVisibleemail(false);
                  setOtp1(['', '', '', '', '', '']);
                }}
              >
                <Close width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.gray} />

              </TouchableOpacity>

              <Text style={styles.modalTitleemail}></Text>
              <TextInput
                style={[
                  styles.otpInput,
                  isTypingOtp && { letterSpacing: 10 },
                ]}
                value={otp1} // Bind the string state directly
                onChangeText={(value) => {
                  if (/^\d*$/.test(value)) {
                    setOtp1(value);
                    setIsTypingOtp(value.length > 0); // update typing state

                    if (value.length === 6) {
                      Keyboard.dismiss();
                    }
                  }
                }}
                placeholder="Enter OTP"
                keyboardType="numeric"
                placeholderTextColor="gray"
                maxLength={6}
              />

              <TouchableOpacity
                style={styles.buttonemail}
                onPress={handleOtpVerification1}
              >
                <Text style={styles.buttonTextemail}>Verify OTP</Text>
              </TouchableOpacity>


              {!isOTPVerified && otpTimer === 0 && (
                <TouchableOpacity
                  style={[styles.buttonemail]}
                  onPress={() => {
                    handleResendOtp();
                    startOtpTimer(); // Restart timer when OTP is resent
                  }}
                >
                  <Text style={styles.buttonTextemail}>Resend OTP</Text>
                </TouchableOpacity>
              )}
              {otpTimer > 0 && !isOTPVerified && (
                <Text style={styles.timerText}>Resend in {otpTimer}s</Text>
              )}
            </View>
          </View>
        </Modal>


        <Message3
          visible={showModal}
          onClose={() => setShowModal(false)}  // Optional if you want to close it from outside
          onCancel={handleStay}  // Stay button action
          onOk={handleLeave}  // Leave button action
          title="Are you sure ?"
          message="Your updates will be lost if you leave this page. This action cannot be undone."
          iconType="warning"  // You can change this to any appropriate icon type
        />
      </View>
    </KeyboardAvoid>
  );
}


const styles = StyleSheet.create({
  imageContainer: {
    borderRadius: 70,
    alignSelf: 'center',
    justifyContent: 'center',
    height: 140,
    width: 140,
    marginVertical: 10,

  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  avatarText: {
    fontSize: 50,
    fontWeight: 'bold',
  },

  inputTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'black',
    marginBottom: 10,
  },
  otpInput: {
    height: 50,
    width: '80%',
    alignSelf: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 18,
    color: '#000',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
    marginVertical: 10,
  },

  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
    backgroundColor: '#fff',
    height: 50,
    borderRadius: 8,
    fontSize: 16,
    color: '#222',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ddd'
  },

  inputIcon: {
    position: 'absolute',
    right: 5,
    top: 5,
  },

  inputTitle1: {
    fontSize: 15,
    fontWeight: '490',
    color: 'black',
    padding: 10,

  },
  inputbox: {
    backgroundColor: '#fff',
    borderRadius: 8,
    fontSize: 16,
    color: '#222',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    minHeight: 50,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ddd'
  },

  dropdownButton: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ddd'
  },
  dropdownButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text_primary,
    flex: 1,
    padding: 5
  },
  inputText: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: '500',
    color: colors.text_primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 15,

  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    // padding: 15,
    // marginBottom:15,
    // backgroundColor: '#E0E0E0',
    borderRadius: 50,
  },


  cameraIconContainer: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 6,

  },
  buttonTextDelete: {
    textAlign: 'center',
    padding: 10,
    color: 'red',
    fontSize: 15,
    fontWeight: '500',
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 75,
  },
  imageText: {
    color: '#7E7E7E',
  },
  pdfContainer: {
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10

  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 25,
    textAlign: 'center',
    color: '#075cab',
    top: 10,
  },

  pdfText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  pdfUri: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  uploadButton: {
    backgroundColor: 'whitesmoke',
    padding: 10,
    alignItems: 'center',
    width: '60%',
    alignSelf: 'center'
  },
  uploadbtn: {
    paddingVertical: 10,
    alignSelf: 'center'

  },

  uploadButtonText: {
    color: '#075cab',
    fontWeight: '500',
    fontSize: 15,
  },
  Uploadcontainer: {
    textAlign: 'center',
    alignItems: 'center',

  },

  button: {
    borderRadius: 5,
    paddingVertical: 15,
    marginVertical: 20,
    alignItems: 'center',
  },
  buttonText: {
    color: '#075cab',
    fontSize: 17,
    fontWeight: '500',
  },
  modalView: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 50,
    padding: 20,
  },
  modalItem: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'green',
  },
  modalItemText: {
    fontSize: 18,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#075cab',
  },


  addressfeild: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 15,
    borderColor: 'gray',
    borderWidth: 0.5,
    marginVertical: 20,
  },


  addButtonSmall: {
    backgroundColor: '#007BFF',
    borderRadius: 50,
    padding: 10,
  },
  inputContainer: {
    marginBottom: 10,
    color: "black",

  },
  inputWithButton: {
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12
  },
  modalTitleemail: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputemail: {
    width: '100%',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
    color: 'black'
  },
  buttonemail: {

    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    width: '100%',
    alignItems: 'center',
  },
  buttonTextemail: {
    color: '#075cab',
    fontSize: 15,
    fontWeight: '500',
    padding: 5,
  },

  modalContaineremail: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Background overlay
  },
  closeButton1: {
    position: 'absolute',
    top: 10,
    right: 10,

    borderRadius: 15,
    padding: 5,
  },
  modalContentemail: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    position: 'relative',
  },
  inputemail1: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    fontSize: 13,
    fontWeight: '500',
    color: colors.text_primary

  },
  buttonemailmain: {
    borderRadius: 5,

  },
  buttonTextemailtext: {
    color: '#075cab',
    fontSize: 14,
    fontWeight: '600',
    padding: 10,

  },

  verifiedIcon: {
    marginRight: 10
  },
  input: {
    flexDirection: 'row',
    padding: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    paddingHorizontal: 5,
    borderRadius: 8,
    fontSize: 16,
    color: '#222',

  },
  label: {
    color: colors.text_primary,
    fontSize: 15,
    fontWeight: '500',
    marginVertical: 5,
    paddingHorizontal: 5,
  },

  dropdownItemText: {
    fontSize: 16,
    color: '#000',
  },

  submitButtonDisabled: {
    borderColor: '#ccc',
    // backgroundColor: '#f2f2f2',
  },

  submitButtonTextDisabled: {
    color: '#999',
  },

  inputrow: {
    flexDirection: 'row',
    justifyContent: 'start',
    alignItems: 'center',

  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    padding: 30,
    gap: 10,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 2,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#075cab',
    textAlign: 'center',
    marginBottom: 15,
  },
  inputPhoneNumber: {
    width: '100%',
    height: 40,
    borderRadius: 8,
    // paddingHorizontal: 15,
    fontSize: 16,
    color: 'black',
    paddingHorizontal: 15,
    // backgroundColor: '#f8f9fa',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginVertical: 10,
  },

  buttonText1: {
    color: '#075cab',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    // backgroundColor: '#075cab',
    borderRadius: 8,
    padding: 5,
    // width: '100%', // Full-width button
  },
  timerText: {
    color: 'firebrick',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
  },


});

export default CompanyUserSignupScreen;