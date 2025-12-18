import { createSlice } from '@reduxjs/toolkit';

type ThemeState = {
  colorScheme: 'light' | 'dark';
};

const storedTheme = localStorage.getItem('theme');

const initialState: ThemeState = {
  colorScheme:
    storedTheme === 'light' || storedTheme === 'dark'
      ? storedTheme
      : 'dark',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.colorScheme =
        state.colorScheme === 'dark' ? 'light' : 'dark';

      localStorage.setItem('theme', state.colorScheme);
    },

    setTheme(state, action) {
      state.colorScheme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
