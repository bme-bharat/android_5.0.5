// Comment Actions
export const SET_COMMENTS_TO_STORE = 'SET_COMMENTS_TO_STORE';
export const APPEND_COMMENTS_TO_STORE = 'APPEND_COMMENTS_TO_STORE';
export const SET_COMMENT_IMAGE_URLS_TO_STORE = 'SET_COMMENT_IMAGE_URLS_TO_STORE';
export const CLEAR_COMMENTS_FROM_STORE = 'CLEAR_COMMENTS_FROM_STORE';
export const UPDATE_COMMENT_IN_STORE = 'UPDATE_COMMENT_IN_STORE';
export const DELETE_COMMENT_FROM_STORE = 'DELETE_COMMENT_FROM_STORE';
export const SET_COMMENT_COUNT_TO_STORE = 'SET_COMMENT_COUNT_TO_STORE';

export const setCommentCountToStore = (forumId, count) => ({
  type: SET_COMMENT_COUNT_TO_STORE,
  payload: { forumId, count },
});

export const deleteCommentFromStore = (forumId, commentId) => ({
  type: DELETE_COMMENT_FROM_STORE,
  payload: { forumId, commentId },
});

export const updateCommentInStore = (forumId, updatedComment) => ({
  type: UPDATE_COMMENT_IN_STORE,
  payload: { forumId, updatedComment },
});

export const setCommentsToStore = (forumId, comments) => ({
  type: SET_COMMENTS_TO_STORE,
  payload: { forumId, comments },
});

export const appendCommentsToStore = (forumId, comments) => ({
  type: APPEND_COMMENTS_TO_STORE,
  payload: { forumId, comments },
});

export const setCommentImageUrlsToStore = (forumId, imageUrls) => ({
  type: SET_COMMENT_IMAGE_URLS_TO_STORE,
  payload: { forumId, imageUrls },
});

export const clearCommentsFromStore = (forumId) => ({
  type: CLEAR_COMMENTS_FROM_STORE,
  payload: forumId,
});
