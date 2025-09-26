// reducers/forumReducer.js
const initialState = {
  posts: [],
  commentsCount: {}, // Mapping forumId -> count
};

const forumReducer = (state = initialState, action) => {
  switch (action.type) {

    case 'SET_COMMENTS_COUNT':
      const { forumId: countForumId, count } = action.payload;

      return {
        ...state,
        commentsCount: {
          ...state.commentsCount,
          [countForumId]: count,
        },
      };
      case 'DECREMENT_COMMENTS_COUNT':
        const { forumId } = action.payload;
        const currentCount = state.commentsCount[forumId] || 0;
      
        return {
          ...state,
          commentsCount: {
            ...state.commentsCount,
            [forumId]: Math.max(currentCount - 1, 0),
          },
        };
      
    case 'ADD_POST':
      return {
        ...state,
        posts: [action.payload, ...state.posts],
      };

    case 'CLEAR_POSTS':
      return {
        ...state,
        posts: [],
      };

    case 'DELETE_POST':
      return {
        ...state,
        posts: state.posts.filter(post => post.forum_id !== action.payload),
      };

    case 'UPDATE_OR_ADD_POSTS':
      const updatedMap = new Map();

      state.posts.forEach(post => {
        updatedMap.set(post.forum_id, post);
      });

      action.payload.forEach((newPost) => {
        const existing = updatedMap.get(newPost.forum_id);

        if (!existing || newPost.posted_on > existing.posted_on) {
          updatedMap.set(newPost.forum_id, newPost);
        }
      });

      const sortedUpdatedPosts = Array.from(updatedMap.values()).sort(
        (a, b) => new Date(b.posted_on) - new Date(a.posted_on)
      );

      return {
        ...state,
        posts: sortedUpdatedPosts,
      };

      case 'UPDATE_POST': {
        const updatedPost = action.payload;
        return {
          ...state,
          posts: state.posts.map(post =>
            post.forum_id === updatedPost.forum_id ? updatedPost : post
          ),
        };
      }
      
      case 'UPDATE_AUTHOR_IMAGE_FOR_POSTS': {
        const { authorId, newImageUrl, newFileKey } = action.payload;
        return {
          ...state,
          posts: state.posts.map(post =>
            post.user_id === authorId
              ? {
                  ...post,
                  authorImageUrl: newImageUrl,
                  author_fileKey: newFileKey?.trim() || '',
                }
              : post
          ),
        };
      }
      
      
      
    default:
      return state;
  }
};

export default forumReducer;