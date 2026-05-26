import { createSlice } from "@reduxjs/toolkit";

const projectSlice = createSlice({
  name: "project",
  initialState: {
    projects: [],
    currentProject: null,
    loading: false,
    error: null,
    total: 0,
    totalPages: 0,
    currentPage: 1,
  },
  reducers: {
    setProjects: (state, action) => {
      state.projects = Array.isArray(action.payload) ? action.payload : [];
    },
    setCurrentProject: (state, action) => {
      state.currentProject = action.payload;
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
    addProject: (state, action) => {
      state.projects.unshift(action.payload);
      state.total += 1;
    },
    updateProjectItem: (state, action) => {
      const idx = state.projects.findIndex((p) => p._id === action.payload._id);
      if (idx !== -1) state.projects[idx] = action.payload;
    },
    removeProject: (state, action) => {
      state.projects = state.projects.filter((p) => p._id !== action.payload);
      state.total = Math.max(0, state.total - 1);
    },
  },
});

export const {
  setProjects,
  setCurrentProject,
  setLoading,
  setError,
  setMeta,
  addProject,
  updateProjectItem,
  removeProject,
} = projectSlice.actions;

export default projectSlice.reducer;
