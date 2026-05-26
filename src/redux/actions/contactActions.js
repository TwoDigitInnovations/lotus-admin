import { Api } from "@/services/service";
import {
  setContacts,
  setCurrentContact,
  setLoading,
  setError,
  setMeta,
  updateContactStatus,
  removeContact,
} from "../slices/contactSlice";

export const fetchContacts =
  ({ page = 1, limit = 20, status = "" } = {}, router) =>
  async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const params = new URLSearchParams({ page, limit });
      if (status) params.set("status", status);
      const res = await Api("get", `contact?${params}`, "", router);
      if (res?.status) {
        dispatch(setContacts(res.data?.data || res.data || []));
        dispatch(
          setMeta({
            total: res.data?.total ?? 0,
            totalPages: res.data?.totalPages ?? 1,
            currentPage: res.data?.currentPage ?? page,
          }),
        );
      } else {
        dispatch(setError(res?.message || "Failed to fetch contacts"));
      }
    } catch (err) {
      dispatch(setError(err?.message || "Failed to fetch contacts"));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const fetchContactById = (id, router) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await Api("get", `contact/${id}`, "", router);
    if (res?.status) {
      dispatch(setCurrentContact(res.data?.data || res.data));
    }
  } catch (err) {
    // silently ignore — used for detail view
  } finally {
    dispatch(setLoading(false));
  }
};

export const changeContactStatus = (id, status, router) => async (dispatch) => {
  try {
    const res = await Api("patch", `contact/${id}/status`, { status }, router);
    if (res?.status) {
      dispatch(updateContactStatus({ id, status }));
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const deleteContact = (id, router) => async (dispatch) => {
  try {
    const res = await Api("delete", `contact/${id}`, "", router);
    if (res?.status) {
      dispatch(removeContact(id));
    }
    return res;
  } catch (err) {
    throw err;
  }
};
