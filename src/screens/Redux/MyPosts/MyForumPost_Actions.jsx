export const ADD_MY_POST = 'ADD_MY_POST';
export const UPDATE_MY_POST = 'UPDATE_MY_POST';
export const DELETE_MY_POST = 'DELETE_MY_POST';
export const SET_MY_POSTS = 'SET_MY_POSTS';
export const CLEAR_MY_FORUM_POSTS = 'CLEAR_MY_FORUM_POSTS';
export const SET_MY_POST_IMAGE_URLS = 'SET_MY_POST_IMAGE_URLS';

export const setMyPostImageUrls = (imageUrls) => ({
  type: SET_MY_POST_IMAGE_URLS,
  payload: imageUrls,
});

export const addMyPost = (post) => ({
  type: ADD_MY_POST,
  payload: post,
});

export const updateMyPost = (post) => ({
  type: UPDATE_MY_POST,
  payload: post,
});

export const deleteMyPost = (forumId) => ({
  type: DELETE_MY_POST,
  payload: forumId,
});

export const setMyPosts = (posts) => ({
  type: SET_MY_POSTS,
  payload: posts,
});


export const clearMyForumPosts = () => ({
  type: CLEAR_MY_FORUM_POSTS,
});

