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

    if (!token) {
      // No token — skip the check, go straight to not-logged-in state
      setLoading(false);
      return;
    }
      getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          // Token is invalid or expired — clear it
          localStorage.removeItem("token");
           setUser(null);
        })
        .finally(() => setLoading(false));
    // {
    //   setLoading(false);
    // }
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

  // Don't render anything until we know the auth state
  // This prevents a flash of the login page for logged-in users
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#fdf6e3", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "12px", fontFamily: "Georgia, serif" }}>
        <div style={{ fontSize: "40px" }}>🏡</div>
        <p style={{ fontSize: "14px", color: "#b8956a", fontStyle: "italic" }}>Loading your home...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, saveAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);