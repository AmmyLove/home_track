import api from "./axiosInstance.js";

export const getPurchases = () => api.get("/api/purchases");
export const createPurchase = (data) => api.post("/api/purchases", data);