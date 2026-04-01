import { useState, useEffect } from "react";
import { getItems } from "../api/items.js";
import { getPurchases, createPurchase } from "../api/purchases.js";
import { formatMoney, currencySymbol, CURRENCIES } from "../utils/format.js";

export default function Purchases() {
  const [items, setItems] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [form, setForm] = useState({
    itemId: "",
    quantity: "",
    price: "",
    currency: "NGN",
    purchasedAt: "", // ← for backdating
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [lastAlert, setLastAlert] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getItems().then((res) => setItems(res.data)).catch(() => setError("Failed to load items."));
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try {
      const res = await getPurchases();
      setPurchases(res.data);
    } catch (err) {
      setError("Failed to load purchases.");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const selectedCurrency = CURRENCIES.find((c) => c.code === form.currency);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLastAlert(null);

    if (!form.itemId) return setError("Please select an item.");
    if (!form.quantity || form.quantity <= 0) return setError("Quantity must be greater than 0.");
    if (!form.price || form.price <= 0) return setError("Price must be greater than 0.");

    setLoading(true);
    try {
      const res = await createPurchase({
        itemId: form.itemId,
        quantity: parseFloat(form.quantity),
        price: parseFloat(form.price),
        currency: form.currency,
        purchasedAt: form.purchasedAt || null, // null = backend uses today
      });

      setSuccess("Purchase logged successfully!");
      if (res.data.alert) setLastAlert(res.data.alert);
      // reset purchasedAt too
      setForm({ itemId: "", quantity: "", price: "", currency: "NGN", purchasedAt: "" });
      fetchPurchases();
    } catch (err) {
      setError("Failed to log purchase.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });

  return (
    <div>
      <h1 style={styles.heading}>Purchases</h1>

      <div style={styles.card}>
        <h2 style={styles.subheading}>Log a Purchase</h2>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
        {lastAlert && <p style={styles.alert}>⚠️ {lastAlert}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Item *</label>
            <select style={styles.input} name="itemId" value={form.itemId} onChange={handleChange}>
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
            <div style={styles.field}>
              <label style={styles.label}>Quantity *</label>
              <input
                style={styles.input}
                name="quantity"
                type="number"
                min="0"
                step="any"
                value={form.quantity}
                onChange={handleChange}
                placeholder="e.g. 2"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Currency *</label>
              <select style={styles.input} name="currency" value={form.currency} onChange={handleChange}>
                {/* using CURRENCIES from utils instead of a local array */}
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.label}</option>
                ))}
              </select>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>
                Cost per unit ({selectedCurrency?.symbol}) *
              </label>
              <input
                style={styles.input}
                name="price"
                type="number"
                min="0"
                step="any"
                value={form.price}
                onChange={handleChange}
                placeholder="e.g. 500"
              />
            </div>
          </div>

          {/* live total now uses formatMoney */}
          {form.quantity && form.price && (
            <p style={styles.preview}>
              Total: {formatMoney(
                parseFloat(form.quantity) * parseFloat(form.price),
                form.currency
              )}
            </p>
          )}

          {/* date picker for backdating purchases */}
          <div style={styles.field}>
            <label style={styles.label}>Date of purchase</label>
            <input
              style={styles.input}
              name="purchasedAt"
              type="date"
              value={form.purchasedAt}
              onChange={handleChange}
              max={new Date().toISOString().split("T")[0]} // prevents future dates
            />
            <p style={styles.hint}>Leave blank to use today's date.</p>
          </div>

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? "Logging..." : "Log Purchase"}
          </button>
        </form>
      </div>

      {/* Purchase history table */}
      <div style={styles.card}>
        <h2 style={styles.subheading}>Purchase History ({purchases.length})</h2>
        {purchases.length === 0 ? (
          <p style={styles.muted}>No purchases logged yet.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {["Item", "Qty", "Cost/unit", "Total", "Date"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td style={styles.td}>{p.Item?.name ?? "—"}</td>
                  <td style={styles.td}>{p.quantity} {p.Item?.unit ?? ""}</td>
                  {/*using formatMoney for proper formatting */}
                  <td style={styles.td}>{formatMoney(p.price, p.currency)}</td>
                  <td style={styles.td}>{formatMoney(p.price * p.quantity, p.currency)}</td>
                  <td style={styles.td}>{formatDate(p.purchasedAt || p.createdAt)}</td>
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
  heading: { fontSize: "24px", fontWeight: "700", marginBottom: "24px", color: "#111827" },
  subheading: { fontSize: "16px", fontWeight: "600", marginBottom: "16px", color: "#374151" },
  card: { background: "#fff", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "24px", marginBottom: "24px" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  row: { display: "flex", gap: "16px", flexWrap: "wrap" },
  field: { display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "180px" },
  label: { fontSize: "13px", fontWeight: "500", color: "#374151" },
  input: { padding: "8px 12px", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", outline: "none" },
  button: { alignSelf: "flex-start", padding: "10px 24px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  preview: { fontSize: "15px", fontWeight: "600", color: "#4f46e5", margin: "0" },
  hint: { fontSize: "12px", color: "#9ca3af", margin: "4px 0 0" },
  error: { color: "#dc2626", fontSize: "14px", background: "#fef2f2", padding: "10px 14px", borderRadius: "8px", marginBottom: "12px" },
  success: { color: "#16a34a", fontSize: "14px", background: "#f0fdf4", padding: "10px 14px", borderRadius: "8px", marginBottom: "12px" },
  alert: { color: "#92400e", fontSize: "14px", background: "#fffbeb", border: "1px solid #fcd34d", padding: "10px 14px", borderRadius: "8px", marginBottom: "12px" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 12px", fontSize: "13px", fontWeight: "600", color: "#6b7280", borderBottom: "1px solid #e5e7eb" },
  td: { padding: "12px", fontSize: "14px", color: "#111827", borderBottom: "1px solid #f3f4f6" },
  muted: { color: "#9ca3af", fontSize: "14px" },
};