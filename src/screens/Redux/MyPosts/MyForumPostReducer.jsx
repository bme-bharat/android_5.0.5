import {
  ADD_MY_POST,
  UPDATE_MY_POST,
  DELETE_MY_POST,
  SET_MY_POSTS,
  CLEAR_MY_FORUM_POSTS,
  SET_MY_POST_IMAGE_URLS,
} from '../MyPosts/MyForumPost_Actions';
import defaultImage from '../../../images/homepage/image.jpg'
import { Image } from 'react-native';

const defaultLogo = Image.resolveAssetSource(defaultImage).uri;

const initialState = {
  posts: [],
  imageUrls: {},
};

const myForumsReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_MY_POSTS:
      // Replace posts array but keep existing imageUrls intact
      return {
        ...state,
        posts: action.payload,
      };

    case ADD_MY_POST:
      return {
        ...state,
        posts: [action.payload, ...state.posts],
      };

    case UPDATE_MY_POST:
      return {
        ...state,
        posts: state.posts.map(post =>
          post.forum_id === action.payload.forum_id
            ? { ...post, ...action.payload }
            : post
        ),
      };


    case DELETE_MY_POST:
      return {
        ...state,
        posts: state.posts.filter(post => post.forum_id !== action.payload),
      };

    case CLEAR_MY_FORUM_POSTS:
      return {
        posts: [],
        imageUrls: {},
      };

      case SET_MY_POST_IMAGE_URLS: {
        const newImageUrls = action.payload;
        const updatedImageUrls = { ...state.imageUrls };
      
        for (const [forumId, url] of Object.entries(newImageUrls)) {
          if (url === null || url === '') {
            delete updatedImageUrls[forumId]; 
          } else {
            updatedImageUrls[forumId] = url; 
          }
        }

        if (state.posts && Array.isArray(state.posts)) {
          for (const post of state.posts) {
            const hasFile = !!post.fileKey;
            const hasImageUrl = !!updatedImageUrls[post.forum_id];
      
            if (!hasFile && !hasImageUrl) {
    
              updatedImageUrls[post.forum_id] = defaultLogo;
            }
          }
        }

        return {
          ...state,
          imageUrls: updatedImageUrls,
        };
      }
      


    default:
      return state;
  }
};

export default myForumsReducer;
