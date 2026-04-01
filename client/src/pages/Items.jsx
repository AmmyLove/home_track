import { useState, useEffect } from "react";
import { getItems, createItem, updateItem, deleteItem } from "../api/items.js";

const CATEGORIES = ["Produce", "Dairy", "Meat", "Grains", "Beverages", "Cleaning", "Other"];
const UNITS = ["pcs", "kg", "g", "litres", "ml", "pack"];

const emptyForm = { name: "", category: "", unit: "", restockThreshold: "" };

export default function Items() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editingItem, setEditingItem] = useState(null); // holds item being edited
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const res = await getItems();
      setItems(res.data);
    } catch (err) {
      setError("Failed to load items.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Populate form with item data when Edit is clicked
  const handleEditClick = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      category: item.category || "",
      unit: item.unit || "",
      restockThreshold: item.restockThreshold ?? "",
    });
    setError(null);
    setSuccess(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!form.name.trim()) return setError("Item name is required.");

    const payload = {
      ...form,
      restockThreshold: parseFloat(form.restockThreshold) || 0,
    };

    try {
      if (editingItem) {
        await updateItem(editingItem.id, payload);
        setSuccess(`"${form.name}" updated successfully!`);
        setEditingItem(null);
      } else {
        await createItem(payload);
        setSuccess(`"${form.name}" added successfully!`);
      }
      setForm(emptyForm);
      fetchItems();
    } catch (err) {
      setError(editingItem ? "Failed to update item." : "Failed to create item.");
    }
  };

  const handleDelete = async (item) => {
    const confirmed = window.confirm(`Delete "${item.name}"? This cannot be undone.`);
    if (!confirmed) return;

    setDeletingId(item.id);
    setError(null);
    setSuccess(null);

    try {
      await deleteItem(item.id);
      setSuccess(`"${item.name}" deleted.`);
      fetchItems();
    } catch (err) {
      setError("Failed to delete item.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <h1 style={styles.heading}>Items</h1>

      <div style={styles.card}>
        <h2 style={styles.subheading}>
          {editingItem ? `Editing "${editingItem.name}"` : "Add New Item"}
        </h2>

        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Name *</label>
              <input
                style={styles.input}
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Rice"
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Category</label>
              <select style={styles.input} name="category" value={form.category} onChange={handleChange}>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Unit</label>
              <select style={styles.input} name="unit" value={form.unit} onChange={handleChange}>
                <option value="">Select unit</option>
                {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Restock threshold</label>
              <input
                style={styles.input}
                name="restockThreshold"
                type="number"
                min="0"
                value={form.restockThreshold}
                onChange={handleChange}
                placeholder="e.g. 2"
              />
            </div>
          </div>

          <div style={styles.formActions}>
            <button type="submit" style={styles.button}>
              {editingItem ? "Save Changes" : "Add Item"}
            </button>
            {editingItem && (
              <button type="button" onClick={handleCancelEdit} style={styles.cancelBtn}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={styles.card}>
        <h2 style={styles.subheading}>All Items ({items.length})</h2>
        {loading ? (
          <p style={styles.muted}>Loading...</p>
        ) : items.length === 0 ? (
          <p style={styles.muted}>No items yet. Add one above.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {["Name", "Category", "Unit", "Restock at", ""].map((h, i) => (
                  <th key={i} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} style={{
                  ...styles.tr,
                  background: editingItem?.id === item.id ? "#eef2ff" : "transparent"
                }}>
                  <td style={styles.td}>{item.name}</td>
                  <td style={styles.td}>{item.category || "—"}</td>
                  <td style={styles.td}>{item.unit || "—"}</td>
                  <td style={styles.td}>{item.restockThreshold ?? "—"}</td>
                  <td style={{ ...styles.td, display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleEditClick(item)}
                      style={styles.editBtn}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      disabled={deletingId === item.id}
                      style={styles.deleteBtn}
                    >
                      {deletingId === item.id ? "Deleting..." : "Delete"}
                    </button>
                  </td>
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
  formActions: { display: "flex", gap: "12px", alignItems: "center" },
  button: { padding: "10px 24px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer" },
  cancelBtn: { padding: "10px 20px", background: "transparent", color: "#6b7280", border: "1px solid #d1d5db", borderRadius: "8px", fontSize: "14px", cursor: "pointer" },
  editBtn: { padding: "6px 14px", background: "#eff6ff", color: "#2563eb", border: "1px solid #bfdbfe", borderRadius: "6px", fontSize: "13px", fontWeight: "500", cursor: "pointer" },
  deleteBtn: { padding: "6px 14px", background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", borderRadius: "6px", fontSize: "13px", fontWeight: "500", cursor: "pointer" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 12px", fontSize: "13px", fontWeight: "600", color: "#6b7280", borderBottom: "1px solid #e5e7eb" },
  td: { padding: "12px", fontSize: "14px", color: "#111827", borderBottom: "1px solid #f3f4f6" },
  tr: { transition: "background 0.15s" },
  error: { color: "#dc2626", fontSize: "14px", background: "#fef2f2", padding: "10px 14px", borderRadius: "8px", marginBottom: "12px" },
  success: { color: "#16a34a", fontSize: "14px", background: "#f0fdf4", padding: "10px 14px", borderRadius: "8px", marginBottom: "12px" },
  muted: { color: "#9ca3af", fontSize: "14px" },
};