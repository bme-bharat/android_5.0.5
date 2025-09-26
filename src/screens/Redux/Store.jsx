// store.js

import { createStore } from 'redux';
import rootReducer from '../Redux/RootReducers';

const store = createStore(rootReducer);

export default store;
