

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Modal, Keyboard, NativeModules, Alert, } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import RNFS from 'react-native-fs';
import Message3 from '../../components/Message3';

import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import PlayOverlayThumbnail from './Play';
import { showToast } from '../AppUtils/CustomToast';
import { useNetwork } from '../AppUtils/IdProvider';
import apiClient from '../ApiClient';
import { EventRegister } from 'react-native-event-listeners';
import AppStyles, { STATUS_BAR_HEIGHT } from '../AppUtils/AppStyles';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { sanitizeHtmlBody } from './forumBody';
import { useSelector } from 'react-redux';
import { useMediaPicker } from '../helperComponents/MediaPicker';
import { MediaPreview } from '../helperComponents/MediaPreview';
import { MediaPickerButton } from '../helperComponents/MediaPickerButton';
import { handleThumbnailUpload, saveBase64ToFile, uploadFromBase64 } from './VideoParams';
import { useS3Uploader } from '../helperComponents/useS3Uploader';
import ImageResizer from 'react-native-image-resizer';
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

const ForumPostScreen = () => {

  const profile = useSelector(state => state.CompanyProfile.profile);
  const { myId, myData } = useNetwork();
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [mediaMeta, setMediaMeta] = useState(null);

  const [compressedImage, setCompressedImage] = useState(null);
  const navigation = useNavigation();
  const [postData, setPostData] = useState({
    body: '',
    fileKey: '',
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const scrollViewRef = useRef(null);
  const [thumbnailUri, setThumbnailUri] = useState(mediaMeta?.previewThumbnail);
  const [overlayUri, setOverlayUri] = useState(null);       // auto-captured overlay

  const [loading, setLoading] = useState(false);
  const richText = useRef();
  const { uploadFile, uploading } = useS3Uploader();

  useEffect(() => {
    setThumbnailUri(mediaMeta?.previewThumbnail)
  }, [mediaMeta])

  useEffect(() => {

    const bodyChanged = postData.body.trim() !== '';
    const filekey = postData.fileKey.trim() !== '';

    setHasChanges(bodyChanged || filekey);
  }, [postData]);


  const hasUnsavedChanges = Boolean(hasChanges);
  const [pendingAction, setPendingAction] = React.useState(null);


  React.useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasUnsavedChanges) return;

      e.preventDefault();

      setPendingAction(e.data.action);
      setShowModal(true);
    });

    return unsubscribe;
  }, [hasUnsavedChanges, navigation]);

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


  const handleMediaPickerPress = () => {
    Alert.alert(
      'Select Media',
      'Choose an option',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
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
      ],
      { cancelable: true }
    );
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
    includeDocuments: false, // No document option for forum posts
    includeCamera: false,     // Include camera option
    mediaType: 'mixed',      // Allow both photos and videos
    maxImageSizeMB: 5,
    maxVideoSizeMB: 10,
  });


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
        type: file.type || 'image/jpeg',
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


  const handleRemoveMedia = () => {
    setFile(null);
    setFileType('');
    setMediaMeta(null);
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

      };
    }, [])
  );


  const cleanHtmlSpaces = (html) => {
     if (!html) return "";
   
     let cleaned = html;
 
     const emptyBlock = /<div>\s*(?:<span>\s*)?(?:<br\s*\/?>)\s*(?:<\/span>)?\s*<\/div>/gi;
     cleaned = cleaned.replace(new RegExp(`^(?:${emptyBlock.source})+`, "i"), "");
     cleaned = cleaned.replace(new RegExp(`(?:${emptyBlock.source})+$`, "i"), "");
     cleaned = cleaned.trim();
   
     return cleaned;
   };
  
   
   const handleBodyChange = (html) => {
   
     const cleanedBody = sanitizeHtmlBody(html);
     const finalBody = cleanHtmlSpaces(cleanedBody);
 
     setPostData(prev => ({
       ...prev,
       body: finalBody
     }));
   };




  const handlePostSubmission = async () => {
    if (loading) return;

    setHasChanges(true);
    setLoading(true);

    try {
      setHasChanges(false);

      if (!postData.body.trim()) {
        showToast("Description is mandatory", "info");
        return;
      }

      // const uploadedFiles = await handleUploadFile();
      // if (!uploadedFiles) throw new Error("File upload failed.");

      // const { fileKey, thumbnailFileKey } = uploadedFiles;
      // Initialize keys
      let fileKey = null;
      let thumbnailFileKey = null;

      // Upload file (and thumbnail if video)
      const uploaded = await uploadFile(compressedImage, file, overlayUri, fileType);
      if (uploaded) {
        fileKey = uploaded.fileKey;
        thumbnailFileKey = uploaded.thumbnailFileKey;
      
      }


      const postPayload = {
        command: "postInForum",
        user_id: myId,
        forum_body: postData.body, // ✅ cleaned before submit
        fileKey,
        thumbnail_fileKey: thumbnailFileKey,
        extraData: mediaMeta || {}

      };

      const res = await apiClient.post('/postInForum', postPayload);

      if (res.data.status !== 'success') throw new Error("Failed to submit post.");

      setHasChanges(false);

      let newPost = res.data.forum_details;

      newPost = {
        ...newPost,
        user_type: profile.user_type,
      };

      EventRegister.emit('onForumPostCreated', {
        newPost: newPost,
        profile: profile,
      });

      showToast("Forum post submitted successfully", "success");
      navigation.goBack();

    } catch (error) {
      console.log("Submission error:", error);

      if (error?.message?.includes("Network Error")) {
        showToast("Check your internet connection", "error");
      } else if (error?.response?.data) {
        // If API responded with a body (like validation errors)
        console.log("API response error:", error.response.data);
        showToast(error.response.data?.message || "Something went wrong", "error");
      } else {
        showToast("Something went wrong", "error");
      }
    }
    finally {
      setLoading(false);
      setHasChanges(false);
    }
  };





  return (
    <View style={styles.container}>
      <View style={[AppStyles.toolbar, { backgroundColor: '#075cab' }]} />

      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />

        </TouchableOpacity>
        <TouchableOpacity
          onPress={handlePostSubmission}
          style={[
            AppStyles.buttonContainer,
           !postData.body || loading || isCompressing ? styles.disabledButton : null,
          ]}
          disabled={!postData.body || loading || isCompressing}
        >
          {loading || isCompressing ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text style={[styles.buttonText, (!postData.body.trim()) && styles.buttonDisabledText]} >Post</Text>
          )}
        </TouchableOpacity>

      </View>



      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 10, paddingBottom: '40%' }}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={20}
        onScrollBeginDrag={() => Keyboard.dismiss()}

      >

        <View style={styles.profileContainer}>
          <View style={styles.imageContainer}>
            {profile?.fileKey && profile?.imageUrl ? (
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


        <RichEditor
          ref={richText}
          useContainer={true}
          style={{
            minHeight: 250,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#ccc',
            overflow: 'hidden',
          }}
          initialContentHTML={postData.body}
          placeholder="Share your thoughts, questions or ideas..."
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
          editor={richText}
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


      </KeyboardAwareScrollView>



      <Message3
        visible={showModal}
        onClose={() => setShowModal(false)}
        onCancel={handleStay}
        onOk={handleLeave}
        title="Are you sure ?"
        message={`Your updates will be lost if you leave this page.\nThis action cannot be undone.`}
        iconType="warning"
      />
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: STATUS_BAR_HEIGHT

  },

  buttonText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#fff',
  },
  buttonDisabledText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },


  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10
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

  profileTextContainer: {
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 15,
    fontWeight: '500',
    color: 'black'
  },
  profileCategory: {
    fontSize: 13,
    fontWeight: '300',
    color: '#666',
  },

  backButton: {
    alignSelf: 'flex-start',
    padding: 10
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
    borderColor: '#ccc',
    borderWidth: 0.5,
  },


});

export default ForumPostScreen;