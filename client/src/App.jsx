// src/App.jsx

import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

import Dashboard    from "./pages/Dashboard.jsx";
import Items        from "./pages/Items.jsx";
import Purchases    from "./pages/Purchases.jsx";
import Inventory    from "./pages/Inventory.jsx";
import Recipes      from "./pages/Recipes.jsx";
import Consumption  from "./pages/Consumption.jsx";
import Login        from "./pages/Login.jsx";
import Register     from "./pages/Register.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

export default function App() {
  const { user, logout } = useAuth();

  return (
    <BrowserRouter>
      {/* Only show the navbar when the user is logged in */}
      {user && (
        <nav style={styles.nav}>
          <div style={styles.brand}>
            <div style={styles.brandBadge}>🏡</div>
            <div>
              <div style={styles.brandName}>HomeTrack</div>
              <div style={styles.brandSub}>your little home helper</div>
            </div>
          </div>

          <div style={styles.links}>
            <NavLink to="/"            style={navStyle} end>Dashboard</NavLink>
            <NavLink to="/purchases"   style={navStyle}>Purchases</NavLink>
            <NavLink to="/inventory"   style={navStyle}>Inventory</NavLink>
            <NavLink to="/consumption" style={navStyle}>Consumption</NavLink>
            <NavLink to="/recipes"     style={navStyle}>Recipes</NavLink>
            <NavLink to="/items"       style={navStyle}>Items</NavLink>
          </div>

          <div style={styles.navRight}>
            {/* Greeting + sign out */}
            <span style={styles.greeting}>🌸 {user.name}</span>
            <button onClick={logout} style={styles.signOutBtn}>
              Sign out
            </button>
          </div>
        </nav>
      )}

      <main style={user ? styles.main : styles.mainFull}>
        <Routes>
          {/* Public routes — accessible without login */}
          <Route path="/login"    element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

          {/* Protected routes — redirect to /login if not logged in */}
          <Route path="/" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          }/>
          <Route path="/items" element={
            <ProtectedRoute><Items /></ProtectedRoute>
          }/>
          <Route path="/purchases" element={
            <ProtectedRoute><Purchases /></ProtectedRoute>
          }/>
          <Route path="/inventory" element={
            <ProtectedRoute><Inventory /></ProtectedRoute>
          }/>
          <Route path="/recipes" element={
            <ProtectedRoute><Recipes /></ProtectedRoute>
          }/>
          <Route path="/consumption" element={
            <ProtectedRoute><Consumption /></ProtectedRoute>
          }/>
        </Routes>
      </main>
    </BrowserRouter>
  );
}

const navStyle = ({ isActive }) => ({
  textDecoration: "none",
  fontWeight: isActive ? "600" : "400",
  color: isActive ? "#fff" : "#8b6914",
  padding: "6px 12px",
  borderRadius: "20px",
  background: isActive ? "#ff6b6b" : "transparent",
  border: "1.5px solid transparent",
  fontSize: "13px",
  fontFamily: "'Georgia', serif",
  transition: "all 0.15s",
});

const styles = {
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    height: "62px",
    background: "#fff9f0",
    borderBottom: "2px solid #f5e6c8",
    fontFamily: "'Georgia', serif",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  brandBadge: {
    width: "34px",
    height: "34px",
    background: "#ff6b6b",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "17px",
    border: "2px solid #ffaaaa",
    flexShrink: 0,
  },
  brandName: {
    fontSize: "16px",
    fontWeight: "700",
    color: "#3d2b1f",
  },
  brandSub: {
    fontSize: "10px",
    color: "#b8956a",
    fontStyle: "italic",
    marginTop: "1px",
  },
  links: {
    display: "flex",
    gap: "2px",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  greeting: {
    fontSize: "13px",
    color: "#b8956a",
    fontStyle: "italic",
  },
  signOutBtn: {
    background: "#3d2b1f",
    color: "#f5edd8",
    border: "none",
    borderRadius: "20px",
    padding: "6px 15px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
  },
  main: {
    padding: "32px",
    maxWidth: "960px",
    margin: "0 auto",
  },
  // No padding when showing login/register — they handle their own layout
  mainFull: {
    padding: "0",
  },
};