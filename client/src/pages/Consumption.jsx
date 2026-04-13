import { useState, useEffect } from "react";
import { getItems } from "../api/items.js";
import { getConsumptions, logConsumption, getUsageInsights } from "../api/consumption.js";
import { useAutoFade } from "../hooks/useAutoFade.js";

const C = { cardBg: "#fff9f0", border: "#f5e6c8", coral: "#ff6b6b", brown: "#3d2b1f", tan: "#b8956a", muted: "#8b7355" };
const inputStyle = { padding: "9px 13px", border: `2px solid #f5e6c8`, borderRadius: "12px", fontSize: "14px", background: "#fff", color: "#3d2b1f", outline: "none", fontFamily: "Georgia, serif", width: "100%" };
const Label = ({ children }) => <label style={{ fontSize: "11px", fontWeight: "700", color: "#8b7355", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px", display: "block", fontFamily: "system-ui, sans-serif" }}>{children}</label>;

export default function Consumption() {
  const [items, setItems]           = useState([]);
  const [consumptions, setConsumptions] = useState([]);
  const [insights, setInsights]     = useState([]);
  const [form, setForm]             = useState({ itemId: "", quantity: "", note: "", consumedAt: "" });
  const [error, setError]           = useState(null);
  const [success, setSuccess]       = useState(null);
  const [lastAlert, setLastAlert]   = useState(null);
  const [loading, setLoading]       = useState(false);

  useAutoFade(success, setSuccess);
  useAutoFade(error, setError, 6000); 

  useEffect(() => {
    getItems().then((r) => setItems(r.data)).catch(() => {});
    fetchConsumptions();
    fetchInsights();
  }, []);

  const fetchConsumptions = async () => {
    try { const r = await getConsumptions(); setConsumptions(r.data); }
    catch {}
  };

  const fetchInsights = async () => {
    try { const r = await getUsageInsights(); setInsights(r.data); }
    catch {}
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setSuccess(null); setLastAlert(null);
    if (!form.itemId)              return setError("Please select an item.");
    if (!form.quantity || form.quantity <= 0) return setError("Quantity must be greater than 0.");
    setLoading(true);
    try {
      const r = await logConsumption({ itemId: form.itemId, quantity: parseFloat(form.quantity), note: form.note || null, consumedAt: form.consumedAt || null });
      setSuccess("Usage logged! 🌿");
      if (r.data.alert) setLastAlert(r.data.alert);
      setForm({ itemId: form.itemId, quantity: "", note: "", consumedAt: "" });
      fetchConsumptions();
      fetchInsights();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to log usage.");
    } finally { setLoading(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={{ fontFamily: "Georgia, serif" }}>
      <h1 style={{ fontSize: "clamp(20px, 4vw, 24px)", fontWeight: "700", color: C.brown, marginBottom: "6px" }}>Consumption 🔥</h1>
      <p style={{ fontSize: "13px", color: C.tan, fontStyle: "italic", marginBottom: "24px" }}>
        Log what you use at home. The more you log, the smarter the app gets about predicting when you'll run out.
      </p>

      {error     && <div style={alertStyle("error")}>{error}</div>}
      {success   && <div style={alertStyle("success")}>{success}</div>}
      {lastAlert && <div style={alertStyle("warn")}>⚠️ {lastAlert}</div>}

      {/* Log form */}
      <div style={{ background: C.cardBg, border: `2px solid ${C.border}`, borderRadius: "24px", padding: "22px", marginBottom: "20px" }}>
        <p style={{ fontSize: "14px", fontWeight: "700", color: C.brown, marginBottom: "16px" }}>✨ Log usage</p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <Label>Item *</Label>
            <select style={inputStyle} name="itemId" value={form.itemId} onChange={handleChange}>
              <option value="">Select an item</option>
              {items.map((item) => <option key={item.id} value={item.id}>{item.name} {item.unit ? `(${item.unit})` : ""}</option>)}
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px", marginBottom: "14px" }}>
            <div>
              <Label>Quantity used *</Label>
              <input style={inputStyle} name="quantity" type="number" min="0" step="any" value={form.quantity} onChange={handleChange} placeholder="e.g. 0.5" />
            </div>
            <div>
              <Label>Date used</Label>
              <input style={inputStyle} name="consumedAt" type="date" value={form.consumedAt} onChange={handleChange} max={new Date().toISOString().split("T")[0]} />
            </div>
          </div>
          <div style={{ marginBottom: "14px" }}>
            <Label>Note (optional)</Label>
            <input style={inputStyle} name="note" value={form.note} onChange={handleChange} placeholder="e.g. Used for jollof rice" />
          </div>
          <button type="submit" style={{ background: C.coral, color: "#fff", border: "none", borderRadius: "20px", padding: "10px 24px", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "Georgia, serif" }} disabled={loading}>
            {loading ? "Logging... 🌿" : "Log usage 🔥"}
          </button>
        </form>
      </div>

      {/* Usage insights */}
      {insights.length > 0 && (
        <div style={{ background: C.cardBg, border: `2px solid ${C.border}`, borderRadius: "24px", padding: "22px", marginBottom: "20px" }}>
          <p style={{ fontSize: "14px", fontWeight: "700", color: C.brown, marginBottom: "6px" }}>🧠 Usage insights</p>
          <p style={{ fontSize: "12px", color: C.tan, fontStyle: "italic", marginBottom: "16px" }}>Based on your logs over the last 30 days.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "12px" }}>
            {insights.map((ins) => (
              <div key={ins.itemId} style={{ background: ins.needsRestockSoon ? "#fffbeb" : "#fdf6e3", border: `2px solid ${ins.needsRestockSoon ? "#fcd34d" : C.border}`, borderRadius: "18px", padding: "14px" }}>
                <p style={{ fontSize: "13px", fontWeight: "700", color: C.brown, marginBottom: "10px", fontFamily: "system-ui, sans-serif" }}>{ins.name}</p>
                <div style={{ fontSize: "11px", color: C.tan, display: "flex", justifyContent: "space-between", marginBottom: "4px", fontFamily: "system-ui, sans-serif" }}>
                  <span>Avg/day</span><span style={{ fontWeight: "600", color: C.brown }}>{ins.avgPerDay} {ins.unit ?? ""}</span>
                </div>
                <div style={{ fontSize: "11px", color: C.tan, display: "flex", justifyContent: "space-between", marginBottom: "4px", fontFamily: "system-ui, sans-serif" }}>
                  <span>In stock</span><span style={{ fontWeight: "600", color: C.brown }}>{ins.currentStock} {ins.unit ?? ""}</span>
                </div>
                <div style={{ fontSize: "11px", color: C.tan, display: "flex", justifyContent: "space-between", fontFamily: "system-ui, sans-serif" }}>
                  <span>Days left</span>
                  <span style={{ fontWeight: "700", color: ins.needsRestockSoon ? "#e05c5c" : "#2d8a4e" }}>
                    {ins.daysLeft !== null ? `~${ins.daysLeft}` : "?"}
                  </span>
                </div>
                {ins.needsRestockSoon && (
                  <div style={{ marginTop: "8px", background: "#fef3c7", border: "1.5px solid #fcd34d", borderRadius: "20px", padding: "2px 10px", fontSize: "10px", color: "#8b6914", fontWeight: "700", textAlign: "center", fontFamily: "system-ui, sans-serif" }}>
                    Restock soon ⚠️
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History */}
      <div style={{ background: C.cardBg, border: `2px solid ${C.border}`, borderRadius: "24px", padding: "22px" }}>
        <p style={{ fontSize: "14px", fontWeight: "700", color: C.brown, marginBottom: "16px" }}>📋 Usage history ({consumptions.length})</p>
        {consumptions.length === 0 ? (
          <p style={{ color: C.tan, fontStyle: "italic", fontSize: "13px" }}>No usage logged yet. Start logging above!</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "400px" }}>
              <thead>
                <tr>
                  {["Item", "Qty used", "Note", "Date"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `2px dashed ${C.border}`, fontFamily: "system-ui, sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {consumptions.map((c) => (
                  <tr key={c.id}>
                    <td style={tdStyle}>{c.Item?.name ?? "—"}</td>
                    <td style={tdStyle}>{c.quantity} {c.Item?.unit ?? ""}</td>
                    <td style={tdStyle}>{c.note ?? "—"}</td>
                    <td style={tdStyle}>{formatDate(c.consumedAt || c.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

const tdStyle = { padding: "11px 12px", fontSize: "13px", color: "#3d2b1f", borderBottom: "1.5px dotted #f5e6c8", fontFamily: "system-ui, sans-serif" };
const alertStyle = (type) => ({
  background: type === "error" ? "#fff0f0" : type === "warn" ? "#fffbeb" : "#f0fdf4",
  border: `1.5px solid ${type === "error" ? "#ffb3b3" : type === "warn" ? "#fcd34d" : "#b3f0c9"}`,
  borderRadius: "14px", padding: "11px 16px", fontSize: "13px",
  color: type === "error" ? "#b91c1c" : type === "warn" ? "#92400e" : "#166534",
  marginBottom: "16px", fontFamily: "system-ui, sans-serif",
});