import { createSlice } from "@reduxjs/toolkit";

const contactSlice = createSlice({
  name: "contact",
  initialState: {
    contacts: [],
    currentContact: null,
    loading: false,
    error: null,
    total: 0,
    totalPages: 0,
    currentPage: 1,
  },
  reducers: {
    setContacts: (state, action) => {
      state.contacts = Array.isArray(action.payload) ? action.payload : [];
    },
    setCurrentContact: (state, action) => {
      state.currentContact = action.payload;
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
    updateContactStatus: (state, action) => {
      const { id, status } = action.payload;
      const idx = state.contacts.findIndex((c) => c._id === id);
      if (idx !== -1) state.contacts[idx].status = status;
      if (state.currentContact?._id === id)
        state.currentContact.status = status;
    },
    removeContact: (state, action) => {
      state.contacts = state.contacts.filter((c) => c._id !== action.payload);
      if (state.currentContact?._id === action.payload)
        state.currentContact = null;
    },
  },
});

export const {
  setContacts,
  setCurrentContact,
  setLoading,
  setError,
  setMeta,
  updateContactStatus,
  removeContact,
} = contactSlice.actions;

export default contactSlice.reducer;
