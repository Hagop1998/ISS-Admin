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

export const getDeviceById = createAsyncThunk(
  'devices/getDeviceById',
  async (deviceId, { rejectWithValue, dispatch }) => {
    try {
      const data = await deviceService.getDeviceById(deviceId);
      return data;
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to fetch device');
    }
  }
);

export const restartDevice = createAsyncThunk(
  'devices/restartDevice',
  async (localId, { rejectWithValue, dispatch }) => {
    try {
      const data = await deviceService.restartDevice(localId);
      return data;
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to restart device');
    }
  }
);

export const unlockDevice = createAsyncThunk(
  'devices/unlockDevice',
  async (localId, { rejectWithValue, dispatch }) => {
    try {
      const data = await deviceService.unlockDevice(localId);
      return data;
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to unlock device');
    }
  }
);

export const setManagerCard = createAsyncThunk(
  'devices/setManagerCard',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const result = await deviceService.setManagerCard(data);
      return result;
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to set manager card');
    }
  }
);

export const setLiveCard = createAsyncThunk(
  'devices/setLiveCard',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const result = await deviceService.setLiveCard(data);
      return result;
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to set live card');
    }
  }
);

export const setICCard = createAsyncThunk(
  'devices/setICCard',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const result = await deviceService.setICCard(data);
      return result;
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to set IC card');
    }
  }
);

export const setIDCard = createAsyncThunk(
  'devices/setIDCard',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const result = await deviceService.setIDCard(data);
      return result;
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to set ID card');
    }
  }
);

export const upgradeSoftware = createAsyncThunk(
  'devices/upgradeSoftware',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const result = await deviceService.upgradeSoftware(data);
      return result;
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to upgrade software');
    }
  }
);

export const upgradeConfig = createAsyncThunk(
  'devices/upgradeConfig',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const result = await deviceService.upgradeConfig(data);
      return result;
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to upgrade config');
    }
  }
);

export const setServerInfo = createAsyncThunk(
  'devices/setServerInfo',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const result = await deviceService.setServerInfo(data);
      return result;
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to set server info');
    }
  }
);

export const reloadSip = createAsyncThunk(
  'devices/reloadSip',
  async (data, { rejectWithValue, dispatch }) => {
    try {
      const result = await deviceService.reloadSip(data);
      return result;
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to reload SIP');
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
      })
      // Device actions (restart, unlock, etc.) - these don't modify state.items
      .addCase(restartDevice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(restartDevice.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(restartDevice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to restart device';
      })
      .addCase(unlockDevice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(unlockDevice.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(unlockDevice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to unlock device';
      })
      .addCase(setManagerCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setManagerCard.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(setManagerCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to set manager card';
      })
      .addCase(setLiveCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setLiveCard.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(setLiveCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to set live card';
      })
      .addCase(setICCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setICCard.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(setICCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to set IC card';
      })
      .addCase(setIDCard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setIDCard.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(setIDCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to set ID card';
      })
      .addCase(upgradeSoftware.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(upgradeSoftware.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(upgradeSoftware.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to upgrade software';
      })
      .addCase(upgradeConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(upgradeConfig.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(upgradeConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to upgrade config';
      })
      .addCase(setServerInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setServerInfo.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(setServerInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to set server info';
      })
      .addCase(reloadSip.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reloadSip.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(reloadSip.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to reload SIP';
      });
  },
});

export const { setPage, setItemsPerPage } = deviceSlice.actions;
export default deviceSlice.reducer;

