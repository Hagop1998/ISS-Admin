import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { subscriptionService } from '../../services/subscriptionService';
import { logout } from './authSlice';

const initialState = {
  loading: false,
  error: null,
};

export const createUserSubscription = createAsyncThunk(
  'subscriptions/createUserSubscription',
  async (subscriptionData, { rejectWithValue, dispatch }) => {
    try {
      const data = await subscriptionService.createUserSubscription(subscriptionData);
      return data;
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to create user subscription');
    }
  }
);

export const updateUserSubscription = createAsyncThunk(
  'subscriptions/updateUserSubscription',
  async ({ id, subscriptionData }, { rejectWithValue, dispatch }) => {
    try {
      const data = await subscriptionService.updateUserSubscription(id, subscriptionData);
      return data;
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to update user subscription');
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUserSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUserSubscription.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createUserSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create user subscription';
      })
      .addCase(updateUserSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUserSubscription.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateUserSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update user subscription';
      });
  },
});

export const { clearError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;

