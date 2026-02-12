import React, { useState, useRef } from 'react';
import { Alert, Platform, ActionSheetIOS, NativeModules, Linking } from 'react-native';
import RNFS from 'react-native-fs';
import ImageResizer from '@bam.tech/react-native-image-resizer';

import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

import { addPlayIconToThumbnail, compressVideo, generateVideoThumbnail, generateVideoThumbnailAlt, moveToPersistentStorage } from '../Forum/VideoParams';
import { showToast } from '../AppUtils/CustomToast';
import RNBlobUtil from 'react-native-blob-util';


const { DocumentPicker } = NativeModules;

export const copyContentUriToTempFile = async (contentUri, fileName) => {
  try {
    const destPath = `${RNFS.CachesDirectoryPath}/${fileName}`;

    // RNFS can read content:// directly on Android >= 13
    if (Platform.OS === 'android' && contentUri.startsWith('content://')) {
      await RNFS.copyFile(contentUri, destPath);
    } else {
      // fallback for iOS / older Android
      const data = await RNFS.readFile(contentUri, 'base64');
      await RNFS.writeFile(destPath, data, 'base64');
    }

    return destPath;
  } catch (err) {
    console.error('[copyContentUriToTempFile] Failed:', err);
    throw new Error('Failed to copy file from content URI');
  }
};


/* ---------- Helpers ---------- */
const calculateAspectRatio = (width, height) => {
  if (!width || !height || height <= 0) return 1;
  return width / height;
};

const handleError = (message) => {
  console.error('Media Picker Error:', message);
  showToast(message || 'Something went wrong', 'error');
};

/* ---------- Image Selection ---------- */
export const handleImageSelection = async (asset, onMediaSelected, maxImageSizeMB = 5) => {
  try {

    // Fallback for HEIC/HEIF
    let fileType = asset.type || 'image/jpeg';
    if (fileType === 'image/heic' || fileType === 'image/heif') fileType = 'image/jpeg';

    // Safe file name
    const fileName = asset.fileName || `temp_${Date.now()}.jpeg`;

    // Copy SAF URI to cache
    const originalFilePath = await copyContentUriToTempFile(asset.uri, fileName);
    const originalStats = await RNFS.stat(originalFilePath);

    // Safe width/height fallback
    const width = asset.width || 1280;
    const height = asset.height || 1280;
    const aspectRatio = calculateAspectRatio(width, height);
    console.log('[handleImageSelection] Aspect ratio:', aspectRatio);

    // Resize dimensions
    const MAX_DIMENSION = 1280;
    const scale = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height, 1);
    const targetWidth = Math.round(width * scale);
    const targetHeight = Math.round(height * scale);
    console.log(`[handleImageSelection] Target dimensions: ${targetWidth}x${targetHeight}, scale: ${scale}`);

    // JPEG quality based on size
    const JPEG_QUALITY = originalStats.size > 2 * 1024 * 1024 ? 60 : 70;
    console.log('[handleImageSelection] JPEG quality set to:', JPEG_QUALITY);

    // Resize image
    const compressedImage = await ImageResizer.createResizedImage(
      `file://${originalFilePath}`,
      targetWidth,
      targetHeight,
      'WEBP',
      80
    );
    console.log('[handleImageSelection] Compressed image info:', compressedImage);

    // Check compressed file size
    const compressedStats = await RNFS.stat(compressedImage.uri.replace('file://', ''));
    console.log('[handleImageSelection] Compressed file stats:', compressedStats);
    if (compressedStats.size > maxImageSizeMB * 1024 * 1024) {
      showToast(`Image size shouldn't exceed ${maxImageSizeMB}MB`, 'error');
      return;
    }

    // Prepare processed file
    const processedFile = {
      uri: compressedImage.uri,
      type: fileType,
      name: fileName.replace(/\.[^/.]+$/, '.jpeg'),
    };

    // Metadata
    const meta = {
      width,
      height,
      fileName: fileName,
      type: asset.type,
      mimeType: fileType,
      aspectRatio,
    };

    console.log('[handleImageSelection] Processed file ready:', processedFile);
    console.log('[handleImageSelection] Meta data:', meta);

    onMediaSelected(processedFile, meta);
  } catch (error) {
    console.error('[handleImageSelection] Error:', error);
    showToast(error.message || 'Something went wrong', 'error');
  }
};

