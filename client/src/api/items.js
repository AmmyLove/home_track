import api from "./axiosInstance.js";

export const getItems = () => api.get("/api/items");
export const createItem = (data) => api.post("/api/items", data);
export const updateItem = (id, data) => api.put(`/api/items/${id}`, data);
export const deleteItem = (id) => api.delete(`/api/items/${id}`);
