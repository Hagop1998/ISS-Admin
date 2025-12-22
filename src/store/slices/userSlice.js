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
    role: '',
  },
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params, { rejectWithValue, dispatch }) => {
    try {
      const { page = 1, limit = 10, search = '', role = '' } = params;
      const data = await userService.getUsers({ page, limit, search, role });
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

export const verifyUser = createAsyncThunk(
  'users/verifyUser',
  async (userId, { rejectWithValue, dispatch }) => {
    try {
      const data = await userService.verifyUser(userId);
      // Handle different response formats
      const userData = data?.data || data?.user || data;
      return { 
        userId, 
        data: userData,
        fullResponse: data 
      };
    } catch (error) {
      console.error('Verify user thunk error:', error);
      // If unauthorized, logout the user
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to verify user');
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData, { rejectWithValue, dispatch }) => {
    try {
      const data = await userService.createUser(userData);
      return data?.data || data?.user || data;
    } catch (error) {
      // If unauthorized, logout the user
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to create user');
    }
  }
);

export const changePassword = createAsyncThunk(
  'users/changePassword',
  async (passwordData, { rejectWithValue, dispatch }) => {
    try {
      const data = await userService.changePassword(passwordData);
      return data;
    } catch (error) {
      // If unauthorized, logout the user
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to change password');
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
    setRole: (state, action) => {
      state.filters.role = action.payload;
      state.pagination.page = 1; // Reset to first page when filtering
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
      })
      .addCase(verifyUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyUser.fulfilled, (state, action) => {
        state.loading = false;
        // Update the verified user in the list
        const userId = action.payload.userId;
        const responseData = action.payload.data;
        
        // Try to find user by id or _id
        const userIndex = state.users.findIndex(user => {
          const userIdentifier = user.id || user._id;
          return userIdentifier === userId || userIdentifier?.toString() === userId?.toString();
        });
        
        if (userIndex !== -1) {
          // Update with response data if available, otherwise just set isVerified
          if (responseData) {
            state.users[userIndex] = {
              ...state.users[userIndex],
              ...responseData,
              isVerified: true,
            };
          } else {
            state.users[userIndex] = {
              ...state.users[userIndex],
              isVerified: true,
            };
          }
        }
      })
      .addCase(verifyUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to verify user';
      })
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false;
        // Don't add to list immediately - will be refreshed via fetchUsers
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create user';
      })
      .addCase(changePassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to change password';
      });
  },
});

export const { setPage, setLimit, setSearch, setRole, clearError } = userSlice.actions;
export default userSlice.reducer;

