// actions/jobActions.js

export const UPDATE_OR_ADD_JOB_POSTS = 'UPDATE_OR_ADD_JOB_POSTS';
export const ADD_JOB_POST = 'ADD_JOB_POST';
export const UPDATE_JOB_POST = 'UPDATE_JOB_POST';  // but reducer doesn't handle this
export const CLEAR_JOB_POSTS = 'CLEAR_JOB_POSTS';
export const DELETE_JOB_POST = 'DELETE_JOB_POST';
export const SET_COMPANY_JOB_POSTS = 'SET_COMPANY_JOB_POSTS';
export const SET_JOB_IMAGE_URLS = 'SET_JOB_IMAGE_URLS';


export const setJobImageUrls = (imageUrls) => ({
    type: SET_JOB_IMAGE_URLS,
    payload: imageUrls, // { [post_id]: imageUrl }
  });
  
export const setCompanyJobPosts = (posts) => ({
  type: SET_COMPANY_JOB_POSTS,
  payload: posts,
});

export const deleteJobPost = (jobId) => ({
    type: DELETE_JOB_POST,
    payload: jobId,
});

export const clearJobPosts = () => ({
    type: CLEAR_JOB_POSTS,
});
export const updateJobPost = (post) => ({
    type: UPDATE_JOB_POST,
    payload: post,
  });  

export const addJobPost = (posts) => ({
    type: ADD_JOB_POST,
    payload: posts,
});

export const updateOrAddJobPosts = (posts) => ({
    type: UPDATE_OR_ADD_JOB_POSTS,
    payload: posts,
});