/* ---------- Video Selection ---------- */
export const handleVideoSelection = async (asset, onMediaSelected, maxVideoSizeMB, maxVideoDuration, setIsCompressing) => {
  console.log('handleVideoSelection called with asset:', asset);
  try {
    const totalSeconds = Math.floor(asset.duration || 0);
    if (totalSeconds > maxVideoDuration) {
      showToast(`Please select a video of ${Math.floor(maxVideoDuration / 60)} minutes or shorter`, "error");
      return;
    }

    const aspectRatio = calculateAspectRatio(asset.width, asset.height);
    setIsCompressing(true);

    const compressedUri = await compressVideo(asset);

    setIsCompressing(false);
    if (!compressedUri) return;

    const compressedStats = await RNFS.stat(compressedUri.replace('file://', ''));

    if (compressedStats.size > maxVideoSizeMB * 1024 * 1024) {
      showToast(`Video size shouldn't exceed ${maxVideoSizeMB}MB`, 'error');
      return;
    }

    const persistentUri = await moveToPersistentStorage(asset.uri);
    const previewThumbnail = await generateVideoThumbnailAlt(persistentUri);
    const processedFile = {
      uri: compressedUri,
      type: asset.type,
      name: asset.fileName || 'video.mp4',
    };

    const meta = {
      width: asset.width,
      height: asset.height,
      fileName: asset.fileName,
      type: asset.type,
      mimeType: asset.type,
      aspectRatio,
      previewThumbnail
    };

    onMediaSelected(processedFile, meta, );
  } catch (error) {
    setIsCompressing(false);
    handleError(error.message);
  }
};



/* ---------- Hook ---------- */
export const useMediaPicker = ({
  onMediaSelected,
  allowMultiple = false,
  maxImageSizeMB = 5,
  maxVideoSizeMB = 10,
  maxVideoDuration = 1800,
  includeDocuments = false,
  includeVideos = true,
  includeCamera = true,
  mediaType = 'mixed', // 'photo', 'video', or 'mixed'
}) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const overlayRef = useRef();

