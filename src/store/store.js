import { configureStore } from '@reduxjs/toolkit';
import accessControlReducer from './slices/accessControlSlice';
import navigationReducer from './slices/navigationSlice';
import authReducer from './slices/authSlice';
import userReducer from './slices/userSlice';
import addressReducer from './slices/addressSlice';
import deviceReducer from './slices/deviceSlice';

export const store = configureStore({
  reducer: {
    accessControl: accessControlReducer,
    navigation: navigationReducer,
    auth: authReducer,
    users: userReducer,
    addresses: addressReducer,
    devices: deviceReducer,
  },
});

