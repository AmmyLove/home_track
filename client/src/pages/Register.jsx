// src/pages/Register.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Register() {
  const { saveAuth } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]       = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim())    return setError("Please enter your name.");
    if (!form.email.trim())   return setError("Please enter your email.");
    if (!form.password)       return setError("Please enter a password.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirm) return setError("Passwords don't match.");

    setLoading(true);
    try {
      const res = await register({
        name:     form.name,
        email:    form.email,
        password: form.password,
      });
      saveAuth(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logoBadge}>🏡</div>
          <div>
            <div style={styles.logoName}>HomeTrack</div>
            <div style={styles.logoSub}>your little home helper</div>
          </div>
        </div>

        <h1 style={styles.heading}>Create your home 🌸</h1>
        <p style={styles.sub}>Set up your account and start tracking.</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Your name</label>
            <input
              style={styles.input}
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Amarachi"
              autoComplete="name"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="at least 6 characters"
              autoComplete="new-password"
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Confirm password</label>
            <input
              style={styles.input}
              type="password"
              name="confirm"
              value={form.confirm}
              onChange={handleChange}
              placeholder="same password again"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? "Creating your home... 🌿" : "Create account 🏡"}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{" "}
          <Link to="/login" style={styles.link}>
            Sign in here →
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#fdf6e3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Georgia', serif",
  },
  blob1: {
    position: "absolute",
    width: "280px",
    height: "280px",
    background: "#f0f4ff",
    borderRadius: "55% 45% 60% 40% / 40% 60% 40% 60%",
    top: "-70px",
    left: "-70px",
    zIndex: 0,
  },
  blob2: {
    position: "absolute",
    width: "260px",
    height: "260px",
    background: "#fffdf0",
    borderRadius: "40% 60% 45% 55% / 60% 40% 60% 40%",
    bottom: "-60px",
    right: "-60px",
    zIndex: 0,
  },
  card: {
    background: "#fff9f0",
    border: "2px solid #f5e6c8",
    borderRadius: "28px",
    padding: "40px 36px",
    width: "100%",
    maxWidth: "420px",
    position: "relative",
    zIndex: 1,
  },
  logoWrap: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" },
  logoBadge: { width: "40px", height: "40px", background: "#ff6b6b", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", border: "2px solid #ffaaaa" },
  logoName: { fontSize: "18px", fontWeight: "700", color: "#3d2b1f" },
  logoSub: { fontSize: "11px", color: "#b8956a", fontStyle: "italic", marginTop: "1px" },
  heading: { fontSize: "22px", fontWeight: "700", color: "#3d2b1f", marginBottom: "6px" },
  sub: { fontSize: "13px", color: "#b8956a", fontStyle: "italic", marginBottom: "24px" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", fontWeight: "700", color: "#8b7355", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "system-ui, sans-serif" },
  input: { padding: "10px 14px", border: "2px solid #f5e6c8", borderRadius: "12px", fontSize: "14px", background: "#fff", color: "#3d2b1f", outline: "none", fontFamily: "'Georgia', serif" },
  button: { marginTop: "8px", padding: "12px", background: "#ff6b6b", color: "#fff", border: "none", borderRadius: "20px", fontSize: "15px", fontWeight: "700", cursor: "pointer", fontFamily: "'Georgia', serif" },
  footer: { marginTop: "20px", textAlign: "center", fontSize: "13px", color: "#b8956a", fontStyle: "italic" },
  link: { color: "#e05c5c", textDecoration: "none", fontWeight: "600" },
  error: { background: "#fff0f0", border: "1.5px solid #ffb3b3", borderRadius: "12px", padding: "10px 14px", fontSize: "13px", color: "#b91c1c", marginBottom: "8px", fontFamily: "system-ui, sans-serif" },
};