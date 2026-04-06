// src/App.jsx

import { useState } from "react";
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
import About from "./pages/About.jsx";


export default function App() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <BrowserRouter>
      {user && (
        <nav style={styles.nav}>
          {/* Brand */}
          <div style={styles.brand}>
            <div style={styles.brandBadge}>🏡</div>
            <div>
              <div style={styles.brandName}>HomeTrack</div>
              <div style={styles.brandSub}>your little home helper</div>
            </div>
          </div>

          {/* Hamburger — shown on mobile via CSS class */}
          <button
            className="hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
            style={styles.hamburger}
          >
            {menuOpen ? "✕" : "☰"}
          </button>

          {/* Nav links */}
          <div
            className="nav-links-desktop"
            style={{
              ...styles.links,
              // Mobile: drop down vertically when menuOpen
              ...(menuOpen && {
                display: "flex",
                flexDirection: "column",
                position: "absolute",
                top: "62px",
                left: 0,
                right: 0,
                background: "#fff9f0",
                borderBottom: "2px solid #f5e6c8",
                padding: "12px 16px",
                gap: "4px",
                zIndex: 100,
              }),
            }}
          >
            {["", "purchases", "inventory", "consumption", "recipes", "items", "about"].map((path) => (
              <NavLink
                key={path}
                to={`/${path}`}
                end={path === ""}
                style={navStyle}
                onClick={() => setMenuOpen(false)}
              >
                {path === "" ? "Dashboard" : path.charAt(0).toUpperCase() + path.slice(1)}
              </NavLink>
            ))}
          </div>

          {/* Greeting + sign out */}
          <div className="nav-greeting" style={styles.navRight}>
            <span style={styles.greeting}>🌸 {user.name.split(" ")[0]}</span>
            <button onClick={logout} style={styles.signOutBtn}>Sign out</button>
          </div>
        </nav>
      )}

      <main style={user ? styles.main : styles.mainFull}>
        <Routes>
          <Route path="/login"    element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />

          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/items" element={<ProtectedRoute><Items /></ProtectedRoute>} />
          <Route path="/purchases" element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/recipes" element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
          <Route path="/consumption" element={<ProtectedRoute><Consumption /></ProtectedRoute>} />
          <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
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
    position: "relative", // needed for the mobile dropdown to position correctly
  },
  brand: { display: "flex", alignItems: "center", gap: "10px" },
  brandBadge: {
    width: "34px", height: "34px", background: "#ff6b6b",
    borderRadius: "50%", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "17px",
    border: "2px solid #ffaaaa", flexShrink: 0,
  },
  brandName: { fontSize: "16px", fontWeight: "700", color: "#3d2b1f" },
  brandSub: { fontSize: "10px", color: "#b8956a", fontStyle: "italic", marginTop: "1px" },
  links: { display: "flex", gap: "2px" },
  hamburger: {
    display: "none", // shown via CSS class on mobile
    background: "none", border: "none",
    fontSize: "22px", color: "#3d2b1f",
    cursor: "pointer", padding: "4px 8px",
  },
  navRight: { display: "flex", alignItems: "center", gap: "12px" },
  greeting: { fontSize: "13px", color: "#b8956a", fontStyle: "italic" },
  signOutBtn: {
    background: "#3d2b1f", color: "#f5edd8",
    border: "none", borderRadius: "20px",
    padding: "6px 15px", fontSize: "12px",
    fontWeight: "600", cursor: "pointer",
    fontFamily: "'Georgia', serif",
  },
  main: { padding: "32px", maxWidth: "960px", margin: "0 auto" },
  mainFull: { padding: "0" },
};