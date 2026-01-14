import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../../services/userService';
import { logout } from './authSlice';

const initialState = {
  history: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
};

export const fetchUserHistory = createAsyncThunk(
  'userHistory/fetchUserHistory',
  async (params, { rejectWithValue, dispatch }) => {
    try {
      const { page = 1, limit = 10 } = params;
      const data = await userService.getUserHistory({ page, limit });
      return data;
    } catch (error) {
      // If unauthorized, logout the user
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to fetch user history');
    }
  }
);

const userHistorySlice = createSlice({
  name: 'userHistory',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserHistory.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        
        // Handle API response format: { results: [], pages: {}, totalCount: number }
        if (payload?.results && Array.isArray(payload.results)) {
          state.history = payload.results;
          
          if (payload.pages) {
            state.pagination = {
              page: payload.pages.current || state.pagination.page,
              limit: parseInt(payload.pages.perPage) || state.pagination.limit,
              total: payload.pages.totalCount || payload.totalCount || 0,
              totalPages: payload.pages.numPages || 1,
            };
          } else if (payload.totalCount !== undefined) {
            state.pagination.total = payload.totalCount;
          }
        } 
        // Fallback for other response formats
        else if (Array.isArray(payload)) {
          state.history = payload;
        } else if (payload?.data) {
          state.history = payload.data;
          if (payload.pagination) {
            state.pagination = {
              ...state.pagination,
              ...payload.pagination,
            };
          }
        } else if (payload?.history) {
          state.history = payload.history;
          if (payload.pagination) {
            state.pagination = {
              ...state.pagination,
              ...payload.pagination,
            };
          }
        }
      })
      .addCase(fetchUserHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch user history';
      });
  },
});

export const { setPage, setLimit, clearError } = userHistorySlice.actions;
export default userHistorySlice.reducer;
