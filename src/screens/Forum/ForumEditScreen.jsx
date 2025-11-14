
import React, { useState, useEffect, useRef } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Text, ActivityIndicator, Keyboard, NativeModules, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import RNFS from 'react-native-fs';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Message3 from '../../components/Message3';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import apiClient from '../ApiClient';
import { useDispatch, useSelector } from 'react-redux';
import { showToast } from '../AppUtils/CustomToast';
import { useNetwork } from '../AppUtils/IdProvider';
import { EventRegister } from 'react-native-event-listeners';
import { actions, RichEditor, RichToolbar } from 'react-native-pell-rich-editor';
import { cleanForumHtml } from './forumBody';
import { MediaPickerButton } from '../helperComponents/MediaPickerButton';
import { useMediaPicker } from '../helperComponents/MediaPicker';
import { MediaPreview } from '../helperComponents/MediaPreview';
import { deleteS3KeyIfExists } from '../helperComponents/s3Helpers';
import PlayOverlayThumbnail from './Play';
import { uploadFromBase64 } from './VideoParams';
import { useS3Uploader } from '../helperComponents/useS3Uploader';
import ImageResizer from 'react-native-image-resizer';
import ArrowLeftIcon from '../../assets/svgIcons/back.svg';
import { colors, dimensions } from '../../assets/theme.jsx';

const { DocumentPicker } = NativeModules;
const calculateAspectRatio = (width, height) => {
  if (!width || !height || height <= 0) return 1;
  return width / height;
};

