import apiClient from "../ApiClient";

export async function updateLastSeen(user_id, last_activity_time) {
  try {
    const requestBody = {
      command: 'updateLastSeen',
      user_id,
    };

    if (last_activity_time) {
      requestBody.last_activity_time = last_activity_time;
    }

    const response = await apiClient.post('/updateLastSeen', requestBody);
    console.log('📥 Response from /updateLastSeen:', response.data);

    if (response.data.status === 'success') {
      return response.data.successMessage;
    } else {
      throw new Error('Update failed');
    }
  } catch (error) {
   
  }
}
