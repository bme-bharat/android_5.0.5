// reducers/index.js
import { combineReducers } from 'redux';
import forumReducer from './ForumReducer';
import resourcePostReducer from './ResourceReducer';
import jobReducer from './JobReducer';
import profileReducer from './ProfileReducer';
import myForumsReducer from './MyPosts/MyForumPostReducer';
import CompanyReducer from './MyProfile/CompanyProfileReducer';
import commentReducer from './CommentsReducer';

const rootReducer = combineReducers({
  forum: forumReducer,
  resources: resourcePostReducer,
  jobs: jobReducer,
  profile: profileReducer,
  myForums: myForumsReducer,
  CompanyProfile: CompanyReducer,
  comments: commentReducer,
  // other reducers can be added here in future like:
  // auth: authReducer,
  // user: userReducer,
});

export default rootReducer;
