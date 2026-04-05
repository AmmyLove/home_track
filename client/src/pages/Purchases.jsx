import { useState, useEffect } from "react";
import { getItems } from "../api/items.js";
import { getPurchases, createPurchase } from "../api/purchases.js";
import { formatMoney, CURRENCIES } from "../utils/format.js";

const C = { cardBg: "#fff9f0", border: "#f5e6c8", coral: "#ff6b6b", brown: "#3d2b1f", tan: "#b8956a", muted: "#8b7355" };

const Card = ({ children, style = {} }) => (
  <div style={{ background: C.cardBg, border: `2px solid ${C.border}`, borderRadius: "24px", padding: "22px", marginBottom: "20px", ...style }}>
    {children}
  </div>
);

const Label = ({ children }) => (
  <label style={{ fontSize: "11px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "6px", display: "block", fontFamily: "system-ui, sans-serif" }}>
    {children}
  </label>
);

const inputStyle = { padding: "9px 13px", border: `2px solid ${C.border}`, borderRadius: "12px", fontSize: "14px", background: "#fff", color: C.brown, outline: "none", fontFamily: "Georgia, serif", width: "100%" };

export default function Purchases() {
  const [items, setItems]         = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [form, setForm]           = useState({ itemId: "", quantity: "", price: "", currency: "NGN", purchasedAt: "" });
  const [error, setError]         = useState(null);
  const [success, setSuccess]     = useState(null);
  const [lastAlert, setLastAlert] = useState(null);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    getItems().then((r) => setItems(r.data)).catch(() => {});
    fetchPurchases();
  }, []);

  const fetchPurchases = async () => {
    try { const r = await getPurchases(); setPurchases(r.data); }
    catch { setError("Failed to load purchases."); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const selectedCurrency = CURRENCIES.find((c) => c.code === form.currency);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setSuccess(null); setLastAlert(null);
    if (!form.itemId)              return setError("Please select an item.");
    if (!form.quantity || form.quantity <= 0) return setError("Quantity must be greater than 0.");
    if (!form.price    || form.price <= 0)    return setError("Price must be greater than 0.");
    setLoading(true);
    try {
      const r = await createPurchase({ itemId: form.itemId, quantity: parseFloat(form.quantity), price: parseFloat(form.price), currency: form.currency, purchasedAt: form.purchasedAt || null });
      setSuccess("Purchase logged! 🛒");
      if (r.data.alert) setLastAlert(r.data.alert);
      setForm({ itemId: form.itemId, quantity: "", price: "", currency: form.currency, purchasedAt: "" });
      fetchPurchases();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to log purchase.");
    } finally { setLoading(false); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div style={{ fontFamily: "Georgia, serif" }}>
      <h1 style={{ fontSize: "clamp(20px, 4vw, 24px)", fontWeight: "700", color: C.brown, marginBottom: "6px" }}>Purchases 🛒</h1>
      <p style={{ fontSize: "13px", color: C.tan, fontStyle: "italic", marginBottom: "24px" }}>Log what you buy and track your spending.</p>

      {error     && <div style={alertStyle("error")}>{error}</div>}
      {success   && <div style={alertStyle("success")}>{success}</div>}
      {lastAlert && <div style={alertStyle("warn")}>⚠️ {lastAlert}</div>}

      {/* Log form */}
      <Card>
        <p style={{ fontSize: "14px", fontWeight: "700", color: C.brown, marginBottom: "16px" }}>✨ Log a purchase</p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "14px" }}>
            <Label>Item *</Label>
            <select style={inputStyle} name="itemId" value={form.itemId} onChange={handleChange}>
              <option value="">Select an item</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>{item.name} {item.unit ? `(${item.unit})` : ""}</option>
              ))}
            </select>
            {items.length === 0 && <p style={{ fontSize: "11px", color: C.tan, fontStyle: "italic", marginTop: "4px" }}>No items yet — add some on the Items page first.</p>}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "14px", marginBottom: "14px" }}>
            <div>
              <Label>Quantity *</Label>
              <input style={inputStyle} name="quantity" type="number" min="0" step="any" value={form.quantity} onChange={handleChange} placeholder="e.g. 2" />
            </div>
            <div>
              <Label>Currency *</Label>
              <select style={inputStyle} name="currency" value={form.currency} onChange={handleChange}>
                {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
            <div>
              <Label>Cost per unit ({selectedCurrency?.symbol}) *</Label>
              <input style={inputStyle} name="price" type="number" min="0" step="any" value={form.price} onChange={handleChange} placeholder="e.g. 500" />
            </div>
            <div>
              <Label>Date (optional)</Label>
              <input style={inputStyle} name="purchasedAt" type="date" value={form.purchasedAt} onChange={handleChange} max={new Date().toISOString().split("T")[0]} />
            </div>
          </div>

          {form.quantity && form.price && (
            <div style={{ background: "#fff0f0", border: `2px solid #ffb3b3`, borderRadius: "12px", padding: "10px 16px", marginBottom: "14px", fontSize: "14px", fontWeight: "700", color: C.coral }}>
              Total: {formatMoney(parseFloat(form.quantity) * parseFloat(form.price), form.currency)}
            </div>
          )}

          <button type="submit" style={{ background: C.coral, color: "#fff", border: "none", borderRadius: "20px", padding: "10px 24px", fontSize: "14px", fontWeight: "700", cursor: "pointer", fontFamily: "Georgia, serif" }} disabled={loading}>
            {loading ? "Logging... 🌿" : "Log purchase 🛒"}
          </button>
        </form>
      </Card>

      {/* History */}
      <Card>
        <p style={{ fontSize: "14px", fontWeight: "700", color: C.brown, marginBottom: "16px" }}>📋 Purchase history ({purchases.length})</p>
        {purchases.length === 0 ? (
          <p style={{ color: C.tan, fontStyle: "italic", fontSize: "13px" }}>No purchases yet. Log your first one above!</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "480px" }}>
              <thead>
                <tr>
                  {["Item", "Qty", "Cost/unit", "Total", "Date"].map((h) => (
                    <th key={h} style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `2px dashed ${C.border}`, fontFamily: "system-ui, sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id}>
                    <td style={tdStyle}>{p.Item?.name ?? "—"}</td>
                    <td style={tdStyle}>{p.quantity} {p.Item?.unit ?? ""}</td>
                    <td style={tdStyle}>{formatMoney(p.price, p.currency)}</td>
                    <td style={tdStyle}>{formatMoney(p.price * p.quantity, p.currency)}</td>
                    <td style={tdStyle}>{formatDate(p.purchasedAt || p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
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