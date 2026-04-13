import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { saveAuth } = useAuth();
  const navigate     = useNavigate();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.email.trim())  return setError("Please enter your email.");
    if (!form.password)      return setError("Please enter your password.");

    setLoading(true);
    try {
      const res = await login(form);
      // Save token and user to context + localStorage
      saveAuth(res.data.token, res.data.user);
      // Redirect to dashboard
      navigate("/");
    } catch (err) {
       const data = err.response?.data;
  // If account needs verification, redirect to OTP page
  if (data?.requiresVerification) {
    navigate("/verify-otp", { state: { email: form.email } });
    return;
  }
  setError(data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      {/* Background decoration blobs */}
      <div style={styles.blob1}></div>
      <div style={styles.blob2}></div>

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoBadge}>🏡</div>
          <div>
            <div style={styles.logoName}>HomeTrack</div>
            <div style={styles.logoSub}>your little home helper</div>
          </div>
        </div>

        <h1 style={styles.heading}>Welcome back! 👋</h1>
        <p style={styles.sub}>Sign in to your home dashboard.</p>

        {error && <p style={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
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
        <div style={{ position: "relative" }}>
          <input
            style={{ ...styles.input, paddingRight: "44px" }}
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            autoComplete="current-password"
          />
          <div style={{ textAlign: "right", marginTop: "-8px" }}>
          <Link to="/forgot-password" style={{ fontSize: "12px", color: "#e05c5c", fontStyle: "italic" }}>
            Forgot password?
          </Link>
        </div>
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#b8956a", padding: "0", lineHeight: 1 }}
          >
            {showPassword ? "🙈" : "👁"}
          </button>
          
        </div>
      </div>

          <button
            type="submit"
            style={styles.button}
            disabled={loading}
          >
            {loading ? "Signing in... 🌿" : "Sign in 🏡"}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{" "}
          <Link to="/register" style={styles.link}>
            Create one here →
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
  // Decorative blobs in the background
  blob1: {
    position: "absolute",
    width: "300px",
    height: "300px",
    background: "#ffecec",
    borderRadius: "60% 40% 55% 45% / 45% 55% 45% 55%",
    top: "-80px",
    right: "-80px",
    zIndex: 0,
  },
  blob2: {
    position: "absolute",
    width: "250px",
    height: "250px",
    background: "#f0fff4",
    borderRadius: "45% 55% 40% 60% / 55% 45% 55% 45%",
    bottom: "-60px",
    left: "-60px",
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
  logoWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "28px",
  },
  logoBadge: {
    width: "40px",
    height: "40px",
    background: "#ff6b6b",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    border: "2px solid #ffaaaa",
  },
  logoName: {
    fontSize: "18px",
    fontWeight: "700",
    color: "#3d2b1f",
  },
  logoSub: {
    fontSize: "11px",
    color: "#b8956a",
    fontStyle: "italic",
    marginTop: "1px",
  },
  heading: {
    fontSize: "22px",
    fontWeight: "700",
    color: "#3d2b1f",
    marginBottom: "6px",
  },
  sub: {
    fontSize: "13px",
    color: "#b8956a",
    fontStyle: "italic",
    marginBottom: "24px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#8b7355",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    fontFamily: "system-ui, sans-serif",
  },
  input: {
    padding: "10px 14px",
    border: "2px solid #f5e6c8",
    borderRadius: "12px",
    fontSize: "14px",
    background: "#fff",
    color: "#3d2b1f",
    outline: "none",
    fontFamily: "'Georgia', serif",
    transition: "border-color 0.2s",
  },
  button: {
    marginTop: "8px",
    padding: "12px",
    background: "#ff6b6b",
    color: "#fff",
    border: "none",
    borderRadius: "20px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    fontFamily: "'Georgia', serif",
    letterSpacing: "0.01em",
  },
  footer: {
    marginTop: "20px",
    textAlign: "center",
    fontSize: "13px",
    color: "#b8956a",
    fontStyle: "italic",
  },
  link: {
    color: "#e05c5c",
    textDecoration: "none",
    fontWeight: "600",
  },
  error: {
    background: "#fff0f0",
    border: "1.5px solid #ffb3b3",
    borderRadius: "12px",
    padding: "10px 14px",
    fontSize: "13px",
    color: "#b91c1c",
    marginBottom: "8px",
    fontFamily: "system-ui, sans-serif",
  },
};