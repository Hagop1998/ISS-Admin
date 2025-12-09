import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/authService';

const storedToken = localStorage.getItem('iss_admin_token');
const storedUser = localStorage.getItem('iss_admin_user');

const storedRefreshToken = localStorage.getItem('iss_admin_refresh_token');

const initialState = {
  token: storedToken || null,
  refreshToken: storedRefreshToken || null,
  user: storedUser ? JSON.parse(storedUser) : null,
  status: 'idle',
  error: null,
  message: null,
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const data = await authService.login(credentials);
      return data;
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.refreshToken = null;
      state.status = 'idle';
      state.error = null;
      state.message = null;
      localStorage.removeItem('iss_admin_token');
      localStorage.removeItem('iss_admin_refresh_token');
      localStorage.removeItem('iss_admin_user');
    },
    resetError: (state) => {
      state.error = null;
    },
    resetMessage: (state) => {
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.status = 'loading';
        state.error = null;
        state.message = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.token = action.payload?.token || null;
        state.user = action.payload?.user || null;
        state.refreshToken = action.payload?.refreshToken || null;
        state.message = action.payload?.message || 'Login successful.';
        if (state.token) {
          localStorage.setItem('iss_admin_token', state.token);
        }
        if (state.refreshToken) {
          localStorage.setItem('iss_admin_refresh_token', state.refreshToken);
        }
        if (state.user) {
          localStorage.setItem('iss_admin_user', JSON.stringify(state.user));
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Login failed';
        state.message = null;
      });
  },
});

export const { logout, resetError, resetMessage } = authSlice.actions;
export default authSlice.reducer;
