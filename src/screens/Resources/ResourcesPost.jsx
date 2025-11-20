

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ScrollView, TextInput, Alert, ActivityIndicator, Modal, Keyboard, ActionSheetIOS, KeyboardAvoidingView, TouchableWithoutFeedback, NativeModules } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';

import Video from 'react-native-video';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Message3 from '../../components/Message3';
import { Image as FastImage } from 'react-native';
import ImageResizer from 'react-native-image-resizer';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useDispatch, useSelector } from 'react-redux';
import PlayOverlayThumbnail from '../Forum/Play';
import { showToast } from '../AppUtils/CustomToast';
import { useNetwork } from '../AppUtils/IdProvider';
import apiClient from '../ApiClient';
import { EventRegister } from 'react-native-event-listeners';
import AppStyles from '../AppUtils/AppStyles';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { cleanForumHtml } from '../Forum/forumBody';
import { MediaPickerButton } from '../helperComponents/MediaPickerButton';
import { useMediaPicker } from '../helperComponents/MediaPicker';
import { uploadFromBase64 } from '../Forum/VideoParams';
import { MediaPreview } from '../helperComponents/MediaPreview';
import { useS3Uploader } from '../helperComponents/useS3Uploader';
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import { colors, dimensions } from '../../assets/theme.jsx';

const { DocumentPicker } = NativeModules;

async function uriToBlob(uri) {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
}

const calculateAspectRatio = (width, height) => {
  if (!width || !height || height <= 0) return 1;
  return width / height;
};

