// src/api/consumption.js

import api from "./axiosInstance.js";

// Get all consumption logs
export const getConsumptions = () => api.get("/api/consumption");

// Log a new consumption (using something at home)
export const logConsumption = (data) => api.post("/api/consumption", data);

// Get usage insights — average per day + days left per item
export const getUsageInsights = () => api.get("/api/consumption/insights");