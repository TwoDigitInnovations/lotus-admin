import { createSlice } from "@reduxjs/toolkit";

const blogSlice = createSlice({
  name: "blog",
  initialState: {
    blogs: [],
    currentBlog: null,
    loading: false,
    error: null,
    total: 0,
    totalPages: 0,
    currentPage: 1,
  },
  reducers: {
    setCurrentBlog: (state, action) => {
      state.currentBlog = action.payload;
    },
    setBlogs: (state, action) => {
      state.blogs = Array.isArray(action.payload) ? action.payload : [];
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
    addBlog: (state, action) => {
      state.blogs.unshift(action.payload);
      state.total += 1;
    },
    updateBlogItem: (state, action) => {
      const idx = state.blogs.findIndex((b) => b._id === action.payload._id);
      if (idx !== -1) state.blogs[idx] = action.payload;
    },
    removeBlog: (state, action) => {
      state.blogs = state.blogs.filter((b) => b._id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    },
  },
});

export const {
  setBlogs,
  setCurrentBlog,
  setLoading,
  setError,
  setMeta,
  addBlog,
  updateBlogItem,
  removeBlog,
} = blogSlice.actions;

export default blogSlice.reducer;
