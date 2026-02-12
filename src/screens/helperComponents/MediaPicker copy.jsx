import React, { useState, useRef } from 'react';
import { Alert, Platform, ActionSheetIOS, NativeModules } from 'react-native';
import RNFS from 'react-native-fs';
import ImageResizer from '@bam.tech/react-native-image-resizer';

import { launchImageLibrary, launchCamera } from 'react-native-image-picker';

import { addPlayIconToThumbnail, compressVideo, generateVideoThumbnail } from '../Forum/VideoParams';
import { showToast } from '../AppUtils/CustomToast';

const { DocumentPicker } = NativeModules;

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
export const handleImageSelection = async (asset, onMediaSelected, maxImageSizeMB) => {
  try {
    let fileType = asset.type || 'image/jpeg';
    if (fileType === 'image/heic' || fileType === 'image/heif') fileType = 'image/jpeg';

    const originalFilePath = asset.uri.replace('file://', '');
    const originalStats = await RNFS.stat(originalFilePath);
    const originalFileSize = originalStats.size;

    const aspectRatio = calculateAspectRatio(asset.width, asset.height);
    const MAX_DIMENSION = 1280;
    const scale = Math.min(MAX_DIMENSION / asset.width, MAX_DIMENSION / asset.height, 1);
    const targetWidth = Math.round(asset.width * scale);
    const targetHeight = Math.round(asset.height * scale);
    const JPEG_QUALITY = originalFileSize > 2 * 1024 * 1024 ? 60 : 70;

    const compressedImage = await ImageResizer.createResizedImage(
      asset.uri,
      targetWidth,
      targetHeight,
      'JPEG',
      JPEG_QUALITY
    );

    const compressedFilePath = compressedImage.uri.replace('file://', '');
    const compressedStats = await RNFS.stat(compressedFilePath);

    if (compressedStats.size > maxImageSizeMB * 1024 * 1024) {
      showToast(`Image size shouldn't exceed ${maxImageSizeMB}MB`, 'error');
      return;
    }

    const processedFile = {
      uri: compressedImage.uri,
      type: fileType,
      name: asset.fileName ? asset.fileName.replace(/\.[^/.]+$/, '.jpeg') : 'image.jpeg',
    };

    const meta = {
      width: asset.width,
      height: asset.height,
      fileName: asset.fileName,
      type: asset.type,
      mimeType: asset.type,
      aspectRatio,
    };

    onMediaSelected(processedFile, meta);
  } catch (error) {
    handleError(error.message);
  }
};

/* ---------- Video Selection ---------- */
export const handleVideoSelection = async (
  asset,
  onMediaSelected,
  maxVideoSizeMB,
  maxVideoDuration,
  setIsCompressing
) => {
  try {
    const totalSeconds = Math.floor(asset.duration || 0);
    if (totalSeconds > maxVideoDuration) {
      showToast(`Please select a video of ${Math.floor(maxVideoDuration / 60)} minutes or shorter`, 'error');
      return;
    }

    const aspectRatio = calculateAspectRatio(asset.width, asset.height);
    setIsCompressing(true);
    showToast('Processing video...', 'info');

    const compressedUri = await compressVideo(asset.uri);
    setIsCompressing(false);
    if (!compressedUri) return;

    const compressedStats = await RNFS.stat(compressedUri.replace('file://', ''));
    if (compressedStats.size > maxVideoSizeMB * 1024 * 1024) {
      showToast(`Video size shouldn't exceed ${maxVideoSizeMB}MB`, 'error');
      return;
    }

    const previewThumbnail = await generateVideoThumbnail(compressedUri);

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
    };

    onMediaSelected(processedFile, meta, previewThumbnail);
  } catch (error) {
    setIsCompressing(false);
    handleError(error.message);
  }
};

/* ---------- Document Selection ---------- */
export const handleDocumentSelection = async (onMediaSelected) => {
  try {
    const pickedFiles = await DocumentPicker.pick({
      allowMultiple: false,
      category: 'docs',
    });

    if (!pickedFiles || pickedFiles.length === 0) return;

    for (let file of pickedFiles) {
      const mimeType = file.type || 'application/octet-stream';

      if (mimeType.startsWith('image/') || mimeType.startsWith('video/')) {
        showToast('Please select only document files (no images/videos)', 'error');
        continue;
      }

      const processedFile = {
        uri: file.uri,
        type: mimeType,
        name: file.name,
      };

      const meta = {
        fileName: file.name,
        type: mimeType,
        mimeType,
      };

      onMediaSelected(processedFile, meta);
    }
  } catch (err) {
    console.error('Document picker error:', err);
    if (err?.message?.includes('cancelled')) return; // silent cancel
    showToast(err.message || 'Failed to pick document', 'error');
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
// Inside useMediaPicker
const handleMediaSelection = async (type) => {
  try {
    const category =
      type === 'photo' ? 'images' :
      type === 'video' ? 'videos' :
      type === 'document' ? 'docs' : 'allFiles';

    const pickedFiles = await DocumentPicker.pick({ allowMultiple, category });
    if (!pickedFiles || pickedFiles.length === 0) return;

    console.log('[useMediaPicker] Picked files:', pickedFiles);

    for (let file of pickedFiles) {
      // ✅ Normalize MIME type
      const mimeType = file.mime || file.type || 'application/octet-stream';

      // ✅ Always pass processedFile in the same shape
      const processedFile = {
        id: file.id,
        uri: file.uri,
        type: mimeType, // 👈 consistent key
        name: file.name,
        size: file.size,
        source: file.source,
        thumbnailBase64: file.thumbnailBase64 || null,
      };

      // ✅ Keep meta minimal
      const meta = {
        mimeType,
        size: file.size,
      };

      console.log('[useMediaPicker] Processed file:', processedFile, 'Meta:', meta);

      onMediaSelected(processedFile, meta);
    }
  } catch (err) {
    if (err?.message?.includes('cancelled')) return;
    showToast(err.message || 'Failed to pick media', 'error');
    console.error('[useMediaPicker] Picker error:', err);
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
  };
};
