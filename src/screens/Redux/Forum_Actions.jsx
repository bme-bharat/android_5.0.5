// actions.js

// Forum Actions

export const SET_COMMENTS_COUNT = 'SET_COMMENTS_COUNT';
export const ADD_POST = 'ADD_POST';
export const ADD_POSTS = 'ADD_POSTS';
export const CLEAR_POSTS = 'CLEAR_POSTS';
export const DELETE_POST = 'DELETE_POST';
export const UPDATE_OR_ADD_POSTS = 'UPDATE_OR_ADD_POSTS';
export const UPDATE_POST = 'UPDATE_POST';
export const UPDATE_AUTHOR_IMAGE_FOR_POSTS = 'UPDATE_AUTHOR_IMAGE_FOR_POSTS';
export const DECREMENT_COMMENTS_COUNT = 'DECREMENT_COMMENTS_COUNT';

export const decrementCommentsCount = (forumId) => ({
  type: DECREMENT_COMMENTS_COUNT,
  payload: { forumId },
});

export const updateAuthorImageForPosts = (authorId, newImageUrl) => ({
  type: UPDATE_AUTHOR_IMAGE_FOR_POSTS,
  payload: { authorId, newImageUrl },
});

export const updatePost = (post) => ({
  type: UPDATE_POST,
  payload: post,
});

export const updateOrAddPosts = (posts) => ({
  type: UPDATE_OR_ADD_POSTS,
  payload: posts,
});

export const deletePost = (forumId) => ({
  type: DELETE_POST,
  payload: forumId,
});

export const clearPosts = () => ({
  type: CLEAR_POSTS,
});

export const addPost = (post) => ({
  type: ADD_POST,
  payload: post,
});

export const setCommentsCount = (forumId, count) => ({
  type: SET_COMMENTS_COUNT,
  payload: { forumId, count },
});

