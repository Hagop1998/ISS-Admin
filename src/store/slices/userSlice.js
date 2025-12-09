import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../../services/userService';
import { logout } from './authSlice';

const initialState = {
  users: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {
    search: '',
  },
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params, { rejectWithValue, dispatch }) => {
    try {
      const data = await userService.getUsers(params);
      return data;
    } catch (error) {
      // If unauthorized, logout the user
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to fetch users');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (userId, { rejectWithValue, dispatch }) => {
    try {
      const data = await userService.deleteUser(userId);
      return { userId, data };
    } catch (error) {
      // If unauthorized, logout the user
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to delete user');
    }
  }
);

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    },
    setLimit: (state, action) => {
      state.pagination.limit = action.payload;
    },
    setSearch: (state, action) => {
      state.filters.search = action.payload;
      state.pagination.page = 1; // Reset to first page when searching
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;
        
        // Handle API response format: { results: [], pages: {}, totalCount: number }
        if (payload?.results && Array.isArray(payload.results)) {
          state.users = payload.results;
          
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
          state.users = payload;
        } else if (payload?.data) {
          state.users = payload.data;
          if (payload.pagination) {
            state.pagination = {
              ...state.pagination,
              ...payload.pagination,
            };
          }
        } else if (payload?.users) {
          state.users = payload.users;
          if (payload.pagination) {
            state.pagination = {
              ...state.pagination,
              ...payload.pagination,
            };
          }
        }
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch users';
      })
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        // Remove deleted user from the list
        state.users = state.users.filter(user => user.id !== action.payload.userId);
        // Update total count
        if (state.pagination.total > 0) {
          state.pagination.total -= 1;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete user';
      });
  },
});

export const { setPage, setLimit, setSearch, clearError } = userSlice.actions;
export default userSlice.reducer;

