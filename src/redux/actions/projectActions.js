import { Api, ApiFormData } from "@/services/service";
import {
  setProjects,
  setCurrentProject,
  setLoading,
  setError,
  setMeta,
  addProject,
  updateProjectItem,
  removeProject,
} from "../slices/projectSlice";

export const fetchProjects =
  ({ page = 1, limit = 20, category, status, isActive } = {}, router) =>
  async (dispatch) => {
    try {
      dispatch(setLoading(true));
      const params = new URLSearchParams({ page, limit });
      if (category) params.set("category", category);
      if (status) params.set("status", status);
      if (isActive !== undefined) params.set("isActive", isActive);
      const res = await Api("get", `projects/admin/all?${params}`, "", router);
      if (res?.status) {
        const data = Array.isArray(res.data?.data) ? res.data.data : [];
        const pag = res.data?.pagination || {};
        dispatch(setProjects(data));
        dispatch(
          setMeta({
            total: pag.total ?? data.length,
            totalPages: pag.totalPages ?? 1,
            currentPage: pag.currentPage ?? page,
          })
        );
      } else {
        dispatch(setError(res?.message || "Failed to fetch projects"));
      }
    } catch (err) {
      dispatch(setError(err?.message || "Failed to fetch projects"));
    } finally {
      dispatch(setLoading(false));
    }
  };

export const fetchProjectById = (id, router) => async (dispatch) => {
  try {
    dispatch(setLoading(true));
    const res = await Api("get", `projects/${id}`, "", router);
    if (res?.status) {
      dispatch(setCurrentProject(res.data?.data || res.data));
    }
    return res;
  } catch (err) {
    throw err;
  } finally {
    dispatch(setLoading(false));
  }
};

export const createProject = (formData, router) => async (dispatch) => {
  try {
    const res = await ApiFormData("post", "projects", formData, router);
    if (res?.status) {
      const project = res.data?.data || res.data;
      if (project?._id) dispatch(addProject(project));
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const updateProject = (id, formData, router) => async (dispatch) => {
  try {
    const res = await ApiFormData("put", `projects/${id}`, formData, router);
    if (res?.status) {
      const project = res.data?.data || res.data;
      if (project?._id) dispatch(updateProjectItem(project));
    }
    return res;
  } catch (err) {
    throw err;
  }
};

export const deleteProject = (id, router) => async (dispatch) => {
  try {
    const res = await Api("delete", `projects/${id}`, "", router);
    if (res?.status) {
      dispatch(removeProject(id));
    }
    return res;
  } catch (err) {
    throw err;
  }
};
