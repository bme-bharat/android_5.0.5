import apiClient from "../ApiClient";

export const deleteS3KeyIfExists = async (key) => {
  if (!key) {
    console.log("⚠️ [deleteS3KeyIfExists] No key provided, skipping deletion.");
    return;
  }

  try {
    const res = await apiClient.post('/deleteFileFromS3', {
      command: 'deleteFileFromS3',
      key,
    });

    const { statusCode, message } = res?.data || {};

    if (statusCode === 200) {
      console.log(`✅ [deleteS3KeyIfExists] Success: ${message}`);
    } else {
      console.log(`❌ [deleteS3KeyIfExists] Failed with statusCode ${statusCode}: ${message}`);
    }
  } catch (err) {
    console.error(`⚠️ [deleteS3KeyIfExists] Error deleting key "${key}":`, err);
  }
};
