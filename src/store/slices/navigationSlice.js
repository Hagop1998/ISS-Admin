import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  expandedMenus: ['access-control'],
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    toggleMenu: (state, action) => {
      const menuId = action.payload;
      const index = state.expandedMenus.indexOf(menuId);
      if (index > -1) {
        state.expandedMenus.splice(index, 1);
      } else {
        state.expandedMenus.push(menuId);
      }
    },
  },
});

export const { toggleMenu } = navigationSlice.actions;
export default navigationSlice.reducer;

