import { useState, useEffect } from "react";
import { getItems, createItem, updateItem, deleteItem } from "../api/items.js";

const C = { bg: "#fdf6e3", cardBg: "#fff9f0", border: "#f5e6c8", coral: "#ff6b6b", brown: "#3d2b1f", tan: "#b8956a", muted: "#8b7355" };
const CATEGORIES = ["Produce", "Dairy", "Meat", "Grains", "Beverages", "Cleaning", "Other"];
const UNITS      = ["pcs", "kg", "g", "litres", "ml", "pack"];
const emptyForm  = { name: "", category: "", unit: "", restockThreshold: "" };

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

const Input = ({ style = {}, ...props }) => (
  <input style={{ padding: "9px 13px", border: `2px solid ${C.border}`, borderRadius: "12px", fontSize: "14px", background: "#fff", color: C.brown, outline: "none", fontFamily: "Georgia, serif", width: "100%", ...style }} {...props} />
);

const Select = ({ children, style = {}, ...props }) => (
  <select style={{ padding: "9px 13px", border: `2px solid ${C.border}`, borderRadius: "12px", fontSize: "14px", background: "#fff", color: C.brown, outline: "none", fontFamily: "Georgia, serif", width: "100%", ...style }} {...props}>
    {children}
  </select>
);

export default function Items() {
  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [form, setForm]           = useState(emptyForm);
  const [editingItem, setEditing] = useState(null);
  const [error, setError]         = useState(null);
  const [success, setSuccess]     = useState(null);
  const [deletingId, setDeleting] = useState(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const res = await getItems();
      setItems(res.data);
    } catch { setError("Failed to load items."); }
    finally { setLoading(false); }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleEditClick = (item) => {
    setEditing(item);
    setForm({ name: item.name, category: item.category || "", unit: item.unit || "", restockThreshold: item.restockThreshold ?? "" });
    setError(null); setSuccess(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancel = () => { setEditing(null); setForm(emptyForm); setError(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); setSuccess(null);
    if (!form.name.trim()) return setError("Item name is required.");
    const payload = { ...form, restockThreshold: parseFloat(form.restockThreshold) || 0 };
    try {
      if (editingItem) {
        await updateItem(editingItem.id, payload);
        setSuccess(`"${form.name}" updated! 🌿`);
        setEditing(null);
      } else {
        await createItem(payload);
        setSuccess(`"${form.name}" added to your home! 🏡`);
      }
      setForm(emptyForm);
      fetchItems();
    } catch { setError(editingItem ? "Failed to update item." : "Failed to add item."); }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Remove "${item.name}" from your home?`)) return;
    setDeleting(item.id);
    try {
      await deleteItem(item.id);
      setSuccess(`"${item.name}" removed. 🌱`);
      fetchItems();
    } catch { setError("Failed to delete item."); }
    finally { setDeleting(null); }
  };

  return (
    <div style={{ fontFamily: "Georgia, serif" }}>
      <h1 style={{ fontSize: "clamp(20px, 4vw, 24px)", fontWeight: "700", color: C.brown, marginBottom: "6px" }}>Items 🏷</h1>
      <p style={{ fontSize: "13px", color: C.tan, fontStyle: "italic", marginBottom: "24px" }}>
        Manage the items you track in your home.
      </p>

      {error   && <div style={alertStyle("error")}>{error}</div>}
      {success && <div style={alertStyle("success")}>{success}</div>}

      {/* Form */}
      <Card>
        <p style={{ fontSize: "14px", fontWeight: "700", color: C.brown, marginBottom: "16px" }}>
          {editingItem ? `✏️ Editing "${editingItem.name}"` : "✨ Add a new item"}
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "14px" }}>
            <div>
              <Label>Name *</Label>
              <Input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Rice" />
            </div>
            <div>
              <Label>Category</Label>
              <Select name="category" value={form.category} onChange={handleChange}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div>
              <Label>Unit</Label>
              <Select name="unit" value={form.unit} onChange={handleChange}>
                <option value="">Select unit</option>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </Select>
            </div>
            <div>
              <Label>Restock threshold</Label>
              <Input name="restockThreshold" type="number" min="0" value={form.restockThreshold} onChange={handleChange} placeholder="e.g. 2" />
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button type="submit" style={btnStyle("primary")}>
              {editingItem ? "Save changes 🌿" : "Add item 🏡"}
            </button>
            {editingItem && (
              <button type="button" onClick={handleCancel} style={btnStyle("ghost")}>Cancel</button>
            )}
          </div>
        </form>
      </Card>

      {/* Items list */}
      <Card>
        <p style={{ fontSize: "14px", fontWeight: "700", color: C.brown, marginBottom: "16px" }}>
          🏠 Your items ({items.length})
        </p>
        {loading ? (
          <p style={{ color: C.tan, fontStyle: "italic", fontSize: "13px" }}>Loading...</p>
        ) : items.length === 0 ? (
          <p style={{ color: C.tan, fontStyle: "italic", fontSize: "13px" }}>No items yet — add one above! 🌱</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "480px" }}>
              <thead>
                <tr>
                  {["Name", "Category", "Unit", "Restock at", ""].map((h, i) => (
                    <th key={i} style={{ textAlign: "left", padding: "8px 12px", fontSize: "11px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.06em", borderBottom: `2px dashed ${C.border}`, fontFamily: "system-ui, sans-serif" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} style={{ background: editingItem?.id === item.id ? "#fff3e0" : "transparent" }}>
                    <td style={tdStyle}>{item.name}</td>
                    <td style={tdStyle}>{item.category || "—"}</td>
                    <td style={tdStyle}>{item.unit || "—"}</td>
                    <td style={tdStyle}>{item.restockThreshold ?? "—"}</td>
                    <td style={{ ...tdStyle, display: "flex", gap: "6px" }}>
                      <button onClick={() => handleEditClick(item)} style={btnStyle("edit")}>Edit</button>
                      <button onClick={() => handleDelete(item)} disabled={deletingId === item.id} style={btnStyle("delete")}>
                        {deletingId === item.id ? "..." : "Remove"}
                      </button>
                    </td>
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

const btnStyle = (type) => {
  const base = { border: "none", borderRadius: "20px", padding: "7px 16px", fontSize: "12px", fontWeight: "600", cursor: "pointer", fontFamily: "Georgia, serif", whiteSpace: "nowrap" };
  if (type === "primary") return { ...base, background: "#ff6b6b", color: "#fff" };
  if (type === "ghost")   return { ...base, background: "transparent", color: "#b8956a", border: "1.5px solid #f5e6c8" };
  if (type === "edit")    return { ...base, background: "#f0f4ff", color: "#3b6fc4", border: "1.5px solid #b3c9f0", padding: "5px 12px" };
  if (type === "delete")  return { ...base, background: "#fff0f0", color: "#b91c1c", border: "1.5px solid #ffb3b3", padding: "5px 12px" };
};

const alertStyle = (type) => ({
  background: type === "error" ? "#fff0f0" : "#f0fdf4",
  border: `1.5px solid ${type === "error" ? "#ffb3b3" : "#b3f0c9"}`,
  borderRadius: "14px",
  padding: "11px 16px",
  fontSize: "13px",
  color: type === "error" ? "#b91c1c" : "#166534",
  marginBottom: "16px",
  fontFamily: "system-ui, sans-serif",
});