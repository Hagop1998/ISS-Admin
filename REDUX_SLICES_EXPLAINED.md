# Redux Slices Explained

## What is a Slice?

A **slice** is a Redux Toolkit concept that combines:
- **Reducers** (functions that update state)
- **Actions** (functions that trigger state updates)
- **Initial state** (starting state)
- **Async thunks** (for API calls)

All in one organized file!

---

## Why Use Slices?

**Before (Old Redux):**
- Separate files for actions, reducers, types
- Lots of boilerplate code
- Hard to maintain

**With Slices (Redux Toolkit):**
- Everything in one file
- Less code
- Easier to understand
- Automatic action creators

---

## Your Project Structure

```
src/store/slices/
├── userSlice.js          → Manages users (fetch, create, delete, verify)
├── addressSlice.js       → Manages addresses (fetch, create, update, delete)
├── deviceSlice.js        → Manages devices (fetch, create, update, delete, restart, etc.)
├── subscriptionSlice.js  → Manages subscriptions (create, update)
├── authSlice.js          → Manages authentication (login, logout)
├── accessControlSlice.js → Manages access control items
└── navigationSlice.js    → Manages navigation state
```

---

## How a Slice Works

### Example: `userSlice.js`

```javascript
// 1. Initial State
const initialState = {
  users: [],
  loading: false,
  error: null,
  pagination: { ... }
};

// 2. Async Thunks (API calls)
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params) => {
    const data = await userService.getUsers(params);
    return data;
  }
);

// 3. Slice (combines everything)
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setSearch: (state, action) => {
      state.search = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

// 4. Export actions and reducer
export const { setSearch } = userSlice.actions;
export default userSlice.reducer;
```

---

## How Components Use Slices

### In a Component:

```javascript
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, createUser } from '../store/slices/userSlice';

function UsersList() {
  const dispatch = useDispatch();
  
  // Get state from slice
  const { users, loading } = useSelector((state) => state.users);
  
  // Call actions from slice
  useEffect(() => {
    dispatch(fetchUsers({ page: 1, limit: 10 }));
  }, [dispatch]);
  
  // Create user
  const handleAdd = async () => {
    await dispatch(createUser(userData)).unwrap();
  };
}
```

---

## What Each Slice Does

### 1. `userSlice.js`
- **State:** Users list, loading, errors, pagination
- **Actions:** `fetchUsers`, `createUser`, `deleteUser`, `verifyUser`, `changePassword`
- **Used in:** UsersList page, AddUserModal, etc.

### 2. `addressSlice.js`
- **State:** Addresses list, loading, errors
- **Actions:** `fetchAddresses`, `createAddress`, `updateAddress`, `deleteAddress`, `getAddressById`
- **Used in:** AddressesList page, AddAddressModal, etc.

### 3. `deviceSlice.js`
- **State:** Devices list, loading, errors
- **Actions:** `fetchDevices`, `createDevice`, `updateDevice`, `deleteDevice`, `getDeviceById`, `restartDevice`, `unlockDevice`, etc.
- **Used in:** DevicesList page, DeviceConfig, CardSettings, etc.

### 4. `subscriptionSlice.js`
- **State:** Loading, errors
- **Actions:** `createUserSubscription`, `updateUserSubscription`
- **Used in:** UsersList (when verifying users)

### 5. `authSlice.js`
- **State:** User, token, isAuthenticated
- **Actions:** `login`, `logout`
- **Used in:** Login page, throughout app for auth

---

## Benefits of This Architecture

✅ **Organized:** Each domain (users, devices, addresses) has its own slice  
✅ **Reusable:** Any component can use the same slice  
✅ **Centralized:** All API calls go through slices  
✅ **Type-safe:** Redux Toolkit handles types automatically  
✅ **Easy to test:** Slices can be tested independently  

---

## The Flow

```
Component
    ↓ dispatch(action)
Redux Slice
    ↓ calls service
Service (API call)
    ↓ returns data
Redux Slice (updates state)
    ↓
Component (gets updated state)
```

---

## Summary

**Slice = One file that manages:**
- State for a specific domain (users, devices, etc.)
- All API calls for that domain
- Actions to update that state
- Loading and error states

**Think of it as:** A "manager" for a specific part of your app's data!

