


import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ScrollView, TextInput, Alert, ActivityIndicator, NativeModules, } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';


import Message3 from '../../components/Message3';
import RNFS from 'react-native-fs';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { updateResourcePost } from '../Redux/Resource_Actions';
import { useDispatch, useSelector } from 'react-redux';
import PlayOverlayThumbnail from '../Forum/Play';
import { showToast } from '../AppUtils/CustomToast';
import { useNetwork } from '../AppUtils/IdProvider';
import { EventRegister } from 'react-native-event-listeners';
import apiClient from '../ApiClient';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { MediaPreview } from '../helperComponents/MediaPreview';
import { MediaPickerButton } from '../helperComponents/MediaPickerButton';
import { useMediaPicker } from '../helperComponents/MediaPicker';
import { deleteS3KeyIfExists } from '../helperComponents/s3Helpers';
import { uploadFromBase64 } from '../Forum/VideoParams';
import ImageResizer from 'react-native-image-resizer';
import { useS3Uploader } from '../helperComponents/useS3Uploader';
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import { colors, dimensions } from '../../assets/theme.jsx';
import AppStyles, { STATUS_BAR_HEIGHT } from '../AppUtils/AppStyles.js';
import { sanitizeHtmlBody } from '../Forum/forumBody.jsx';

const { DocumentPicker } = NativeModules;

const calculateAspectRatio = (width, height) => {
  if (!width || !height || height <= 0) return 1;
  return width / height;
};

const ResourcesEditScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { post, imageUrl } = route.params;
  const isDefaultLocalImage =
    imageUrl &&
    !imageUrl.startsWith('http') && // means it's a local asset (not from network)
    imageUrl.includes('image.jpg'); // optional: ensure it’s the specific placeholder

  const [image, setImage] = useState(isDefaultLocalImage ? null : imageUrl);

  const profile = useSelector(state => state.CompanyProfile.profile);
  const { myId, myData } = useNetwork();


  const scrollViewRef = useRef(null)
  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [mediaMeta, setMediaMeta] = useState(null);
  const [thumbnailUri, setThumbnailUri] = useState(mediaMeta?.previewThumbnail);
  const [overlayUri, setOverlayUri] = useState(null);
  useEffect(() => {
    setThumbnailUri(mediaMeta?.previewThumbnail)
  }, [mediaMeta])
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [compressedImage, setCompressedImage] = useState(null);

  const { uploadFile, uploading } = useS3Uploader();

  const handleRemoveMedia = () => {
    setFile(null);
    setFileType('');
    setMediaMeta(null);
    setImage(null)
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
    includeDocuments: true,
    includeCamera: false,
    mediaType: 'mixed',
    maxImageSizeMB: 5,
    maxVideoSizeMB: 10,
  });




  const [postData, setPostData] = useState({
    title: post?.title || '',
    resource_body: post?.resource_body || '',
    conclusion: post?.conclusion || '',

  });



  const [showModal, setShowModal] = useState(false);

  const handleLeave = () => {
    // ✅ Temporarily disable the guard before navigating back
    setHasChanges(false);

    // Give React time to update before navigation triggers
    requestAnimationFrame(() => {
      setShowModal(false);
      navigation.goBack();
    });
  };

  const handleStay = () => {
    setShowModal(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasChanges) return;
      e.preventDefault();
      setShowModal(true);
    });
    return unsubscribe;
  }, [navigation, hasChanges]);



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

  const selectPDF = async () => {
    try {
      // Open the native document picker
      const pickedFiles = await DocumentPicker.pick({
        allowMultiple: false,
        type: ['application/pdf'], // restrict to PDF only
      });

      if (!pickedFiles || pickedFiles.length === 0) return;

      const file = pickedFiles[0];
      console.log('Picked PDF:', file);

      const fileSize = file.size;
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      const mimeType = file.mime || file.type || 'application/octet-stream';

      if (mimeType !== 'application/pdf') {
        showToast("Please upload a PDF file.", "error");
        setFile(null);
        setFileType(null);
        return;
      }

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
        // PDFs don't have width/height, so skip those
      };
      // ✅ Store the PDF in state
      setFile(file);
      setFileType(mimeType);
      setMediaMeta(meta);

      console.log('Selected PDF stored:', file);

    } catch (err) {
      if (err?.message?.includes('cancelled') || err?.code === 'E_PICKER_CANCELLED') return;
      console.error("Native DocumentPicker error:", err);
      showToast("An unexpected error occurred while picking the file.", "error");
    }
  };

  const cleanHtmlSpaces = (html) => {
    if (!html) return "";
  
    let cleaned = html;

    const emptyBlock = /<div>\s*(?:<span>\s*)?(?:<br\s*\/?>)\s*(?:<\/span>)?\s*<\/div>/gi;
    cleaned = cleaned.replace(new RegExp(`^(?:${emptyBlock.source})+`, "i"), "");
    cleaned = cleaned.replace(new RegExp(`(?:${emptyBlock.source})+$`, "i"), "");
    cleaned = cleaned.trim();
  
    return cleaned;
  };

  const handleForumBodyChange = (html) => {
  
    const cleanedBody = sanitizeHtmlBody(html);
    const finalBody = cleanHtmlSpaces(cleanedBody);

    setPostData(prev => ({
      ...prev,
      resource_body: finalBody
    }));
  };

  const handlePostSubmission = async () => {

    setIsLoading(true);

    try {
      const trimmedTitle = stripHtmlTags(postData.title)?.trim();

      if (!trimmedTitle) {
        showToast("Title field cannot be empty", 'info');
        setIsLoading(false);
        return;
      }

      if (!postData.resource_body) {
        showToast("Resource description field cannot be empty", 'info');
        setIsLoading(false);
        return;
      }

      let fileKey = '';
      let thumbnailFileKey = '';

      const mediaWasRemoved = !postData.signedUrl && !file;
      const mediaWasReplaced = !!file;

      if (mediaWasReplaced) {
        // ✅ Media was changed: delete old & upload new
        if (post.fileKey) await deleteS3KeyIfExists(post.fileKey);
        if (post.thumbnail_fileKey) await deleteS3KeyIfExists(post.thumbnail_fileKey);

        const uploaded = await uploadFile(compressedImage, file, overlayUri, fileType);
        if (uploaded) {
          fileKey = uploaded.fileKey;
          thumbnailFileKey = uploaded.thumbnailFileKey;
          console.log('Uploaded files:', fileKey, thumbnailFileKey);
        }

        fileKey = uploaded.fileKey;
        thumbnailFileKey = uploaded.thumbnailFileKey || '';
      } else if (mediaWasRemoved) {
        // ✅ Media was removed
        if (post.fileKey) await deleteS3KeyIfExists(post.fileKey);
        if (post.thumbnail_fileKey) await deleteS3KeyIfExists(post.thumbnail_fileKey);

        fileKey = '';
        thumbnailFileKey = '';
      } else {
        // ✅ Media unchanged
        fileKey = post.fileKey || '';
        thumbnailFileKey = post.thumbnail_fileKey || '';
      }

      const hasMedia = file || fileKey;

      const payload = {
        command: "updateResourcePost",
        user_id: myId,
        resource_id: post.resource_id,
        title: trimmedTitle,
        resource_body: postData.resource_body,
        ...(fileKey && { fileKey }),
        ...(fileKey && thumbnailFileKey && { thumbnail_fileKey: thumbnailFileKey }),
        ...(fileKey && mediaMeta && Object.keys(mediaMeta).length > 0 && { extraData: mediaMeta }),
      };
      setHasChanges(false)
      const response = await apiClient.post('/updateResourcePost', payload);
      console.log('payload', payload)
      const updatedPostData = {
        ...payload,
      };

      if (response.data.status === 'success') {

        EventRegister.emit('onResourcePostUpdated', {
          updatedPost: updatedPostData,
        });
        setHasChanges(false)
        showToast("Resource post updated successfully", 'success');
        navigation.goBack();
      } else {
        throw new Error(response.data.errorMessage || 'Failed to update resource post');
      }
    } catch (error) {
      showToast(error.message, 'error');
    } finally {
      setIsLoading(false);

    }
  };

  const bodyEditorRef = useRef();

  const initialBodyRef = useRef(postData.resource_body);
  const initialTitleRef = useRef(postData.title);

  const [activeEditor, setActiveEditor] = useState('title'); // not 'title'



  const handleBodyFocus = () => {
    setActiveEditor('body');
    bodyEditorRef.current?.focus(); // Focus the body editor
  };


  const stripHtmlTags = (html) =>
    html?.replace(/<\/?[^>]+(>|$)/g, '').trim() || '';

  const cleanForumHtml = (html) => {
    if (!html) return '';

    return html
      // Remove background color and text color styles explicitly
      .replace(/(<[^>]+) style="[^"]*(color|background-color):[^";]*;?[^"]*"/gi, '$1')
      // Remove ALL inline styles
      .replace(/(<[^>]+) style="[^"]*"/gi, '$1')
      // Remove unwanted tags but keep content (like font, span, div, p)
      .replace(/<\/?(font|span|div|p)[^>]*>/gi, '')
      // Remove empty tags like <b></b>
      .replace(/<[^\/>][^>]*>\s*<\/[^>]+>/gi, '')
      // Only allow: b, i, ul, ol, li, a, br (whitelist)
      .replace(/<(?!\/?(b|i|ul|ol|li|a|br)(\s|>|\/))/gi, '&lt;')
      // Keep only href attribute in <a> tags
      .replace(/<a [^>]*href="([^"]+)"[^>]*>/gi, '<a href="$1">');
  };

  const handleTitleChange = (html) => {
    const plainText = stripHtmlTags(html);

    if (!plainText) {
      setPostData((prev) => ({ ...prev, title: "" }));
      return;
    }

    if (/^\s/.test(plainText)) {
      showToast("Leading spaces are not allowed", "error");
      return;
    }

    setPostData((prev) => ({ ...prev, title: plainText }));
    setHasChanges(true);
  };



  
  
  
  




  const clearCacheDirectory = async () => {
    try {
      const cacheDir = RNFS.CachesDirectoryPath;  // Get the cache directory path
      const files = await RNFS.readDir(cacheDir); // List all files in the cache directory

      // Loop through all the files in the cache and delete them
      for (const file of files) {
        await RNFS.unlink(file.path);

      }
    } catch (error) {

    }
  };


  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // Clean up cache when leaving the screen or tab
        clearCacheDirectory();

      };
    }, [])
  );

  return (

    <View style={styles.container1} >
      <View style={[AppStyles.toolbar, { backgroundColor: '#075cab' }]} />

      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />

        </TouchableOpacity>

        <TouchableOpacity
          onPress={handlePostSubmission}
          style={[
            styles.buttonContainer,
            (!postData.resource_body.trim() || isLoading || isCompressing) && styles.disabledButton,
          ]}
          disabled={!postData.resource_body.trim() || isLoading || isCompressing}
        >
          {isLoading || isCompressing ? (
            <ActivityIndicator size="small" color="#fff" style={styles.activityIndicator} />
          ) : (
            <Text
              style={[
                styles.buttonTextdown,
                (!postData.resource_body.trim() || isLoading || isCompressing) && styles.disabledButtonText1,
              ]}
            >Update</Text>
          )}
        </TouchableOpacity>
      </View>


      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: '40%', marginHorizontal: 10, }}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={20}
        showsVerticalScrollIndicator={false}
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
          style={[styles.input, {
            minHeight: 50,
            maxHeight: 400,
            marginBottom: 10,
          }]}
          multiline
          placeholder="Enter title ..."
          value={postData.title}
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
          initialContentHTML={initialBodyRef.current}
          placeholder="Share your thoughts, questions or ideas..."
          
          onChange={handleForumBodyChange}
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
      }`
          }}
        />


        <RichToolbar
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
        <View style={{ paddingHorizontal: 10, }}>
          <MediaPreview
            uri={file?.uri || image}
            type={fileType || post?.extraData?.type}
            name={file?.name || post?.extraData?.name}
            onRemove={handleRemoveMedia}
          />
        </View>

        {!file && !image && (
          <View style={{ paddingHorizontal: 10, }}>
            <MediaPickerButton
              onPress={handleMediaPickerPress}
              isLoading={isCompressing}
            />
          </View>
        )}


      </KeyboardAwareScrollView>


      <Message3
        visible={showModal}
        onClose={() => setShowModal(false)}  // Optional if you want to close it from outside
        onCancel={handleStay}  // Stay button action
        onOk={handleLeave}  // Leave button action
        title="Are you sure?"
        message="Your updates will be lost if you leave this page. This action cannot be undone."
        iconType="warning"  // You can change this to any appropriate icon type
      />

    </View>

  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: 'whitesmoke',
  },

  container2: {
    padding: 10,
    backgroundColor: 'whitesmoke',
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
  },

  buttonTextdown: {
    textAlign: 'center',
    fontSize: 16,
    color: '#075cab',
    fontWeight: '600',
  },
  disabledButton1: {
    backgroundColor: '#fff',
    borderColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  disabledButtonText: {
    color: '#ccc',
  },
  disabledButtonText1: {
    color: '#fff',
  },

  container1: {
    flex: 1,
    backgroundColor: 'whitesmoke',
    paddingTop: STATUS_BAR_HEIGHT
  },


  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    fontSize: 16,
    textAlignVertical: 'top',
    color: 'black',
    textAlign: 'justify',
    backgroundColor: 'white',
    minHeight: 300,
    maxHeight: 400,
  },

  buttonContainer: {
    width: 80,
    height: 35,
    borderRadius: 10,
    // backgroundColor: '#075CAB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  imageContainer: {
    width: 40,
    height: 40,
    borderRadius: 80,
    alignSelf: 'center',
    justifyContent: 'center',
    marginRight: 10

  },
  detailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    overflow: 'hidden',

  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
    borderColor: '#ccc'
  },
  disabledButton1: {

    opacity: 0.6,
    borderColor: '#ccc'
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



  backButton: {
    alignSelf: 'flex-start',
    padding: 10

  },

  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
});



export default ResourcesEditScreen

