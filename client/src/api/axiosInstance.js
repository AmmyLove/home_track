// src/api/axiosInstance.js

import axios from "axios";

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

// This "interceptor" runs before every single request
// It reads the token from localStorage and adds it to the header
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    // The backend's auth middleware expects: "Authorization: Bearer <token>"
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// This interceptor runs when a response comes back
// If the server says 401 (not authorised), clear the token and reload
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Redirect to login if token expired mid-session
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default instance;