// Inside useMediaPicker
const handleMediaSelection = async (type, fromCamera = false, fileTypes = null) => {
  console.log('[handleMediaSelection] called with:', { type, fromCamera, fileTypes });

  try {
    if (type === 'video') {
      console.log('[handleMediaSelection] Video branch selected');

      const options = {
        mediaType: 'video',
        quality: 1,
        selectionLimit: allowMultiple ? 0 : 1,
        includeExtra: true,
        selectionStyle: 'gallery',
      };

      console.log('[handleMediaSelection] Launch options:', options);

      const launcher = fromCamera ? launchCamera : launchImageLibrary;
      console.log('[handleMediaSelection] Using launcher:', fromCamera ? 'launchCamera' : 'launchImageLibrary');

      launcher(options, async (response) => {
        console.log('[Video] Raw response:', response);

        if (response.didCancel) {

          return;
        }

        if (response.errorCode) {

          if (response.errorCode === 'permission') {
            if (Platform.OS === 'ios') {
            
              Alert.alert(
                'Permission Needed',
                'Please allow access to camera/photos in Settings to continue.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Turn On', onPress: () => Linking.openSettings() },
                ],
              );
            } else {
            
              showToast('Permission denied. Please enable it in settings.', 'error');
            }
            return;
          }

          if (response.errorCode === 'camera_unavailable') {
           
            showToast('Camera is not available on this device.', 'error');
            return;
          }

          showToast(`Media Picker failed: ${response.errorMessage || 'Unknown error'}`, 'error');
          return;
        }

        const asset = response.assets?.[0];
   
        if (!asset) {
     
          showToast('No media file found.', 'error');
          return;
        }

        if (!asset.uri && asset.originalPath) {
          console.log('asset.uri',asset.uri)
          asset.uri = `file://${asset.originalPath}`;
        }

        try {
       
          await handleVideoSelection(
            asset,
            onMediaSelected,
            maxVideoSizeMB,
            maxVideoDuration,
            setIsCompressing,
            
          );
         
        } catch (innerError) {
          console.error('[Video] Error during video processing:', innerError);
          showToast(innerError.message || 'Failed to process selected video.', 'error');
        }
      });

      return; // 🚨 Prevents falling through to DocumentPicker
    }

    let pickerTypes;
    switch (type) {
      case 'photo':
        pickerTypes = [DocumentPicker.types.images];
        break;
      case 'document':
      default:
        pickerTypes = fileTypes || [DocumentPicker.types.allFiles];
        break;
    }

    const pickedFiles = await DocumentPicker.pick({
      allowMultiple,
      type: pickerTypes,
    });

    if (!pickedFiles || pickedFiles.length === 0) {

      return;
    }

    for (let file of pickedFiles) {
    
      const mimeType = file.mime || file.type || 'application/octet-stream';
   
      if (mimeType.startsWith('image/')) {
      
        await handleImageSelection(file, onMediaSelected, maxImageSizeMB);
      
      } else {
     
        const processedFile = {
          id: file.id,
          uri: file.uri,
          type: mimeType,
          name: file.name,
          size: file.size,
          source: file.source,
        };
        const meta = { mimeType, size: file.size };
      
        onMediaSelected(processedFile, meta);
      }
    }
  } catch (error) {
    if (DocumentPicker.isCancel(error)) {
  
      return;
    }
  
    showToast(error.message || 'Something went wrong while selecting media', 'error');
  }
};


  const showMediaOptions = (includeRemove = false, onRemove = null) => {
    const options = [];

    if (includeCamera && (mediaType === 'photo' || mediaType === 'mixed')) {
      options.push({ text: 'Take Photo', onPress: () => handleMediaSelection('photo') });
    }

    if (mediaType === 'photo' || mediaType === 'mixed') {
      options.push({ text: 'Choose Photo', onPress: () => handleMediaSelection('photo') });
    }

    if (includeVideos && (mediaType === 'video' || mediaType === 'mixed')) {
      options.push({ text: 'Choose Video', onPress: () => handleMediaSelection('video') });
    }

    if (includeDocuments) {
      options.push({ text: 'Choose File', onPress: () => handleMediaSelection('document') });
    }

    if (includeRemove && onRemove) {
      options.push({ text: 'Remove', onPress: onRemove, style: 'destructive' });
    }

    options.push({ text: 'Cancel', style: 'cancel' });

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: options.map((o) => o.text),
          cancelButtonIndex: options.length - 1,
          destructiveButtonIndex: options.findIndex((o) => o.style === 'destructive'),
        },
        (buttonIndex) => {
          const selectedOption = options[buttonIndex];
          if (selectedOption?.onPress) selectedOption.onPress();
        }
      );
    } else {
      Alert.alert(
        'Select Media',
        'Choose an option',
        options.map((o) => ({
          text: o.text,
          onPress: o.onPress,
          style: o.style || 'default',
        }))
      );
    }
  };

  return {
    handleMediaSelection,
    showMediaOptions,
    isCompressing,
    overlayRef,
    pickImage: () => handleMediaSelection('photo'),
    pickVideo: () => handleMediaSelection('video'),
    pickDocument: () => handleMediaSelection('document'),
    pickPdf: () => handleMediaSelection('document', false, ['application/pdf']),
  };
};
