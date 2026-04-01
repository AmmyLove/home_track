// src/api/auth.js

import api from "./axiosInstance.js";

// Send registration details, get back a token + user
export const register = (data) => api.post("/api/auth/register", data);

// Send email + password, get back a token + user
export const login = (data) => api.post("/api/auth/login", data);

// Get the currently logged-in user's details
export const getMe = () => api.get("/api/auth/me");