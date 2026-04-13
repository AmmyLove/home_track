// src/pages/VerifyOTP.jsx

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOTP, resendOTP } from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function VerifyOTP() {
  const { saveAuth }    = useAuth();
  const navigate        = useNavigate();
  const location        = useLocation();

  // Email is passed via navigation state from Register/Login
  const email = location.state?.email || "";

  const [otp, setOtp]           = useState(["", "", "", "", "", ""]); // 6 boxes
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(0); // resend cooldown in seconds
  const inputRefs = useRef([]);

  // Redirect if no email was passed
  useEffect(() => {
    if (!email) navigate("/register");
  }, [email, navigate]);

  // Countdown timer for resend button
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Handle typing into each OTP box
  const handleOtpChange = (index, value) => {
    // Only allow single digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // only keep the last character
    setOtp(newOtp);

    // Auto-advance to next box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace — go back to previous box
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste — fill all 6 boxes at once
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => { newOtp[i] = char; });
    setOtp(newOtp);
    // Focus the last filled box
    const lastIndex = Math.min(pasted.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    const code = otp.join("");
    if (code.length < 6) return setError("Please enter all 6 digits.");
    setLoading(true);
    try {
      const res = await verifyOTP({ email, otp: code });
      saveAuth(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Verification failed. Please try again.");
      // Clear the boxes on wrong code
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      await resendOTP({ email });
      setSuccess("A new code has been sent to your email! 🌿");
      setCountdown(60); // 60 second cooldown before they can resend again
      setTimeout(() => setSuccess(null), 4000);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend code.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.blob1} />
      <div style={styles.blob2} />

      <div style={styles.card}>
        {/* Logo */}
        <div style={styles.logoWrap}>
          <div style={styles.logoBadge}>🏡</div>
          <div>
            <div style={styles.logoName}>HomeTrack</div>
            <div style={styles.logoSub}>your little home helper</div>
          </div>
        </div>

        <h1 style={styles.heading}>Check your email 📬</h1>
        <p style={styles.sub}>
          We sent a 6-digit code to <strong style={{ color: "#3d2b1f" }}>{email}</strong>.
          Enter it below to verify your account.
        </p>

        {error   && <div style={alertStyle("error")}>{error}</div>}
        {success && <div style={alertStyle("success")}>{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* 6 OTP input boxes */}
          <div style={styles.otpRow} onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                style={{
                  ...styles.otpBox,
                  borderColor: digit ? "#ff6b6b" : "#f5e6c8",
                  background: digit ? "#fff0f0" : "#fff",
                }}
              />
            ))}
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Verifying... 🌿" : "Verify email 🏡"}
          </button>
        </form>

        {/* Resend section */}
        <div style={styles.resendWrap}>
          <p style={styles.resendText}>Didn't receive a code?</p>
          {countdown > 0 ? (
            <p style={{ fontSize: "13px", color: "#b8956a", fontStyle: "italic" }}>
              Resend in {countdown}s
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              style={styles.resendBtn}
            >
              {resending ? "Sending..." : "Resend code →"}
            </button>
          )}
        </div>

        <p style={styles.footer}>
          Wrong email?{" "}
          <span
            onClick={() => navigate("/register")}
            style={styles.link}
          >
            Go back →
          </span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#fdf6e3", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", position: "relative", overflow: "hidden", fontFamily: "'Georgia', serif" },
  blob1: { position: "absolute", width: "300px", height: "300px", background: "#ffecec", borderRadius: "60% 40% 55% 45%/45% 55% 45% 55%", top: "-80px", right: "-80px", zIndex: 0 },
  blob2: { position: "absolute", width: "250px", height: "250px", background: "#f0f4ff", borderRadius: "45% 55% 40% 60%/55% 45% 55% 45%", bottom: "-60px", left: "-60px", zIndex: 0 },
  card: { background: "#fff9f0", border: "2px solid #f5e6c8", borderRadius: "28px", padding: "40px 36px", width: "100%", maxWidth: "420px", position: "relative", zIndex: 1 },
  logoWrap: { display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" },
  logoBadge: { width: "40px", height: "40px", background: "#ff6b6b", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", border: "2px solid #ffaaaa" },
  logoName: { fontSize: "18px", fontWeight: "700", color: "#3d2b1f" },
  logoSub: { fontSize: "11px", color: "#b8956a", fontStyle: "italic", marginTop: "1px" },
  heading: { fontSize: "22px", fontWeight: "700", color: "#3d2b1f", marginBottom: "8px" },
  sub: { fontSize: "13px", color: "#b8956a", fontStyle: "italic", lineHeight: "1.7", marginBottom: "24px" },
  otpRow: { display: "flex", gap: "10px", justifyContent: "center", marginBottom: "24px" },
  otpBox: { width: "46px", height: "54px", textAlign: "center", fontSize: "22px", fontWeight: "700", color: "#3d2b1f", border: "2px solid #f5e6c8", borderRadius: "14px", outline: "none", fontFamily: "system-ui, sans-serif", transition: "border-color 0.2s, background 0.2s" },
  button: { width: "100%", padding: "12px", background: "#ff6b6b", color: "#fff", border: "none", borderRadius: "20px", fontSize: "15px", fontWeight: "700", cursor: "pointer", fontFamily: "'Georgia', serif" },
  resendWrap: { marginTop: "20px", textAlign: "center" },
  resendText: { fontSize: "13px", color: "#b8956a", fontStyle: "italic", marginBottom: "6px" },
  resendBtn: { background: "none", border: "none", color: "#e05c5c", fontSize: "13px", fontWeight: "600", cursor: "pointer", fontFamily: "'Georgia', serif", textDecoration: "underline" },
  footer: { marginTop: "16px", textAlign: "center", fontSize: "13px", color: "#b8956a", fontStyle: "italic" },
  link: { color: "#e05c5c", fontWeight: "600", cursor: "pointer" },
};

const alertStyle = (type) => ({
  background: type === "error" ? "#fff0f0" : "#f0fdf4",
  border: `1.5px solid ${type === "error" ? "#ffb3b3" : "#b3f0c9"}`,
  borderRadius: "12px", padding: "10px 14px", fontSize: "13px",
  color: type === "error" ? "#b91c1c" : "#166534",
  marginBottom: "16px", fontFamily: "system-ui, sans-serif",
});