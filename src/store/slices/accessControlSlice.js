import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { addressService } from '../../services/addressService';
import { deviceService } from '../../services/deviceService';
import { logout } from './authSlice';

export const fetchAddresses = createAsyncThunk(
  'accessControl/fetchAddresses',
  async (params = {}, { rejectWithValue, dispatch }) => {
    try {
      const data = await addressService.getAddresses(params);
      return data;
    } catch (error) {
      // If unauthorized, logout the user
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to fetch addresses');
    }
  }
);

export const fetchDevices = createAsyncThunk(
  'accessControl/fetchDevices',
  async (params, { rejectWithValue, dispatch }) => {
    try {
      const data = await deviceService.getDevices(params);
      return data;
    } catch (error) {
      // If unauthorized, logout the user
      if (error.message && error.message.includes('Unauthorized')) {
        dispatch(logout());
      }
      return rejectWithValue(error.message || 'Failed to fetch devices');
    }
  }
);

const initialState = {
  items: [],
  allItems: [], // Store all items for client-side filtering
  filters: {
    address: 'all',
    deviceType: 'all',
    isOnline: 'all', // 'all', 'online', 'offline'
  },
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
  },
  selectedItems: [],
  addresses: [],
  addressesLoading: false,
  addressesError: null,
  devicesLoading: false,
  devicesError: null,
};

const accessControlSlice = createSlice({
  name: 'accessControl',
  initialState,
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.currentPage = 1;
      
      // Re-apply filters to allItems
      state.items = state.allItems.filter(item => {
        // Filter by address
        if (state.filters.address !== 'all' && item.addressId != state.filters.address) {
          return false;
        }
        
        // Filter by device type
        if (state.filters.deviceType !== 'all' && item.deviceType !== state.filters.deviceType) {
          return false;
        }
        
        // Filter by online/offline
        if (state.filters.isOnline !== 'all') {
          const isOnline = item.isOnline === true;
          if (state.filters.isOnline === 'online' && !isOnline) {
            return false;
          }
          if (state.filters.isOnline === 'offline' && isOnline) {
            return false;
          }
        }
        
        return true;
      });
      
      // Update pagination totalItems based on filtered results
      state.pagination.totalItems = state.items.length;
    },
    setPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setItemsPerPage: (state, action) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1; // Reset to first page when changing page size
    },
    toggleSelectItem: (state, action) => {
      const id = action.payload;
      const index = state.selectedItems.indexOf(id);
      if (index > -1) {
        state.selectedItems.splice(index, 1);
      } else {
        state.selectedItems.push(id);
      }
    },
    setSelectedItems: (state, action) => {
      state.selectedItems = action.payload;
    },
    deleteItem: (state, action) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.pagination.totalItems = state.items.length;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.addressesLoading = true;
        state.addressesError = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.addressesLoading = false;
        const payload = action.payload;
        
        // Handle different API response formats
        let addresses = [];
        if (Array.isArray(payload)) {
          addresses = payload;
        } else if (payload?.results && Array.isArray(payload.results)) {
          addresses = payload.results;
        } else if (payload?.data && Array.isArray(payload.data)) {
          addresses = payload.data;
        } else if (payload?.addresses && Array.isArray(payload.addresses)) {
          addresses = payload.addresses;
        }
        
        // Update addresses array (for filter dropdown)
        state.addresses = addresses;
        
        // Map addresses with devices to items for the table
        // Each address has a device property
        const mappedItems = addresses
          .filter(address => address.device) // Only include addresses with devices
          .map(address => {
            const device = address.device;
            return {
              id: device.id,
              localId: device.localId,
              communityName: address.address || address.name || address.title || '-',
              addressId: address.id || address._id,
              deviceType: device.deviceType || '-',
              installationPosition: device.deviceType || '-',
              accessControlName: 'AC',
              serialNumber: device.localId || '-',
              permissionValues: device.permissionValues || '0',
              lastOnlineTime: device.lastOnlineTime || '-',
              label: device.deviceType || '-',
              state: device.isOnline ? 'Online' : 'Offline',
              isOnline: device.isOnline || false,
              // Keep original data for reference
              address: address,
              device: device,
            };
          });
        
        // Store all items for client-side filtering
        state.allItems = mappedItems;
        
        // Apply filters
        state.items = mappedItems.filter(item => {
          // Filter by address
          if (state.filters.address !== 'all' && item.addressId != state.filters.address) {
            return false;
          }
          
          // Filter by device type
          if (state.filters.deviceType !== 'all' && item.deviceType !== state.filters.deviceType) {
            return false;
          }
          
          // Filter by online/offline
          if (state.filters.isOnline !== 'all') {
            const isOnline = item.isOnline === true;
            if (state.filters.isOnline === 'online' && !isOnline) {
              return false;
            }
            if (state.filters.isOnline === 'offline' && isOnline) {
              return false;
            }
          }
          
          return true;
        });
        
        // Update pagination - use filtered items count for totalItems
        // Store API pagination info separately if needed
        if (payload?.pages) {
          state.pagination = {
            currentPage: payload.pages.current || state.pagination.currentPage,
            itemsPerPage: parseInt(payload.pages.perPage) || state.pagination.itemsPerPage,
            totalItems: state.items.length, // Use filtered items count
            totalPages: Math.ceil(state.items.length / (parseInt(payload.pages.perPage) || state.pagination.itemsPerPage)),
          };
        } else if (payload?.totalCount !== undefined) {
          state.pagination.totalItems = state.items.length; // Use filtered items count
        } else {
          state.pagination.totalItems = state.items.length; // Use filtered items count
        }
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.addressesLoading = false;
        state.addressesError = action.payload || 'Failed to fetch addresses';
      })
      .addCase(fetchDevices.pending, (state) => {
        state.devicesLoading = true;
        state.devicesError = null;
      })
      .addCase(fetchDevices.fulfilled, (state, action) => {
        state.devicesLoading = false;
        const payload = action.payload;
        
        // Map API response to table format
        // API response: { pages: {...}, totalCount: number, results: [{ id, localId, deviceType, address, ... }] }
        if (payload?.results && Array.isArray(payload.results)) {
          state.items = payload.results.map(device => ({
            id: device.id,
            localId: device.localId, // Keep for restart API
            communityName: device.address?.name || device.address?.title || device.address?.address || '-',
            installationPosition: device.deviceType || '-',
            accessControlName: 'AC', // Hardcoded as per requirement
            serialNumber: device.localId || '-',
            permissionValues: device.permissionValues || '0',
            lastOnlineTime: device.lastOnlineTime || '-',
            label: device.deviceType || '-',
            state: device.state || 'Offline', // You may need to determine this from device status
            // Keep original device data for reference
            ...device,
          }));
          
          // Update pagination from API response
          if (payload.pages) {
            state.pagination = {
              currentPage: payload.pages.current || state.pagination.currentPage,
              itemsPerPage: parseInt(payload.pages.perPage) || state.pagination.itemsPerPage,
              totalItems: payload.totalCount || 0,
              totalPages: payload.pages.numPages || 1,
            };
          } else if (payload.totalCount !== undefined) {
            state.pagination.totalItems = payload.totalCount;
          }
        } else {
          state.items = [];
        }
      })
      .addCase(fetchDevices.rejected, (state, action) => {
        state.devicesLoading = false;
        state.devicesError = action.payload || 'Failed to fetch devices';
      });
  },
});

export const { setFilter, setPage, setItemsPerPage, toggleSelectItem, setSelectedItems, deleteItem } = accessControlSlice.actions;
export default accessControlSlice.reducer;

