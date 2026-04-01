import api from "./axiosInstance.js";

export const getDailySpending = () => api.get("/api/spending/daily");
export const getWeeklySpending = () => api.get("/api/spending/weekly");
export const getMonthlySpending = () => api.get("/api/spending/monthly");
export const getAllTimeSpending = () => api.get("/api/spending/all-time");
export const getMonthlyHistory = () => api.get("/api/spending/history");