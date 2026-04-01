// src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../api/auth.js";

// Create the context — think of it as a shared box everyone can read from
const AuthContext = createContext(null);

// This wraps your whole app and provides the shared auth state
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);   // the logged-in user object
  const [loading, setLoading] = useState(true);   // true while we check if user is already logged in

  // When the app first loads, check if there's a saved token
  // If there is, fetch the user's details automatically
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          // Token is invalid or expired — clear it
          localStorage.removeItem("token");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  // Called after a successful login or register
  const saveAuth = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
  };

  // Called when user clicks "Sign out"
  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// A shortcut hook — any component can call useAuth() to get the current user
export const useAuth = () => useContext(AuthContext);