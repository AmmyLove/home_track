// src/pages/Consumption.jsx

import { useState, useEffect } from "react";
import { getItems } from "../api/items.js";
import { getConsumptions, logConsumption, getUsageInsights } from "../api/consumption.js";

export default function Consumption() {
  const [items, setItems] = useState([]);
  const [consumptions, setConsumptions] = useState([]); // consumption history
  const [insights, setInsights] = useState([]);          // usage rate + days left per item

  const [form, setForm] = useState({
    itemId: "",
    quantity: "",
    note: "",
    consumedAt: "", // optional — defaults to today on the backend
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [lastAlert, setLastAlert] = useState(null); // restock alert after logging
  const [loading, setLoading] = useState(false);

  // Load everything when page opens
  useEffect(() => {
    getItems().then((res) => setItems(res.data)).catch(() => setError("Failed to load items."));
    fetchConsumptions();
    fetchInsights();
  }, []);

  const fetchConsumptions = async () => {
    try {
      const res = await getConsumptions();
      setConsumptions(res.data);
    } catch (err) {
      setError("Failed to load consumption history.");
    }
  };

  const fetchInsights = async () => {
    try {
      const res = await getUsageInsights();
      setInsights(res.data);
    } catch (err) {
      // Insights failing shouldn't block the whole page
      console.error("Failed to load insights:", err);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLastAlert(null);

    if (!form.itemId) return setError("Please select an item.");
    if (!form.quantity || form.quantity <= 0) return setError("Quantity must be greater than 0.");

    setLoading(true);
    try {
      const res = await logConsumption({
        itemId: form.itemId,
        quantity: parseFloat(form.quantity),
        note: form.note || null,
        consumedAt: form.consumedAt || null, // null = backend uses today
      });

      setSuccess("Consumption logged!");
      if (res.data.alert) setLastAlert(res.data.alert);

      // Reset form but keep the item selected — convenient for logging multiple uses
      setForm({ itemId: form.itemId, quantity: "", note: "", consumedAt: "" });

      // Refresh both history and insights
      fetchConsumptions();
      fetchInsights();
    } catch (err) {
      // Show the backend's error message if available (e.g. "not enough stock")
      setError(err.response?.data?.error || "Failed to log consumption.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });

  // ── Render ─────────────────────────────────────────────────────

  return (
    <div>
      <h1 style={styles.heading}>Consumption</h1>
      <p style={styles.intro}>
        Log when you use something at home. This helps the app learn how fast
        you go through each item and predict when you'll need to restock.
      </p>

      {error && <p style={styles.error}>{error}</p>}
      {success && <p style={styles.success}>{success}</p>}
      {lastAlert && <p style={styles.alert}>⚠️ {lastAlert}</p>}

      {/* ── Log consumption form ──────────────────────────────── */}
      <div style={styles.card}>
        <h2 style={styles.subheading}>Log Usage</h2>
        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Item selector */}
          <div style={styles.field}>
            <label style={styles.label}>Item *</label>
            <select
              style={styles.input}
              name="itemId"
              value={form.itemId}
              onChange={handleChange}
            >
              <option value="">Select an item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} {item.unit ? `(${item.unit})` : ""}
                </option>
              ))}
            </select>
            {items.length === 0 && (
              <p style={styles.hint}>No items yet — add some on the Items page first.</p>
            )}
          </div>

          <div style={styles.row}>
            {/* How much was used */}
            <div style={styles.field}>
              <label style={styles.label}>Quantity used *</label>
              <input
                style={styles.input}
                name="quantity"
                type="number"
                min="0"
                step="any"
                value={form.quantity}
                onChange={handleChange}
                placeholder="e.g. 0.5"
              />
            </div>

            {/* Optional date — for logging past usage */}
            <div style={styles.field}>
              <label style={styles.label}>Date used</label>
              <input
                style={styles.input}
                name="consumedAt"
                type="date"
                value={form.consumedAt}
                onChange={handleChange}
                max={new Date().toISOString().split("T")[0]} // can't log future usage
              />
              <p style={styles.hint}>Leave blank to use today.</p>
            </div>
          </div>

          {/* Optional note — what was it used for? */}
          <div style={styles.field}>
            <label style={styles.label}>Note (optional)</label>
            <input
              style={styles.input}
              name="note"
              value={form.note}
              onChange={handleChange}
              placeholder="e.g. Used for jollof rice"
            />
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Logging..." : "Log Usage"}
          </button>
        </form>
      </div>

      {/* ── Usage insights ────────────────────────────────────── */}
      {/* Only shows after enough consumption data has been logged */}
      {insights.length > 0 && (
        <div style={styles.card}>
          <h2 style={styles.subheading}>Usage Insights</h2>
          <p style={styles.muted}>
            Based on your consumption logs over the last 30 days.
          </p>

          <div style={styles.insightGrid}>
            {insights.map((insight) => (
              <div
                key={insight.itemId}
                // Highlight cards where stock is running low
                style={{
                  ...styles.insightCard,
                  borderColor: insight.needsRestockSoon ? "#fcd34d" : "#e5e7eb",
                  background: insight.needsRestockSoon ? "#fffbeb" : "#f9fafb",
                }}
              >
                <p style={styles.insightName}>{insight.name}</p>

                {/* How fast this item gets used */}
                <p style={styles.insightStat}>
                  <span style={styles.insightLabel}>Avg/day</span>
                  {insight.avgPerDay} {insight.unit ?? ""}
                </p>

                {/* Current stock */}
                <p style={styles.insightStat}>
                  <span style={styles.insightLabel}>In stock</span>
                  {insight.currentStock} {insight.unit ?? ""}
                </p>

                {/* Days until empty — null means no consumption logged yet */}
                <p style={styles.insightStat}>
                  <span style={styles.insightLabel}>Days left</span>
                  {insight.daysLeft !== null ? `~${insight.daysLeft} days` : "Unknown"}
                </p>

                {/* Warning badge if running out within 7 days */}
                {insight.needsRestockSoon && (
                  <span style={styles.warnBadge}>Restock soon</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Consumption history ───────────────────────────────── */}
      <div style={styles.card}>
        <h2 style={styles.subheading}>Usage History ({consumptions.length})</h2>
        {consumptions.length === 0 ? (
          <p style={styles.muted}>No usage logged yet. Log your first one above.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {["Item", "Qty used", "Note", "Date"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {consumptions.map((c) => (
                <tr key={c.id}>
                  <td style={styles.td}>{c.Item?.name ?? "—"}</td>
                  <td style={styles.td}>{c.quantity} {c.Item?.unit ?? ""}</td>
                  <td style={styles.td}>{c.note ?? "—"}</td>
                  <td style={styles.td}>{formatDate(c.consumedAt || c.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  heading: { fontSize: "24px", fontWeight: "700", marginBottom: "8px", color: "#111827" },
  intro: { fontSize: "14px", color: "#6b7280", marginBottom: "24px" },
  subheading: { fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#374151" },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px", marginBottom: "24px" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  row: { display: "flex", gap: "16px", flexWrap: "wrap" },
  field: { display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "180px" },
  label: { fontSize: "13px", fontWeight: "500", color: "#374151" },
  input: { padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none" },
  button: { alignSelf: "flex-start", padding: "10px 24px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  hint: { fontSize: "12px", color: "#9ca3af", margin: "4px 0 0" },
  error: { color: "#dc2626", fontSize: "14px", background: "#fef2f2", padding: "10px 14px", borderRadius: "8px", marginBottom: "12px" },
  success: { color: "#16a34a", fontSize: "14px", background: "#f0fdf4", padding: "10px 14px", borderRadius: "8px", marginBottom: "12px" },
  alert: { color: "#92400e", fontSize: "14px", background: "#fffbeb", border: "1px solid #fcd34d", padding: "10px 14px", borderRadius: "8px", marginBottom: "12px" },
  muted: { color: "#9ca3af", fontSize: "14px", marginBottom: "12px" },
  insightGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "16px" },
  insightCard: { border: "1px solid #e5e7eb", borderRadius: "10px", padding: "16px", transition: "border-color 0.2s" },
  insightName: { fontWeight: "600", fontSize: "14px", color: "#111827", margin: "0 0 12px" },
  insightStat: { display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#374151", margin: "6px 0" },
  insightLabel: { color: "#9ca3af", fontWeight: "500" },
  warnBadge: { display: "inline-block", marginTop: "10px", background: "#fef3c7", color: "#92400e", border: "1px solid #fcd34d", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 12px", fontSize: "13px", fontWeight: "600", color: "#6b7280", borderBottom: "1px solid #e5e7eb" },
  td: { padding: "12px", fontSize: "14px", color: "#111827", borderBottom: "1px solid #f3f4f6" },
};