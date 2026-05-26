import { Api, ApiFormData } from "@/services/service";
import {
  setBlogs,
  setLoading,
  setError,
  setMeta,
  addBlog,
  updateBlogItem,
  removeBlog,
} from "../slices/blogSlice";

export const fetchBlogs =
  ({ page = 1, limit = 20, isPublished } = {}, router) =>
  async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const params = new URLSearchParams({ page, limit });
      if (isPublished !== undefined) params.set("isPublished", isPublished);
      const res = await Api("get", `blogs/admin/all?${params}`, "", router);
      if (res?.status) {
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        const pag = res.data?.pagination || {};
        dispatch(setBlogs(data));
        dispatch(
          setMeta({
            total: pag.total ?? data.length,
            totalPages: pag.totalPages ?? 1,
            currentPage: pag.currentPage ?? page,
          }),
        );
      } else {
        dispatch(setError(res?.message || "Failed to fetch blogs"));
      }
    } catch (err) {
      dispatch(setError(err?.message || "Failed to fetch blogs"));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const createBlog = (formData, router) => async (dispatch) => {
  try {
    const res = await ApiFormData("post", "blogs", formData, router);
    if (res?.status) {
      const blog = res.data?.data || res.data;
      if (blog?._id) dispatch(addBlog(blog));
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const updateBlog = (id, formData, router) => async (dispatch) => {
  try {
    const res = await ApiFormData("put", `blogs/${id}`, formData, router);
    if (res?.status) {
      const blog = res.data?.data || res.data;
      if (blog?._id) dispatch(updateBlogItem(blog));
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const deleteBlog = (id, router) => async (dispatch) => {
  try {
    const res = await Api("delete", `blogs/${id}`, "", router);
    if (res?.status) {
      dispatch(removeBlog(id));
    }
    return res;
  } catch (err) {
    throw err;
  }
};
