// reducers/jobReducer.js
const initialState = {
  jobPosts: [],
  deletedJobIds: new Set(),
  jobImageUrls: {},
};

const jobReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'UPDATE_OR_ADD_JOB_POSTS': {
      const updatedMap = new Map();

      state.jobPosts.forEach(post => {
        updatedMap.set(post.post_id, post);
      });

      action.payload.forEach((newPost) => {
        const existing = updatedMap.get(newPost.post_id);

        if (!existing || new Date(newPost.job_post_created_on) > new Date(existing.job_post_created_on)) {
          updatedMap.set(newPost.post_id, {
            ...existing,
            ...newPost, 
          });
        }
      });

      const sortedUpdatedPosts = Array.from(updatedMap.values()).sort(
        (a, b) => new Date(b.job_post_created_on) - new Date(a.job_post_created_on)
      );

      return {
        ...state,
        jobPosts: sortedUpdatedPosts,
      };
    }


    case 'UPDATE_JOB_POST': {
      const updatedPost = action.payload;
      const updatedPosts = state.jobPosts.map((post) =>
        post.post_id === updatedPost.post_id
          ? { ...post, ...updatedPost } // Merge with existing, keeping imageUrl intact
          : post
      );

      return {
        ...state,
        jobPosts: updatedPosts,
      };
    }

    case 'ADD_JOB_POST': {
      return {
        ...state,
        jobPosts: [action.payload, ...state.jobPosts],
      };
    }

    case 'CLEAR_JOB_POSTS': {
      return {
        ...state,
        jobPosts: [],
        deletedJobIds: new Set(),
      };
    }

    case 'DELETE_JOB_POST': {
      const jobIdToDelete = action.payload;
      return {
        ...state,
        deletedJobIds: new Set(state.deletedJobIds).add(jobIdToDelete),
        jobPosts: state.jobPosts.filter(post => post.post_id !== jobIdToDelete),
      };
    }
    case 'SET_JOB_IMAGE_URLS': {
      return {
        ...state,
        jobImageUrls: {
          ...state.jobImageUrls,
          ...action.payload,
        },
      };
    }


    default:
      return state;
  }
};

export default jobReducer;
