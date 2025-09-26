import { useState } from 'react';
import RNFS from 'react-native-fs';
import apiClient from '../ApiClient';
import { showToast } from '../AppUtils/CustomToast';
import { uploadFromBase64 } from '../Forum/VideoParams';

/**
 * Convert any URI (file:// or content://) to a Blob
 */
export const uriToBlob = async (uri) => {
  try {
    const response = await fetch(uri);
    return await response.blob();
  } catch (error) {
    console.error('[uriToBlob] Failed to convert URI to blob:', error);
    throw error;
  }
};

/**
 * Hook for uploading files to S3, including video thumbnails
 */
export const useS3Uploader = () => {
  const [uploading, setUploading] = useState(false);

  /**
   * Upload a file and optional thumbnail to S3
   * @param {Object} compressedFile - The compressed file to upload (optional)
   * @param {Object} originalFile - Original asset object from picker
   * @param {string|null} overlayUri - Base64 thumbnail (optional)
   * @param {string|null} fileType - Optional MIME type override
   */
  const uploadFile = async (compressedFile, originalFile, overlayUri = null, fileType = null) => {
    // Decide which file object to upload
    const fileToUpload = compressedFile || originalFile;

    if (!fileToUpload?.uri) {
      
      return { fileKey: null, thumbnailFileKey: null };
    }

    // Determine MIME type
    const type = fileType || fileToUpload.type || fileToUpload.mime;
    if (!type) {
      showToast('File type missing', 'error');
      console.warn('[useS3Uploader] Missing MIME type for file:', fileToUpload);
      return { fileKey: null, thumbnailFileKey: null };
    }

    setUploading(true);
    console.log('[useS3Uploader] Starting upload for file:', fileToUpload);

    try {
      // Optional: get file stats for logging
      if (fileToUpload.uri.startsWith('file://')) {
        const fileStat = await RNFS.stat(fileToUpload.uri);
        console.log('[useS3Uploader] File stats:', fileStat);
      }

      // Convert URI to Blob
      const fileBlob = await uriToBlob(fileToUpload.uri);
      console.log('[useS3Uploader] Blob created, size:', fileBlob.size);

      // Request pre-signed URL
      const res = await apiClient.post('/uploadFileToS3', {
        command: 'uploadFileToS3',
        headers: {
          'Content-Type': type,
          'Content-Length': fileBlob.size,
        },
      });

      if (res.data.status !== 'success') {
        throw new Error(res.data.errorMessage || 'Failed to get upload URL');
      }

      const { url: uploadUrl, fileKey } = res.data;
      console.log('[useS3Uploader] Upload URL & fileKey:', { uploadUrl, fileKey });

      // Upload main file
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': type },
        body: fileBlob,
      });

      if (uploadRes.status !== 200) {
        throw new Error(`Failed to upload ${fileToUpload.name || 'file'} to S3`);
      }

      let thumbnailFileKey = null;

      // Upload thumbnail if video
      if ((type.startsWith('video/') || fileToUpload.type?.startsWith('video/')) && overlayUri) {
        console.log('[useS3Uploader] Uploading video thumbnail...');
        thumbnailFileKey = await uploadFromBase64(overlayUri, fileKey);
      }

      console.log('[useS3Uploader] Upload successful:', { fileKey, thumbnailFileKey });
      showToast(`${fileToUpload.name || 'File'} uploaded successfully`, 'success');

      return { fileKey, thumbnailFileKey };
    } catch (error) {
      console.error('[useS3Uploader] Error uploading file:', error);
      showToast(error.message || 'Upload failed', 'error');
      return { fileKey: null, thumbnailFileKey: null };
    } finally {
      setUploading(false);
    }
  };

  return { uploadFile, uploading };
};