const ResourcesPost = () => {
  const navigation = useNavigation();
  const profile = useSelector(state => state.CompanyProfile.profile);

  const { myId, myData } = useNetwork();

  const [postData, setPostData] = useState({
    title: '',
    body: '',
    fileKey: '',
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const scrollViewRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [thumbnailUri, setThumbnailUri] = useState(null);
  const [overlayUri, setOverlayUri] = useState(null);
  const [mediaMeta, setMediaMeta] = useState(null);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [compressedImage, setCompressedImage] = useState(null);

  const { uploadFile, uploading } = useS3Uploader();
  const handleRemoveMedia = () => {
    setFile(null);
    setFileType('');
    setMediaMeta(null);
  };

  useEffect(() => {
    const titleChanged = postData.title.trim() !== '';
    const bodyChanged = postData.body.trim() !== '';
    const filekey = postData.fileKey.trim() !== ''; // This line is most likely the issue

    setHasChanges(titleChanged || bodyChanged || filekey);
  }, [postData]);



  const hasUnsavedChanges = Boolean(hasChanges);
  const [pendingAction, setPendingAction] = React.useState(null);
console.log('hasUnsavedChanges',hasUnsavedChanges)

useEffect(() => {
  // Listener for preventing navigation using the bottom tab bar
  const preventTabSwitch = navigation.addListener('tabPress', (e) => {
    if (hasChanges) {
      // Prevent tab switch if there are unsaved changes
      e.preventDefault();
      setShowModal(true);  // Show custom modal
    }
  });

  // Listener for preventing navigation using the back button
  const unsubscribe = navigation.addListener('beforeRemove', (e) => {
    if (!hasChanges) {
      return; // Allow navigation if no changes
    }

    e.preventDefault(); // Prevent the default action
    setShowModal(true);  // Show custom modal
  });

  return () => {
    preventTabSwitch();
    unsubscribe();
  };
}, [navigation, hasChanges]);
  

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


  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const isValid = postData.body.trim().length > 0 && postData.title.trim().length > 0;
    setIsFormValid(isValid);
  }, [postData.body, postData.title]);


  const bodyEditorRef = useRef();
  const [activeEditor, setActiveEditor] = useState('title'); // not 'title'


  const handleBodyFocus = () => {
    setActiveEditor('body');
    bodyEditorRef.current?.focus(); // Focus the body editor
  };



  const stripHtmlTags = (html) =>
    html?.replace(/<\/?[^>]+(>|$)/g, '').trim() || '';


  // Title Input Handler
  const handleTitleChange = (text) => {
    if (text === "") {
      setPostData(prev => ({ ...prev, title: "" }));
      return;
    }

    const trimmed = text.trimStart();
    if (trimmed === "") {
      showToast("Leading spaces are not allowed", "error");
      return;
    }

    const withoutLeadingSpaces = text.replace(/^\s+/, "");

    if (withoutLeadingSpaces.length > 100) {
      showToast("Title cannot exceed 100 characters", "info");
      return;
    }

    setPostData(prev => ({ ...prev, title: withoutLeadingSpaces }));
  };

  // RichEditor Body Input Handler
  const handleBodyChange = (html) => {
    if (html === "") {
      setPostData(prev => ({ ...prev, body: "" }));
      return;
    }

    // Extract plain text from HTML to validate leading spaces
    const plainText = stripHtmlTags(html);

    if (plainText.trimStart() === "") {
      showToast("Leading spaces are not allowed", "error");
      return;
    }

    // Save the cleaned HTML (if needed) or original input
    setPostData(prev => ({ ...prev, body: html.replace(/^\s+/, "") }));
  };


  const {
    showMediaOptions,
    pickVideo,
    isCompressing,
    overlayRef,
  } = useMediaPicker({
    onMediaSelected: (file, meta, previewThumbnail) => {
      setFile(file);
      setFileType(file.type);
      setMediaMeta(meta);
      setThumbnailUri(previewThumbnail);
    },
    includeDocuments: true, // No document option for forum posts
    includeCamera: false,     // Include camera option
    mediaType: 'mixed',      // Allow both photos and videos
    maxImageSizeMB: 5,
    maxVideoSizeMB: 10,
  });








  const [capturedThumbnailUri, setCapturedThumbnailUri] = useState(null);

  const playIcon = require('../../images/homepage/PlayIcon.png');



  const handleThumbnailUpload = async (thumbnailUri, fileKey) => {
    try {
      const thumbStat = await RNFS.stat(thumbnailUri);
      const thumbBlob = await uriToBlob(thumbnailUri);

      const thumbnailFileKey = `thumbnail-${fileKey}`;

      const res = await apiClient.post('/uploadFileToS3', {
        command: 'uploadFileToS3',
        fileKey: thumbnailFileKey,
        headers: {
          'Content-Type': 'image/jpeg',
          'Content-Length': thumbStat.size,
        },
      });

      if (res.data.status !== 'success') {
        throw new Error('Failed to get upload URL for thumbnail');
      }

      const uploadUrl = res.data.url;

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'image/jpeg' },
        body: thumbBlob,
      });

      if (uploadRes.status !== 200) {
        throw new Error('Failed to upload thumbnail to S3');
      }

      return thumbnailFileKey;
    } catch (error) {

      return null;
    }
  };


  const handleUploadFile = async () => {
    if (!file) {
      console.log('📂 No file selected for upload');
      return { fileKey: null, thumbnailFileKey: null };
    }

    setLoading(true);
    console.log('⏫ Upload starting for file:', file);

    try {
      const fileStat = await RNFS.stat(file.uri);
      const fileSize = fileStat.size;
      console.log('📏 File size:', fileSize);

      const res = await apiClient.post('/uploadFileToS3', {
        command: 'uploadFileToS3',
        headers: {
          'Content-Type': fileType,
          'Content-Length': fileSize,
        },
      });

      if (res.data.status !== 'success') {
        console.error('❌ Failed to get S3 URL:', res.data);
        throw new Error(res.data.errorMessage || 'Failed to get upload URL');
      }

      const { url: uploadUrl, fileKey } = res.data;
      console.log('✅ Got S3 Upload URL and fileKey:', { uploadUrl, fileKey });

      const fileBlob = await uriToBlob(file.uri);
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': fileType },
        body: fileBlob,
      });

      console.log('📤 Upload to S3 response status:', uploadRes.status);

      if (uploadRes.status !== 200) {
        throw new Error('Failed to upload file to S3');
      }

      let thumbnailFileKey = null;

      if (file.type.startsWith("video/")) {

        thumbnailFileKey = await uploadFromBase64(overlayUri, fileKey);

      }

      return { fileKey, thumbnailFileKey };

    } catch (error) {
      console.error('🚨 Error in handleUploadFile:', error);
      showToast("Something went wrong", 'error');
      return { fileKey: null, thumbnailFileKey: null };

    } finally {
      setLoading(false);
    }
  };
  
  const handleMediaPickerPress = () => {
    Alert.alert(
      'Select Media',
      'Choose an option',
      [
        {
          text: 'Open Gallery',
          onPress: () => {
            openGallery();
          },
        },
        {
          text: 'Select Video',
          onPress: () => {
            pickVideo();
          },
        },
        {
          text: 'Select PDF',
          onPress: () => {
            selectPDF();
          },
        },
      ],
      { cancelable: true }
    );
  };
  

  const openGallery = async () => {
    try {
      // 1️⃣ Pick the file using DocumentPicker
      const pickedFiles = await DocumentPicker.pick({
        allowMultiple: false,
        type: ['image/*'],
      });

      if (!pickedFiles || pickedFiles.length === 0) return;

      const file = pickedFiles[0];

      const maxWidth = 1080;   // max Instagram feed width
      const maxHeight = 1350;  // max portrait height
      const ratio = Math.min(maxWidth / file.width, maxHeight / file.height, 1);

      const resizedWidth = Math.round(file.width * ratio);
      const resizedHeight = Math.round(file.height * ratio);

      const compressedImage = await ImageResizer.createResizedImage(
        file.uri,
        resizedWidth,
        resizedHeight,
        'JPEG',
        80
      );

      const compressedSizeMB = compressedImage.size / 1024 / 1024;
      if (compressedSizeMB > 5) {
        showToast("Image size shouldn't exceed 5MB", 'error');
        return;
      }

      const aspectRatio = calculateAspectRatio(file.width, file.height);
      // 3️⃣ Save file and metadata like your old pattern
      const meta = {
        aspectRatio,
        name: file.name,
        type: file.mime
      };

      setFile(file);                      // original picked file
      setFileType(file.type || 'image/jpeg');
      setMediaMeta(meta);
      setCompressedImage(compressedImage)
    } catch (err) {
      if (err?.message?.includes('cancelled') || err?.code === 'E_PICKER_CANCELLED') return;
      console.error('Error picking/compressing image:', err);
      showToast('Failed to pick or compress image', 'error');
    }
  };

  const selectPDF = async () => {
    try {
      // Open the native document picker for all files
      const pickedFiles = await DocumentPicker.pick({
        allowMultiple: false,
        category: 'docs' // <-- pick all files
      });

      if (!pickedFiles || pickedFiles.length === 0) return;

      const file = pickedFiles[0];
      console.log('Picked file:', file);

      const fileSize = file.size;
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      const mimeType = file.mime || file.type || 'application/octet-stream';

      // ✅ Optional: size validation
      if (fileSize > MAX_SIZE) {
        showToast("File size must be less than 5MB.", "error");
        setFile(null);
        setFileType(null);
        return;
      }

      const meta = {
        name: file.name,
        size: fileSize,
        type: mimeType,
        // Width/height are skipped since files may not have them
      };

      // Store file in state
      setFile(file);
      setFileType(mimeType);
      setMediaMeta(meta);

      console.log('Selected file stored:', file);

    } catch (err) {
      if (err?.message?.includes('cancelled') || err?.code === 'E_PICKER_CANCELLED') return;
      console.error("Native DocumentPicker error:", err);
      showToast("An unexpected error occurred while picking the file.", "error");
    }
  };


  const sanitizeHtmlBody = (html) => {
    const cleaned = cleanForumHtml(html); // your existing cleaner

    return cleaned
      .replace(/<div><br><\/div>/gi, '') // remove empty line divs
      .replace(/<p>(&nbsp;|\s)*<\/p>/gi, '') // remove empty p tags
      .replace(/<div>(&nbsp;|\s)*<\/div>/gi, '') // remove empty divs
      .trim(); // trim outer whitespace
  };

  const handlePostSubmission = async () => {
  
    setLoading(true);

    try {
      const trimmedTitle = postData.title?.trim();
      const rawBodyHtml = postData.body?.trim();
      const currentTimestampInSeconds = Math.floor(Date.now() / 1000);

      if (!trimmedTitle || !rawBodyHtml) {
        showToast("Title and body are required", 'info');
        return;
      }

      const cleanedBody = sanitizeHtmlBody(rawBodyHtml);

      // Initialize keys
      let fileKey = null;
      let thumbnailFileKey = null;

      // Upload file (and thumbnail if video)
      const uploaded = await uploadFile(compressedImage, file, overlayUri, fileType);
      if (uploaded) {
        fileKey = uploaded.fileKey;
        thumbnailFileKey = uploaded.thumbnailFileKey;
        console.log('Uploaded files:', fileKey, thumbnailFileKey);
      }
      setHasChanges(false)
      const postPayload = {
        command: "postInResources",
        user_id: myId,
        title: trimmedTitle,
        resource_body: cleanedBody,
        posted_on: currentTimestampInSeconds,
        ...(fileKey && { fileKey }),
        ...(fileKey && thumbnailFileKey && { thumbnail_fileKey: thumbnailFileKey }),
        ...(fileKey && mediaMeta && Object.keys(mediaMeta).length > 0 && { extraData: mediaMeta }),
      };

      console.log('📦 Final postPayload:', postPayload);

      const res = await apiClient.post('/postInResources', postPayload);

      if (res.data.status === 'success') {
        const enrichedPost = {
          ...postPayload,
          resource_id: res.data.resource_details?.resource_id,
          
        };
        setHasChanges(false)
        EventRegister.emit('onResourcePostCreated', { newPost: enrichedPost });

        await clearCacheDirectory();
        
        setPostData({ title: '', body: '', fileKey: '' });
        setFile(null);
        setThumbnailUri(null);
        showToast("Resource post submitted successfully", 'success');
        navigation.goBack();
      } else {
        console.error('❌ Submission failed:', res.data);
        showToast("Failed to submit post", 'error');
      }

    } catch (error) {
      console.error('🚨 Error in handlePostSubmission:', error);
      const message =
        error?.response?.data?.status_message ||
        error?.message ||
        'Something went wrong';

      showToast(message, 'error');

    } finally {
      setLoading(false);
      
    }
  };



  const cleanUpFile = async (uri) => {
    try {
      const fileStat = await RNFS.stat(uri);
      const fileSize = fileStat.size;
      const isFileExists = await RNFS.exists(uri);

      if (isFileExists) {

        await RNFS.unlink(uri);

      } else {

      }
    } catch (error) {

    }
  };

  const clearCacheDirectory = async () => {
    try {
      const cacheDir = RNFS.CachesDirectoryPath;
      const files = await RNFS.readDir(cacheDir);


      for (const file of files) {
        await RNFS.unlink(file.path);

      }
    } catch (error) {

    }
  };


  useFocusEffect(
    React.useCallback(() => {
      return () => {

        clearCacheDirectory();
        cleanUpFile();
      };
    }, [])
  );


  useFocusEffect(
    React.useCallback(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    }, [])
  );


  const clearFile = () => {
    setFile(null);
  };


  return (

    <View style={styles.container}>

      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />

        </TouchableOpacity>
        <TouchableOpacity
          onPress={handlePostSubmission}
          style={[
            AppStyles.buttonContainer,
            !isFormValid || loading || isCompressing ? styles.disabledButton : null,
          ]}
          disabled={!isFormValid || loading || isCompressing}
        >
          {loading || isCompressing ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <Text style={[styles.buttonText, (!postData.body.trim()) && styles.buttonDisabledText]} >Post</Text>

          )}
        </TouchableOpacity>

      </View>

      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 10, paddingBottom: '40%' }}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={20}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => Keyboard.dismiss}
      >

        <View style={styles.profileContainer}>
          <View style={styles.imageContainer}>
            {profile?.fileKey ? (
              <Image
                source={{ uri: profile?.imageUrl }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: 10,
                }}
              />
            ) : (
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  marginRight: 10,
                  backgroundColor: profile?.companyAvatar?.backgroundColor || '#ccc',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: profile?.companyAvatar?.textColor || '#000', fontWeight: 'bold' }}>
                  {profile?.companyAvatar?.initials || '?'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.profileTextContainer}>
            <Text style={styles.profileName}>
              {profile?.company_name
                ? profile.company_name
                : `${profile?.first_name || ''} ${profile?.last_name || ''}`}
            </Text>
            <Text style={styles.profileCategory}>{profile?.category}</Text>
          </View>
        </View>

        <TextInput
          style={[styles.input, { height: 50 }]}
          value={postData.title}
          multiline
          placeholder="Enter title ..."
          placeholderTextColor="gray"
          onChangeText={handleTitleChange}
        />


        <RichEditor
          ref={bodyEditorRef}
          useContainer={true}
          style={{
            minHeight: 250,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: '#ccc',
            overflow: 'hidden',
          }}
          onTouchStart={() => setActiveEditor('body')}
          onFocus={() => handleBodyFocus('body')}
          initialContentHTML={postData.body}
          placeholder="Describe your resource in detail ..."
          editorInitializedCallback={() => { }}
          onChange={handleBodyChange}
          editorStyle={{
            cssText: `
      * {
        font-size: 15px !important;
        line-height: 20px !important;
      }
      p, div, ul, li, ol, h1, h2, h3, h4, h5, h6 {
        margin: 0 !important;
        padding: 10 !important;
      }
      body {
        padding: 10 !important;
        margin: 0 !important;
      }
    `
          }}
        />

        <RichToolbar
          key={`toolbar-${activeEditor}`}
          editor={bodyEditorRef}
          actions={[
            actions.setBold,
            actions.setItalic,
            actions.insertBulletsList,
            actions.insertOrderedList,
            actions.insertLink,
          ]}
          iconTint="#000"
          selectedIconTint="#075cab"
          selectedButtonStyle={{ backgroundColor: "#eee" }}
        />





        <MediaPreview
          uri={file?.uri}
          type={fileType || file?.type || 'application/octet-stream'} // ensure type is never undefined
          name={file?.name}
          thumbnailBase64={file?.thumbnailBase64} // optional chaining
          onRemove={handleRemoveMedia}
        />


        {!file && (
          <MediaPickerButton
            onPress={handleMediaPickerPress}
            isLoading={isCompressing}
          />
        )}

        <Message3
          visible={showModal}
          onClose={() => setShowModal(false)}
          onCancel={handleStay}
          onOk={handleLeave}
          title="Are you sure ?"
          message="Your updates will be lost if you leave this page. This action cannot be undone."
          iconType="warning"
        />

      </KeyboardAwareScrollView>

      <PlayOverlayThumbnail
        thumbnailUri={thumbnailUri} // input
        onCaptured={(dataUri) => {
          if (dataUri && dataUri.trim() !== "") {
            setOverlayUri(dataUri);   // ✅ captured overlay thumbnail
          } else {
            setOverlayUri(thumbnailUri); // 🔄 fallback to original
          }
        }}
      />

    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
  },

  closeIcon: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 26,
    height: 26,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5,
    elevation: 3,
    zIndex: 4
  },
  uploadButton: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: 'gray',
    borderStyle: 'dotted',
    backgroundColor: 'white',
    borderRadius: 15
  },

  fileKeyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,

    paddingHorizontal: 15,
  },

  fileKeyText: {
    fontSize: 13,
    color: '#333',
    flex: 1,
    marginRight: 10,
  },

  deleteIcon: {
    padding: 5,
    marginLeft: 10,
  },
  scrollView: {
    flex: 1,
    padding: 10
  },
  mediatext: {
    color: 'gray',
    fontWeight: '500',
    fontSize: 16,
    color: 'black',
  },
  mediaContainer1: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  mediaContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    alignSelf: 'center'
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,

  },
  detailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    overflow: 'hidden',

  },
  imageContainer: {
    width: 40,
    height: 40,
    borderRadius: 80,
    alignSelf: 'center',
    justifyContent: 'center',
    marginRight: 10

  },
  closeButton1: {
    position: 'absolute',
    top: 60,
    right: 20,
  },
  modalImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  mediaWrapper: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mediaPreview: {
    width: '100%',
    height: undefined,
    resizeMode: 'contain',
    aspectRatio: 16 / 9,  // This is just an example; it keeps a typical video aspect ratio. Adjust it if needed.
    marginBottom: 10,   // This ensures the aspect ratio is preserved for images and videos
    marginBottom: 10, // Optional: Adds some space below the media
  },
  spaceAtBottom: {
    height: 20,  // Space at the bottom (adjust as needed)
  },
  deleteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 25,
    marginRight: 10,
  },
  profileTextContainer: {
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
  },
  profileCategory: {
    fontSize: 14,
    color: 'gray',
    fontWeight: '400'
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    fontSize: 14,
    textAlignVertical: 'top', // Align text to the top for multiline
    color: 'black',
    textAlign: 'justify',
    backgroundColor: 'white',
    marginBottom: 10,
  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },


  disabledButton: {
    backgroundColor: '#ccc',
    
  },

  buttonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#fff',
  },
  buttonDisabledText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },

  buttonTextdown: {
    textAlign: 'center',
    fontSize: 16,
    color: '#075cab',
    fontWeight: '500',
  },
  disabledButton1: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  disabledButtonText: {
    color: '#ccc',
  }
});






export default ResourcesPost;
