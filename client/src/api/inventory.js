import api from "./axiosInstance.js";

export const getInventory = () => api.get("/api/inventory");