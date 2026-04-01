// src/components/ProtectedRoute.jsx

import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

// Wrap any page with this to require login
// If user is not logged in → redirect to /login
// If auth is still loading → show nothing (avoids a flash)
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loading}>
        <span style={styles.spinner}>🏡</span>
        <p style={styles.text}>Loading your home...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

const styles = {
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    background: "#fdf6e3",
    gap: "12px",
  },
  spinner: { fontSize: "40px" },
  text: {
    fontFamily: "'Georgia', serif",
    fontSize: "14px",
    color: "#b8956a",
    fontStyle: "italic",
  },
};