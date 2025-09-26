import {
    UPDATE_OR_ADD_RESOURCE_POSTS,
    ADD_RESOURCE_POST,
    UPDATE_RESOURCE_POST,
    CLEAR_RESOURCE_POSTS,
    DELETE_RESOURCE_POST,
} from './Resource_Actions';

const initialState = {
    resourcePosts: [],
    deletedResourceIds: new Set(),
};

const resourcePostReducer = (state = initialState, action) => {
    switch (action.type) {
        case UPDATE_OR_ADD_RESOURCE_POSTS: {
            const updatedMap = new Map();

            // Filter out deleted posts
            const filteredPosts = state.resourcePosts.filter(post => !state.deletedResourceIds.has(post.resource_id));

            // Add existing posts to the map
            filteredPosts.forEach(post => {
                updatedMap.set(post.resource_id, post);
            });

            // Add or update new posts
            action.payload.forEach(newPost => {
                const existing = updatedMap.get(newPost.resource_id);
                if (!existing || newPost.posted_on > existing.posted_on) {
                    updatedMap.set(newPost.resource_id, newPost);
                }
            });

            // Convert map to array and sort by posted_on
            const sortedUpdatedPosts = Array.from(updatedMap.values()).sort(
                (a, b) => new Date(b.posted_on) - new Date(a.posted_on)
            );

            return {
                ...state,
                resourcePosts: sortedUpdatedPosts,
            };
        }

        case ADD_RESOURCE_POST: {
            const newPost = action.payload;
            const updatedMap = new Map(state.resourcePosts.map(post => [post.resource_id, post]));

            // Add the new post
            updatedMap.set(newPost.resource_id, newPost);

            // Convert map to array and sort by posted_on
            const sortedUpdatedPosts = Array.from(updatedMap.values()).sort(
                (a, b) => new Date(b.posted_on) - new Date(a.posted_on)
            );

            return {
                ...state,
                resourcePosts: sortedUpdatedPosts,
            };
        }

        case UPDATE_RESOURCE_POST: {
            const updatedPost = action.payload;
            const updatedMap = new Map(state.resourcePosts.map(post => [post.resource_id, post]));
            const existingPost = updatedMap.get(updatedPost.resource_id) || {};
        
            const isImage = updatedPost.imageUrl?.endsWith('.jpeg') || updatedPost.imageUrl?.endsWith('.jpg') || updatedPost.imageUrl?.endsWith('.png');
            const isVideo = updatedPost.videoUrl?.endsWith('.mp4') || updatedPost.fileKey?.endsWith('.mp4');
        
            const mergedPost = {
                ...existingPost,
                ...updatedPost,
                imageUrl: isImage ? updatedPost.imageUrl : null,
                videoUrl: isVideo ? updatedPost.videoUrl : null,
                thumbnailUrl: isVideo ? updatedPost.thumbnailUrl : null,
                aspectRatio: updatedPost.aspectRatio ?? (isVideo ? 1.77 : 1),
            };
        
            updatedMap.set(updatedPost.resource_id, mergedPost);
        
            const sortedUpdatedPosts = Array.from(updatedMap.values()).sort(
                (a, b) => new Date(b.posted_on) - new Date(a.posted_on)
            );
        
            return {
                ...state,
                resourcePosts: sortedUpdatedPosts,
            };
        }
        
        

        case CLEAR_RESOURCE_POSTS: {
            return {
                ...state,
                resourcePosts: [],
                deletedResourceIds: new Set(),
            };
        }

        case DELETE_RESOURCE_POST: {
            const resourceIdToDelete = action.payload;
            return {
                ...state,
                deletedResourceIds: new Set(state.deletedResourceIds).add(resourceIdToDelete), // Add to deleted IDs
                resourcePosts: state.resourcePosts.filter(post => post.resource_id !== resourceIdToDelete),
            };
        }

        default:
            return state;
    }
};

export default resourcePostReducer;
