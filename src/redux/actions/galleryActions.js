import { Api, ApiFormData } from "@/services/service";
import {
  setItems, setLoading, setError, setMeta,
  addItem, updateItem, removeItem,
} from "../slices/gallerySlice";

export const fetchGallery =
  ({ page = 1, limit = 50, type = "" } = {}, router) =>
  async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const params = new URLSearchParams({ page, limit });
      if (type) params.set("type", type);
      const res = await Api("get", `gallery/admin/all?${params}`, "", router);
      if (res?.status) {
        // handle both flat array and nested { data: [], pagination: {} }
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];
        const pag = res.pagination || res.data?.pagination || {};
        dispatch(setItems(data));
        dispatch(
          setMeta({
            total: pag.total ?? data.length,
            totalPages: pag.totalPages ?? 1,
            currentPage: pag.currentPage ?? page,
          }),
        );
      } else {
        dispatch(setError(res?.message || "Failed to fetch gallery"));
      }
    } catch (err) {
      dispatch(setError(err?.message || "Failed to fetch gallery"));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const createGalleryItem = (formData, router) => async (dispatch) => {
  try {
    const res = await ApiFormData("post", "gallery", formData, router);
    if (res?.status) {
      const item = res.data?.data || res.data;
      if (item) dispatch(addItem(item));
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const updateGalleryItem = (id, formData, router) => async (dispatch) => {
  try {
    const res = await ApiFormData("put", `gallery/${id}`, formData, router);
    if (res?.status) {
      const item = res.data?.data || res.data;
      if (item) dispatch(updateItem(item));
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const deleteGalleryItem = (id, router) => async (dispatch) => {
  try {
    const res = await Api("delete", `gallery/${id}`, "", router);
    if (res?.status) {
      dispatch(removeItem(id));
    }
    return res;
  } catch (err) {
    throw err;
  }
};
