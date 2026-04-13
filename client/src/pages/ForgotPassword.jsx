// src/pages/ForgotPassword.jsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { forgotPassword } from "../api/auth.js";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail]       = useState("");
  const [error, setError]       = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) return setError("Please enter your email.");
    setLoading(true);
    try {
      await forgotPassword({ email });
      // Always show success to avoid revealing if email exists
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={styles.page}>
        <div style={styles.blob1} />
        <div style={styles.blob2} />
        <div style={styles.card}>
          <div style={styles.logoWrap}>
            <div style={styles.logoBadge}>🏡</div>
            <div>
              <div style={styles.logoName}>HomeTrack</div>
              <div style={styles.logoSub}>your little home helper</div>
            </div>
          </div>
          <div style={{ textAlign: "center", padding: "8px 0" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>📬</div>
            <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#3d2b1f", marginBottom: "10px" }}>
              Check your email!
            </h1>
            <p style={{ fontSize: "13px", color: "#b8956a", fontStyle: "italic", lineHeight: "1.7", marginBottom: "24px" }}>
              If an account exists for <strong style={{ color: "#3d2b1f" }}>{email}</strong>, we've sent a password reset code. Check your inbox and spam folder.
            </p>
            <button
              onClick={() => navigate("/reset-password", { state: { email } })}
              style={{ background: "#ff6b6b", color: "#fff", border: "none", borderRadius: "20px", padding: "11px 24px", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "'Georgia', serif", width: "100%", marginBottom: "12px" }}
            >
              Enter reset code →
            </button>
            <Link to="/login" style={{ fontSize: "13px", color: "#e05c5c", fontStyle: "italic" }}>
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logoBadge}>🏡</div>
          <div>
            <div style={styles.logoName}>HomeTrack</div>
            <div style={styles.logoSub}>your little home helper</div>
          </div>
        </div>

        <h1 style={styles.heading}>Forgot your password? 🔑</h1>
        <p style={styles.sub}>
          No worries! Enter your email and we'll send you a reset code.
        </p>

        {error && <div style={alertStyle("error")}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              style={styles.input}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Sending... 🌿" : "Send reset code →"}
          </button>
        </form>

        <p style={styles.footer}>
          Remember your password?{" "}
          <Link to="/login" style={styles.link}>Sign in →</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#fdf6e3", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden", fontFamily: "'Georgia', serif" },
  blob1: { position: "absolute", width: "280px", height: "280px", background: "#f0f4ff", borderRadius: "55% 45% 60% 40%/40% 60% 40% 60%", top: "-70px", left: "-70px", zIndex: 0 },
  blob2: { position: "absolute", width: "260px", height: "260px", background: "#fff0f0", borderRadius: "40% 60% 45% 55%/60% 40% 60% 40%", bottom: "-60px", right: "-60px", zIndex: 0 },
  card: { background: "#fff9f0", border: "2px solid #f5e6c8", borderRadius: "28px", padding: "40px 36px", width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 },
  logoWrap: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" },
  logoBadge: { width: "40px", height: "40px", background: "#ff6b6b", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", border: "2px solid #ffaaaa" },
  logoName: { fontSize: "18px", fontWeight: "700", color: "#3d2b1f" },
  logoSub: { fontSize: "11px", color: "#b8956a", fontStyle: "italic", marginTop: "1px" },
  heading: { fontSize: "22px", fontWeight: "700", color: "#3d2b1f", marginBottom: "8px" },
  sub: { fontSize: "13px", color: "#b8956a", fontStyle: "italic", lineHeight: "1.7", marginBottom: "24px" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  field: { display: "flex", flexDirection: "column", gap: "6px" },
  label: { fontSize: "12px", fontWeight: "700", color: "#8b7355", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "system-ui, sans-serif" },
  input: { padding: "10px 14px", border: "2px solid #f5e6c8", borderRadius: "12px", fontSize: "14px", background: "#fff", color: "#3d2b1f", outline: "none", fontFamily: "'Georgia', serif" },
  button: { padding: "12px", background: "#ff6b6b", color: "#fff", border: "none", borderRadius: "20px", fontSize: "15px", fontWeight: "700", cursor: "pointer", fontFamily: "'Georgia', serif" },
  footer: { marginTop: "20px", textAlign: "center", fontSize: "13px", color: "#b8956a", fontStyle: "italic" },
  link: { color: "#e05c5c", textDecoration: "none", fontWeight: "600" },
};

const alertStyle = (type) => ({
  background: "#fff0f0", border: "1.5px solid #ffb3b3",
  borderRadius: "12px", padding: "10px 14px", fontSize: "13px",
  color: "#b91c1c", marginBottom: "16px", fontFamily: "system-ui, sans-serif",
});