import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { deviceService } from '../../services/deviceService';
import { logout } from './authSlice';

export const fetchDevices = createAsyncThunk(
  'devices/fetchDevices',
  async (params = {}, { rejectWithValue, dispatch }) => {
    try {
      const data = await deviceService.getDevices(params);
      return data;
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to fetch devices');
    }
  }
);

export const createDevice = createAsyncThunk(
  'devices/createDevice',
  async (deviceData, { rejectWithValue, dispatch }) => {
    try {
      const data = await deviceService.createDevice(deviceData);
      return data;
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to create device');
    }
  }
);

export const updateDevice = createAsyncThunk(
  'devices/updateDevice',
  async ({ id, deviceData }, { rejectWithValue, dispatch }) => {
    try {
      const data = await deviceService.updateDevice(id, deviceData);
      return { id, data };
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to update device');
    }
  }
);

export const deleteDevice = createAsyncThunk(
  'devices/deleteDevice',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await deviceService.deleteDevice(id);
      return id;
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to delete device');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  },
};

const deviceSlice = createSlice({
  name: 'devices',
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch devices
      .addCase(fetchDevices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload;

        // Handle different API response formats
        if (Array.isArray(payload)) {
          state.items = payload;
          state.pagination.totalItems = payload.length;
        } else if (payload?.results && Array.isArray(payload.results)) {
          state.items = payload.results;
          if (payload.pages) {
            state.pagination = {
              currentPage: payload.pages.current || state.pagination.currentPage,
              itemsPerPage: parseInt(payload.pages.perPage) || state.pagination.itemsPerPage,
              totalItems: payload.totalCount || 0,
              totalPages: payload.pages.numPages || 1,
            };
          } else if (payload.totalCount !== undefined) {
            state.pagination.totalItems = payload.totalCount;
            if (payload.pages) {
              state.pagination.currentPage = payload.pages.current || 1;
              state.pagination.itemsPerPage = parseInt(payload.pages.perPage) || 10;
              state.pagination.totalPages = payload.pages.numPages || 1;
            }
          }
        } else if (payload?.data && Array.isArray(payload.data)) {
          state.items = payload.data;
          state.pagination.totalItems = payload.data.length;
        } else {
          state.items = [];
        }
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch devices';
      })
      // Create device
      .addCase(createDevice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDevice.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createDevice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create device';
      })
      // Update device
      .addCase(updateDevice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDevice.fulfilled, (state, action) => {
        state.loading = false;
        const { id, data } = action.payload;
        const index = state.items.findIndex(item => item.id === id);
        if (index !== -1 && data) {
          state.items[index] = { ...state.items[index], ...data };
        }
      })
      .addCase(updateDevice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update device';
      })
      // Delete device
      .addCase(deleteDevice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDevice.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        state.pagination.totalItems = state.items.length;
      })
      .addCase(deleteDevice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete device';
      });
  },
});

export const { setPage, setItemsPerPage } = deviceSlice.actions;
export default deviceSlice.reducer;

