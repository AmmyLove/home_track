import VerifyOTP      from "./pages/VerifyOTP.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword  from "./pages/ResetPassword.jsx";
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, NavLink, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

import Dashboard   from "./pages/Dashboard.jsx";
import Items       from "./pages/items.jsx";
import Purchases   from "./pages/Purchases.jsx";
import Inventory   from "./pages/inventory.jsx";
import Recipes     from "./pages/Recipes.jsx";
import Consumption from "./pages/Consumption.jsx";
import Login       from "./pages/Login.jsx";
import Register    from "./pages/Register.jsx";
import About       from "./pages/About.jsx";
import Landing     from "./pages/Landing.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

// Nav items — Items moved to first position (Fix 5)
const NAV_ITEMS = [
  { path: "",            label: "Dashboard"   },
  { path: "items",       label: "Items"       },
  { path: "purchases",   label: "Purchases"   },
  { path: "inventory",   label: "Inventory"   },
  { path: "consumption", label: "Consumption" },
  { path: "recipes",     label: "Recipes"     },
  { path: "about",       label: "About"       },
];

export default function App() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  // Update isMobile on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
      if (window.innerWidth >= 900) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => {
      if (!e.target.closest("nav")) setMenuOpen(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, [menuOpen]);

  return (
    <BrowserRouter>
      {user && (
        <nav style={{ ...styles.nav, position: "relative" }}>
          {/* Brand */}
          <div style={styles.brand}>
            <div style={styles.brandBadge}>🏡</div>
            <div>
              <div style={styles.brandName}>HomeTrack</div>
              <div style={styles.brandSub}>your little home helper</div>
            </div>
          </div>

          {/* Desktop nav links */}
          {!isMobile && (
            <div style={styles.links}>
              {NAV_ITEMS.map(({ path, label }) => (
                <NavLink
                  key={path}
                  to={`/${path}`}
                  end={path === ""}
                  style={navStyle}
                >
                  {label}
                </NavLink>
              ))}
            </div>
          )}

          {/* Desktop greeting + sign out */}
          {!isMobile && (
            <div style={styles.navRight}>
              <span style={styles.greeting}>🌸 {user.name.split(" ")[0]}</span>
              <button onClick={logout} style={styles.signOutBtn}>Sign out</button>
            </div>
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen((o) => !o); }}
              style={styles.hamburger}
              aria-label="Toggle menu"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          )}

          {/* Mobile dropdown menu */}
          {isMobile && menuOpen && (
            <div style={styles.mobileMenu}>
              {NAV_ITEMS.map(({ path, label }) => (
                <NavLink
                  key={path}
                  to={`/${path}`}
                  end={path === ""}
                  style={mobileNavStyle}
                  onClick={() => setMenuOpen(false)}
                >
                  {label}
                </NavLink>
              ))}
              <div style={{ borderTop: `2px dashed #f5e6c8`, marginTop: "8px", paddingTop: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "13px", color: "#b8956a", fontStyle: "italic" }}>🌸 {user.name.split(" ")[0]}</span>
                <button onClick={() => { logout(); setMenuOpen(false); }} style={styles.signOutBtn}>
                  Sign out
                </button>
              </div>
            </div>
          )}
        </nav>
      )}

      <main style={user ? styles.main : styles.mainFull}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={user ? <Dashboard /> : <Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/about"   element={<About />} />
          <Route path="/login"    element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
          <Route path="/verify-otp"      element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password"  element={<ResetPassword />} />

          {/* Protected routes */}
          <Route path="/items"       element={<ProtectedRoute><Items /></ProtectedRoute>} />
          <Route path="/purchases"   element={<ProtectedRoute><Purchases /></ProtectedRoute>} />
          <Route path="/inventory"   element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/recipes"     element={<ProtectedRoute><Recipes /></ProtectedRoute>} />
          <Route path="/consumption" element={<ProtectedRoute><Consumption /></ProtectedRoute>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

const navStyle = ({ isActive }) => ({
  textDecoration: "none",
  fontWeight: isActive ? "600" : "400",
  color: isActive ? "#fff" : "#8b6914",
  padding: "6px 10px",
  borderRadius: "20px",
  background: isActive ? "#ff6b6b" : "transparent",
  fontSize: "13px",
  fontFamily: "'Georgia', serif",
  whiteSpace: "nowrap",
});

const mobileNavStyle = ({ isActive }) => ({
  textDecoration: "none",
  display: "block",
  padding: "11px 14px",
  borderRadius: "12px",
  fontSize: "15px",
  fontFamily: "'Georgia', serif",
  fontWeight: isActive ? "700" : "400",
  color: isActive ? "#fff" : "#8b6914",
  background: isActive ? "#ff6b6b" : "transparent",
  marginBottom: "2px",
});

const styles = {
  nav: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    height: "62px",
    background: "#fff9f0",
    borderBottom: "2px solid #f5e6c8",
    fontFamily: "'Georgia', serif",
    zIndex: 200,
  },
  brand: { display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 },
  brandBadge: {
    width: "34px", height: "34px", background: "#ff6b6b",
    borderRadius: "50%", display: "flex", alignItems: "center",
    justifyContent: "center", fontSize: "17px",
    border: "2px solid #ffaaaa", flexShrink: 0,
  },
  brandName: { fontSize: "15px", fontWeight: "700", color: "#3d2b1f" },
  brandSub: { fontSize: "10px", color: "#b8956a", fontStyle: "italic", marginTop: "1px" },
  links: { display: "flex", gap: "2px", flexWrap: "nowrap", overflow: "hidden" },
  hamburger: {
    background: "none", border: "2px solid #f5e6c8",
    borderRadius: "10px", fontSize: "20px",
    color: "#3d2b1f", cursor: "pointer",
    padding: "4px 10px", fontFamily: "system-ui, sans-serif",
  },
  // Mobile dropdown — absolutely positioned below the navbar
  mobileMenu: {
    position: "absolute",
    top: "62px",
    left: 0,
    right: 0,
    background: "#fff9f0",
    borderBottom: "2px solid #f5e6c8",
    padding: "12px 16px 16px",
    zIndex: 999,
    boxShadow: "0 8px 24px rgba(61,43,31,0.10)",
  },
  navRight: { display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 },
  greeting: { fontSize: "13px", color: "#b8956a", fontStyle: "italic", whiteSpace: "nowrap" },
  signOutBtn: {
    background: "#3d2b1f", color: "#f5edd8",
    border: "none", borderRadius: "20px",
    padding: "6px 14px", fontSize: "12px",
    fontWeight: "600", cursor: "pointer",
    fontFamily: "'Georgia', serif", whiteSpace: "nowrap",
  },
  main: {
    padding: "24px 16px",
    maxWidth: "960px",
    margin: "0 auto",
  },
  mainFull: { padding: "0" },
};