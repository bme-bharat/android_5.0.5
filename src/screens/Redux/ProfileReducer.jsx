import { SET_PROFILE_IMAGE_URL } from '../Redux/Profile_actions';

const initialState = {
  profileImageUrl: null,
};

const profileReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_PROFILE_IMAGE_URL:
      return {
        ...state,
        profileImageUrl: action.payload,
      };
    default:
      return state;
  }
};

export default profileReducer;
