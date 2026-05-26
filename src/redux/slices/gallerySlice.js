import { createSlice } from "@reduxjs/toolkit";

const gallerySlice = createSlice({
  name: "gallery",
  initialState: {
    items: [],
    loading: false,
    error: null,
    total: 0,
    totalPages: 0,
    currentPage: 1,
  },
  reducers: {
    setItems: (state, action) => {
      state.items = Array.isArray(action.payload) ? action.payload : [];
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setMeta: (state, action) => {
      state.total = action.payload.total ?? state.total;
      state.totalPages = action.payload.totalPages ?? state.totalPages;
      state.currentPage = action.payload.currentPage ?? state.currentPage;
    },
    addItem: (state, action) => {
      state.items.unshift(action.payload);
      state.total += 1;
    },
    updateItem: (state, action) => {
      const idx = state.items.findIndex((i) => i._id === action.payload._id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    },
  },
});

export const {
  setItems, setLoading, setError, setMeta,
  addItem, updateItem, removeItem,
} = gallerySlice.actions;

export default gallerySlice.reducer;
