// actions/resourcePostActions.js


export const UPDATE_OR_ADD_RESOURCE_POSTS = 'UPDATE_OR_ADD_RESOURCE_POSTS';
export const ADD_RESOURCE_POST = 'ADD_RESOURCE_POST';
export const UPDATE_RESOURCE_POST = 'UPDATE_RESOURCE_POST';
export const CLEAR_RESOURCE_POSTS = 'CLEAR_RESOURCE_POSTS';
export const DELETE_RESOURCE_POST = 'DELETE_RESOURCE_POST';


export const deleteResourcePost = (resourceId) => ({
    type: DELETE_RESOURCE_POST,
    payload: resourceId,
});
export const clearResourcePosts = () => ({
    type: CLEAR_RESOURCE_POSTS,
});

export const updateResourcePost = (post) => ({
    type: UPDATE_RESOURCE_POST,
    payload: post,
});

export const addResourcePost = (posts) => ({
    type: ADD_RESOURCE_POST,
    payload: posts,
  });

export const updateOrAddResourcePosts = (posts) => ({
  type: UPDATE_OR_ADD_RESOURCE_POSTS,
  payload: posts,
});

