import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addressService } from '../../services/addressService';
import { logout } from './authSlice';

export const fetchAddresses = createAsyncThunk(
  'addresses/fetchAddresses',
  async (params = {}, { rejectWithValue, dispatch }) => {
    try {
      const data = await addressService.getAddresses();
      return data;
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to fetch addresses');
    }
  }
);

export const createAddress = createAsyncThunk(
  'addresses/createAddress',
  async (addressData, { rejectWithValue, dispatch }) => {
    try {
      const data = await addressService.createAddress(addressData);
      return data;
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to create address');
    }
  }
);

export const updateAddress = createAsyncThunk(
  'addresses/updateAddress',
  async ({ id, addressData }, { rejectWithValue, dispatch }) => {
    try {
      const data = await addressService.updateAddress(id, addressData);
      return { id, data };
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to update address');
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'addresses/deleteAddress',
  async (id, { rejectWithValue, dispatch }) => {
    try {
      await addressService.deleteAddress(id);
      return id;
    } catch (error) {
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to delete address');
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

const addressSlice = createSlice({
  name: 'addresses',
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
      // Fetch addresses
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
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
        } else if (payload?.addresses && Array.isArray(payload.addresses)) {
          state.items = payload.addresses;
          state.pagination.totalItems = payload.addresses.length;
        } else {
          state.items = [];
        }
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch addresses';
      })
      // Create address
      .addCase(createAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAddress.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create address';
      })
      // Update address
      .addCase(updateAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        const { id, data } = action.payload;
        const index = state.items.findIndex(item => item.id === id);
        if (index !== -1 && data) {
          state.items[index] = { ...state.items[index], ...data };
        }
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update address';
      })
      // Delete address
      .addCase(deleteAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter(item => item.id !== action.payload);
        state.pagination.totalItems = state.items.length;
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete address';
      });
  },
});

export const { setPage, setItemsPerPage } = addressSlice.actions;
export default addressSlice.reducer;