const ForumEditScreen = () => {

  const navigation = useNavigation();
  const route = useRoute();
  const profile = useSelector(state => state.CompanyProfile.profile);
  const { myId, myData } = useNetwork();

  const { post, imageUrl } = route.params;

  const isDefaultLocalImage =
  imageUrl &&
  !imageUrl.startsWith('http') && // means it's a local asset (not from network)
  imageUrl.includes('image.jpg'); // optional: ensure it’s the specific placeholder

  const [image, setImage] = useState(isDefaultLocalImage ? null : imageUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [mediaMeta, setMediaMeta] = useState(null);

  const [thumbnailUri, setThumbnailUri] = useState(mediaMeta?.previewThumbnail);

  const [overlayUri, setOverlayUri] = useState(null);

  useEffect(() => {
    setThumbnailUri(mediaMeta?.previewThumbnail)
  }, [mediaMeta])

  const [compressedImage, setCompressedImage] = useState(null);
  const { uploadFile, uploading } = useS3Uploader();


  const [postData, setPostData] = useState({
    forum_body: post.forum_body || '',
    fileKey: post.fileKey || '',
    thumbnail_fileKey: post.thumbnail_fileKey || '',
  });

  const richText = useRef();

  const [hasChanges, setHasChanges] = useState(false);

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

  useEffect(() => {
    if (post) {

      setPostData({
        title: post.title || '',
        forum_body: post.forum_body || '',
        conclusion: post.conclusion || '',
        fileKey: post.fileKey || '',
        thumbnail_fileKey: post.thumbnail_fileKey || '',
      });
    }
  }, [post]);


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
    includeDocuments: false,
    includeCamera: false,
    mediaType: 'mixed',
    maxImageSizeMB: 5,
    maxVideoSizeMB: 10,
  });



  const handleRemoveMedia = () => {
    setFile(null);
    setFileType('');
    setMediaMeta(null);
    setImage(null)
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

    const cleanedBody = sanitizeHtmlBody(postData.forum_body);
    const strippedBody = stripHtmlTags(cleanedBody).trim();

    if (!strippedBody) {
      console.log('⚠️ Empty description after sanitization');
      showToast("Description is mandatory", 'info');
      return;
    }

    setIsLoading(true);

    try {
      const currentTimestampInSeconds = Math.floor(Date.now() / 1000);

      let fileKey = '';
      let thumbnailFileKey = '';

      if (file) {
        // ✅ New media selected: delete old + upload new
        await deleteS3KeyIfExists(post.fileKey);
        await deleteS3KeyIfExists(post.thumbnail_fileKey);

        const uploaded = await uploadFile(compressedImage, file, overlayUri, fileType);
        if (uploaded) {
          fileKey = uploaded.fileKey;
          thumbnailFileKey = uploaded.thumbnailFileKey;

        }

      } else if (!image) {
        // ✅ Media removed & no new media selected: delete old
        await deleteS3KeyIfExists(post.fileKey);
        await deleteS3KeyIfExists(post.thumbnail_fileKey);
        console.log('🚫 Media removed. Cleared old file keys.');

        fileKey = '';
        thumbnailFileKey = '';

      } else {

        fileKey = post.fileKey || '';
        thumbnailFileKey = post.thumbnail_fileKey || '';
      }
      const extraDataToSend =
        (fileKey)
          ? (mediaMeta || post.extraData || {})
          : {};
      setHasChanges(false);
      
      const postPayload = {
        command: 'updateForumPost',
        user_id: myId,
        forum_id: post.forum_id,
        forum_body: cleanedBody,
        fileKey: fileKey, // always send, even if empty
        ...(thumbnailFileKey ? { thumbnail_fileKey: thumbnailFileKey } : {}),
        extraData: extraDataToSend
      };

      const res = await apiClient.post('/updateForumPost', postPayload);

      if (res.data.status !== 'SUCCESS') {
        console.error('❌ Server responded with error:', res.data);
        throw new Error('Post update failed.');
      }

      const updatedPostData = {
        ...post,
        forum_body: cleanedBody,
        fileKey,
        ...(thumbnailFileKey !== false ? { thumbnail_fileKey: thumbnailFileKey } : {}),
        extraData: extraDataToSend,
        posted_on: currentTimestampInSeconds,
      };

      EventRegister.emit('onForumPostUpdated', { updatedPost: updatedPostData });

      setPostData(prev => ({
        ...prev,
        fileKey,
        thumbnail_fileKey: thumbnailFileKey
      }));
      setFile(null);
      setThumbnailUri(null);
      setFileType('');
      setMediaMeta(null);

      showToast("Post updated successfully", 'success');
      setTimeout(() => navigation.goBack(), 100);

    } catch (error) {
      console.error('🔥 Post update failed:', error);
      showToast("Something went wrong", 'error');
    } finally {
      setIsLoading(false);
    }
  };


  const initialHtmlRef = useRef(postData.forum_body);

  const stripHtmlTags = (html) =>
    html?.replace(/<\/?[^>]+(>|$)/g, '').trim() || '';


  const handleForumBodyChange = (html) => {
    const plainText = stripHtmlTags(html);

    if (plainText.startsWith(" ")) {
      showToast("Leading spaces are not allowed", 'error');
    }

    const sanitizedHtml = cleanForumHtml(html);

    setPostData((prev) => ({
      ...prev,
      forum_body: sanitizedHtml,
    }));
    setHasChanges(true); // ✅ mark form as dirty

  };



  return (
    <View style={styles.container} >
      <View style={styles.headerContainer} >
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeftIcon width={dimensions.icon.medium} height={dimensions.icon.medium} color={colors.primary} />

        </TouchableOpacity>

        <View style={{ margin: 5, }}>
          <TouchableOpacity
            onPress={handlePostSubmission}
            style={[
              styles.buttonContainer,
              (!postData.forum_body.trim() || isLoading || isCompressing) && styles.disabledButton,
            ]}
            disabled={!postData.forum_body.trim() || isLoading || isCompressing}
          >
            {isLoading || isCompressing ? (
              <ActivityIndicator size="small" color="#fff" style={styles.activityIndicator} />
            ) : (
              <Text
                style={[
                  styles.buttonTextdown,
                  (!postData.forum_body.trim() || isLoading || isCompressing) && styles.disabledButtonText1,
                ]}
              >Update</Text>
            )}
          </TouchableOpacity>


        </View>
      </View>
      <KeyboardAwareScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal:5, paddingBottom:'40%' }}
        keyboardShouldPersistTaps="handled"
        extraScrollHeight={20}
        onScrollBeginDrag={() => Keyboard.dismiss()}
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
              {profile?.first_name || profile?.last_name
                ? `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim()
                : profile?.company_name || ''}
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
            initialContentHTML={initialHtmlRef.current}
            placeholder="Share your thoughts, questions or ideas..."
            editorInitializedCallback={() => { }}
            onChange={handleForumBodyChange}
            editorStyle={{
              cssText: `
                  * {
                    font-size: 15px !important;
                    line-height: 20px !important;
                    color: #000 !important;
                  }
                  p, div, ul, li, ol, h1, h2, h3, h4, h5, h6 {
                    margin: 0 !important;
                    padding: 10 !important;
                    color: #000 !important;
                  }
                  body {
                    padding: 10 !important;
                    margin: 0 !important;
                    color: #000 !important;
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
          uri={file?.uri || image}
          type={fileType || 'image/jpg'}
          name={file?.name || post?.extraData?.fileName}
          onRemove={handleRemoveMedia}
        />

        {!(file || image) && (
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
          title="Are you sure?"
          message="Your updates will be lost if you leave this page. This action cannot be undone."
          iconType="warning"
        />

      </KeyboardAwareScrollView>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'whitesmoke',
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',

  },
  detailImage: {
    width: '100%',
    height: '100%',
    borderRadius: 80,
    overflow: 'hidden',

  },


  inputContainer: {
    color: "black",

  },
  disabledButton: {
    backgroundColor: '#ccc',
    opacity: 0.6,
  },
  profileTextContainer: {
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black'
  },
  profileCategory: {
    fontSize: 14,
    color: 'gray',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,
  },


  buttonContainer: {
    width: 80,
    height: 35,
    borderRadius: 10,
    // backgroundColor: '#075CAB',
    alignItems: 'center',
    justifyContent: 'center',

  },

  activityIndicator: {
    marginLeft: 5,
  },


  buttonTextdown: {
    textAlign: 'center',
    fontSize: 16,
    color: '#075cab',
    fontWeight: '600',
  },

  disabledButtonText1: {
    color: '#fff',
  }
});

export default ForumEditScreen;
