// src/utils/videoUtils.js

import { Alert } from 'react-native';
import RNFS from 'react-native-fs';
import ImageResizer from 'react-native-image-resizer';
import { createThumbnail } from 'react-native-create-thumbnail';
import Compressor, { getVideoMetaData, Video } from 'react-native-compressor';
import { launchImageLibrary } from 'react-native-image-picker';
import { showToast } from '../AppUtils/CustomToast';
import apiClient from '../ApiClient';

async function uriToBlob(uri) {
  const response = await fetch(uri);
  const blob = await response.blob();
  return blob;
}

export const moveToPersistentStorage = async (videoUri) => {
  try {
    const fileName = videoUri.split('/').pop();
    const fileExtension = fileName.split('.').pop();
    const baseName = fileName.replace(`.${fileExtension}`, '');
    let newPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    let counter = 1;
    while (await RNFS.exists(newPath)) {
      newPath = `${RNFS.DocumentDirectoryPath}/${baseName}_${counter}.${fileExtension}`;
      counter++;
    }

    await RNFS.moveFile(videoUri.replace("file://", ""), newPath);

    return `file://${newPath}`;
  } catch (error) {

    return videoUri;
  }
};

export const safeVideoUri = async (videoUri) => {
  try {
    const src = videoUri.replace("file://", "");
    const fileName = `video_${Date.now()}.mp4`;
    const dest = `${RNFS.DocumentDirectoryPath}/${fileName}`;

    await RNFS.copyFile(src, dest);
    console.log("[safeVideoUri] Copied to persistent path:", dest);

    return `file://${dest}`;
  } catch (err) {
    console.error("[safeVideoUri] Failed:", err);
    return videoUri;
  }
};

export const generateVideoThumbnail = async (videoUri) => {
  try {
    const safeUri = await safeVideoUri(videoUri);

    const result = await createThumbnail({
      url: safeUri,
      timeStamp: 1000,
    });

    if (!result?.path) throw new Error("Thumbnail failed");

    return `file://${result.path}`;
  } catch (err) {
    console.error("[Thumbnail] Exception:", err);
    return null;
  }
};

export const generateVideoThumbnailAlt = async (videoUri) => {
  try {
    const result = await createThumbnail({
      url: videoUri,    // keep 'file://'
      timeStamp: 2000,  // 1 second into video
      format: 'jpg',
    });

    if (!result?.path) throw new Error("Thumbnail generation failed");

    return result.path.startsWith('file://') ? result.path : `file://${result.path}`;
  } catch (err) {
    console.error("[Thumbnail] Exception:", err);
    return null;
  }
};







export const captureFinalThumbnail = async (overlayRef) => {
  try {
    const uri = await overlayRef.current.capture();

    return uri;
  } catch (error) {

    return null;
  }
};

const getFileSizeMB = async (uri) => {
  try {
    const stats = await RNFS.stat(uri.replace('file://', ''));
    return parseFloat((Number(stats.size) / (1024 * 1024)).toFixed(2));
  } catch {
    return 0;
  }
};


export const compressVideo = async (videoAsset, attempt = 1) => {
  try {
    const MAX_ALLOWED_SIZE_MB = 10;

    const videoUri = videoAsset.uri;
    const originalSizeMB = videoAsset.fileSize / (1024 * 1024); // convert bytes → MB
    const width = videoAsset.width || 1280;
    const height = videoAsset.height || 720;
    const durationSec = (videoAsset.duration > 0 ? videoAsset.duration : 10); // fallback
    const fps = 30; // assume 30 if picker doesn't provide

    // Estimate bitrate if not provided
    let estimatedBitrate = videoAsset.bitrate || ((originalSizeMB * 8 * 1024 * 1024) / durationSec);


    // Aggressive compression presets
    const presets = [
      { scale: 0.85, bitrateFactor: 0.25 }, // first attempt
      { scale: 0.7, bitrateFactor: 0.2 },  // second attempt
      { scale: 0.5, bitrateFactor: 0.15 }, // last attempt
    ];

    const { scale, bitrateFactor } = presets[attempt - 1] || presets[2];

    const targetWidth = Math.round(width * scale);
    const targetHeight = Math.round(height * scale);
    let targetBitrate = Math.floor(estimatedBitrate * bitrateFactor);

    if (targetBitrate < 500_000) targetBitrate = 500_000;
    if (targetBitrate > 1_200_000) targetBitrate = 1_200_000;

    const compressionSettings = {
      compressionMethod: 'manual',
      bitrate: targetBitrate,
      maxWidth: targetWidth,
      maxHeight: targetHeight,
      fps,
      progressDivider: 5,
    };

    const compressedUri = await Compressor.Video.compress(videoUri, compressionSettings);
    const compressedSizeMB = await getFileSizeMB(compressedUri);

    if (compressedSizeMB > MAX_ALLOWED_SIZE_MB && attempt < 3) {
      
      return await compressVideo({ ...videoAsset, uri: compressedUri, fileSize: compressedSizeMB * 1024 * 1024 }, attempt + 1);
    }

    if (compressedSizeMB > MAX_ALLOWED_SIZE_MB) {
      showToast("Video is too large even after compression. Try trimming it shorter.", "error");
      return null;
    }

    return compressedUri;
  } catch (error) {
    console.error('❌ Compression failed:', error);
    return videoAsset.uri;
  }
};


export const saveBase64ToFile = async (dataUri) => {
  const base64Data = dataUri.replace(/^data:image\/\w+;base64,/, "");
  const filePath = `${RNFS.CachesDirectoryPath}/overlay-thumb-${Date.now()}.jpg`;

  try {
    await RNFS.writeFile(filePath, base64Data, "base64");
  
    return `file://${filePath}`;
  } catch (err) {

    throw err;
  }
};

export const uploadFromBase64 = async (dataUri, fileKey) => {
  try {
    const fileUri = await saveBase64ToFile(dataUri);
    
    return await handleThumbnailUpload(fileUri, fileKey);
  } catch (err) {
    
    return null;
  }
};

export const handleThumbnailUpload = async (thumbnailUri, fileKey) => {
  try {
    // ✅ Step 1: Get thumbnail file size
    const thumbStat = await RNFS.stat(thumbnailUri);
    const thumbBlob = await uriToBlob(thumbnailUri);

    // Create thumbnail file key
    const thumbnailFileKey = `thumbnail-${fileKey}`;

    // ✅ Step 2: Request upload URL for thumbnail
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

    // ✅ Step 3: Upload Thumbnail
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': 'image/jpeg' },
      body: thumbBlob,
    });

    if (uploadRes.status !== 200) {
      throw new Error('Failed to upload thumbnail to S3');
    }


    return thumbnailFileKey; // Return the thumbnail file key
  } catch (error) {

    return null;
  }
};