// src/pages/ResetPassword.jsx

import { useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { resetPassword } from "../api/auth.js";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const email    = location.state?.email || "";

  const [otp, setOtp]             = useState(["", "", "", "", "", ""]);
  const [newPassword, setNew]     = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showNew, setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]         = useState(null);
  const [success, setSuccess]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const inputRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const code = otp.join("");
    if (code.length < 6)         return setError("Please enter all 6 digits.");
    if (!newPassword)             return setError("Please enter a new password.");
    if (newPassword.length < 6)  return setError("Password must be at least 6 characters.");
    if (newPassword !== confirm)  return setError("Passwords don't match.");

    setLoading(true);
    try {
      await resetPassword({ email, otp: code, newPassword });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || "Reset failed. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={styles.page}>
        <div style={styles.blob1} /><div style={styles.blob2} />
        <div style={styles.card}>
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: "52px", marginBottom: "16px" }}>🎉</div>
            <h1 style={{ fontSize: "20px", fontWeight: "700", color: "#3d2b1f", marginBottom: "10px" }}>Password reset!</h1>
            <p style={{ fontSize: "13px", color: "#b8956a", fontStyle: "italic", lineHeight: "1.7", marginBottom: "24px" }}>
              Your password has been updated. You can now sign in with your new password.
            </p>
            <button onClick={() => navigate("/login")}
              style={{ background: "#ff6b6b", color: "#fff", border: "none", borderRadius: "20px", padding: "11px 24px", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "'Georgia', serif", width: "100%" }}>
              Sign in now →
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.blob1} /><div style={styles.blob2} />
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <div style={styles.logoBadge}>🏡</div>
          <div><div style={styles.logoName}>HomeTrack</div><div style={styles.logoSub}>your little home helper</div></div>
        </div>

        <h1 style={styles.heading}>Reset your password 🔑</h1>
        <p style={styles.sub}>Enter the 6-digit code we sent{email ? ` to ${email}` : ""} and choose a new password.</p>

        {error && <div style={alertStyle("error")}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* OTP boxes */}
          <p style={{ fontSize: "12px", fontWeight: "700", color: "#8b7355", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px", fontFamily: "system-ui, sans-serif" }}>
            Reset code
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "20px" }} onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input key={index} ref={(el) => (inputRefs.current[index] = el)}
                type="text" inputMode="numeric" maxLength={1} value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                style={{ width: "44px", height: "52px", textAlign: "center", fontSize: "20px", fontWeight: "700", color: "#3d2b1f", border: `2px solid ${digit ? "#ff6b6b" : "#f5e6c8"}`, borderRadius: "12px", outline: "none", background: digit ? "#fff0f0" : "#fff", fontFamily: "system-ui, sans-serif", transition: "border-color 0.2s" }}
              />
            ))}
          </div>

          {/* New password */}
          <div style={{ marginBottom: "14px" }}>
            <label style={styles.label}>New password</label>
            <div style={{ position: "relative" }}>
              <input style={{ ...styles.input, paddingRight: "44px" }} type={showNew ? "text" : "password"}
                value={newPassword} onChange={(e) => setNew(e.target.value)} placeholder="at least 6 characters" />
              <button type="button" onClick={() => setShowNew((s) => !s)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#b8956a" }}>
                {showNew ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div style={{ marginBottom: "20px" }}>
            <label style={styles.label}>Confirm new password</label>
            <div style={{ position: "relative" }}>
              <input style={{ ...styles.input, paddingRight: "44px" }} type={showConfirm ? "text" : "password"}
                value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="same password again" />
              <button type="button" onClick={() => setShowConfirm((s) => !s)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#b8956a" }}>
                {showConfirm ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Resetting... 🌿" : "Reset password →"}
          </button>
        </form>

        <p style={styles.footer}>
          <Link to="/forgot-password" style={styles.link}>Request a new code →</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#fdf6e3", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden", fontFamily: "'Georgia', serif" },
  blob1: { position: "absolute", width: "280px", height: "280px", background: "#f0fff4", borderRadius: "55% 45% 60% 40%/40% 60% 40% 60%", top: "-70px", right: "-70px", zIndex: 0 },
  blob2: { position: "absolute", width: "260px", height: "260px", background: "#f0f4ff", borderRadius: "40% 60% 45% 55%/60% 40% 60% 40%", bottom: "-60px", left: "-60px", zIndex: 0 },
  card: { background: "#fff9f0", border: "2px solid #f5e6c8", borderRadius: "28px", padding: "40px 36px", width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 },
  logoWrap: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" },
  logoBadge: { width: "40px", height: "40px", background: "#ff6b6b", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", border: "2px solid #ffaaaa" },
  logoName: { fontSize: "18px", fontWeight: "700", color: "#3d2b1f" },
  logoSub: { fontSize: "11px", color: "#b8956a", fontStyle: "italic" },
  heading: { fontSize: "22px", fontWeight: "700", color: "#3d2b1f", marginBottom: "8px" },
  sub: { fontSize: "13px", color: "#b8956a", fontStyle: "italic", lineHeight: "1.7", marginBottom: "20px" },
  label: { fontSize: "12px", fontWeight: "700", color: "#8b7355", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "system-ui, sans-serif", display: "block", marginBottom: "6px" },
  input: { padding: "10px 14px", border: "2px solid #f5e6c8", borderRadius: "12px", fontSize: "14px", background: "#fff", color: "#3d2b1f", outline: "none", fontFamily: "'Georgia', serif", width: "100%" },
  button: { width: "100%", padding: "12px", background: "#ff6b6b", color: "#fff", border: "none", borderRadius: "20px", fontSize: "15px", fontWeight: "700", cursor: "pointer", fontFamily: "'Georgia', serif" },
  footer: { marginTop: "16px", textAlign: "center", fontSize: "13px", color: "#b8956a", fontStyle: "italic" },
  link: { color: "#e05c5c", textDecoration: "none", fontWeight: "600" },
};

const alertStyle = (type) => ({
  background: "#fff0f0", border: "1.5px solid #ffb3b3",
  borderRadius: "12px", padding: "10px 14px", fontSize: "13px",
  color: "#b91c1c", marginBottom: "16px", fontFamily: "system-ui, sans-serif",
});