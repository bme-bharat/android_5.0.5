import {
    SET_COMMENTS_TO_STORE,
    APPEND_COMMENTS_TO_STORE,
    SET_COMMENT_IMAGE_URLS_TO_STORE,
    CLEAR_COMMENTS_FROM_STORE,
    UPDATE_COMMENT_IN_STORE,
    DELETE_COMMENT_FROM_STORE,
    SET_COMMENT_COUNT_TO_STORE,
  } from './Comments_Actions';
  
  const initialState = {
    commentsByForum: {},
    imageUrlsByForum: {},
    commentCounts: {}, 
  };
  
  const commentReducer = (state = initialState, action) => {
    switch (action.type) {
      case SET_COMMENTS_TO_STORE: {
        const { forumId, comments } = action.payload;
        return {
          ...state,
          commentsByForum: {
            ...state.commentsByForum,
            [forumId]: comments,
          },
        };
      }
  
      case APPEND_COMMENTS_TO_STORE: {
        const { forumId, comments } = action.payload;
        const existingComments = state.commentsByForum[forumId] || [];
  
        const merged = [...existingComments, ...comments];
        const uniqueMap = new Map();
        merged.forEach(comment => {
          uniqueMap.set(comment.comment_id, comment);
        });
  
        const deduplicatedSorted = Array.from(uniqueMap.values()).sort(
          (a, b) => b.commented_on - a.commented_on
        );
  
        return {
          ...state,
          commentsByForum: {
            ...state.commentsByForum,
            [forumId]: deduplicatedSorted,
          },
        };
      }
  
      case SET_COMMENT_IMAGE_URLS_TO_STORE: {
        const { forumId, imageUrls } = action.payload;
        return {
          ...state,
          imageUrlsByForum: {
            ...state.imageUrlsByForum,
            [forumId]: {
              ...(state.imageUrlsByForum[forumId] || {}),
              ...imageUrls,
            },
          },
        };
      }
  
      case CLEAR_COMMENTS_FROM_STORE: {
        const forumId = action.payload;
        const updatedComments = { ...state.commentsByForum };
        const updatedImageUrls = { ...state.imageUrlsByForum };
  
        delete updatedComments[forumId];
        delete updatedImageUrls[forumId];
  
        return {
          ...state,
          commentsByForum: updatedComments,
          imageUrlsByForum: updatedImageUrls,
        };
      }

      case UPDATE_COMMENT_IN_STORE: {
        const { forumId, updatedComment } = action.payload;
        console.log('UPDATE_COMMENT_IN_STORE called with forumId:', forumId);
        console.log('updatedComment:', updatedComment);
      
        const existingComments = state.commentsByForum[forumId] || [];
        console.log('existingComments count:', existingComments.length);
      
        // Update comment in the array
        const updatedComments = existingComments.map(comment =>
          comment.comment_id === updatedComment.comment_id ? { ...comment, ...updatedComment } : comment
        );
      
        // Sort comments by commented_on descending, so updated/newest comment goes to top
        const sortedComments = [...updatedComments].sort((a, b) => b.commented_on - a.commented_on);
      
        // Check if comment was replaced
        const wasUpdated = updatedComments.some(
          comment => comment.comment_id === updatedComment.comment_id && comment.text === updatedComment.text
        );
        console.log('Was comment updated:', wasUpdated);
      
        console.log('updatedComments count:', sortedComments.length);
      
        return {
          ...state,
          commentsByForum: {
            ...state.commentsByForum,
            [forumId]: sortedComments,
          },
        };
      }
      
      case DELETE_COMMENT_FROM_STORE: {
        const { forumId, commentId } = action.payload;
        const existingComments = state.commentsByForum[forumId] || [];
      
        // Filter out the deleted comment
        const updatedComments = existingComments.filter(comment => comment.comment_id !== commentId);
      
        return {
          ...state,
          commentsByForum: {
            ...state.commentsByForum,
            [forumId]: updatedComments,
          },
        };
      }
      case SET_COMMENT_COUNT_TO_STORE:
  return {
    ...state,
    commentCounts: {
      ...state.commentCounts,
      [action.payload.forumId]: action.payload.count,
    },
  };

      
      
      
      default:
        return state;
    }
  };
  
  export default commentReducer;
  