import { useState, useEffect } from "react";
import { getInventory } from "../api/inventory.js";

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await getInventory();
      setInventory(res.data);
    } catch (err) {
      setError("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  };

  const isLow = (entry) => {
    const threshold = entry.Item?.restockThreshold ?? 0;
    return entry.quantity <= threshold && threshold > 0;
  };

  const lowStockItems = inventory.filter(isLow);
  const healthyItems = inventory.filter((e) => !isLow(e));

  return (
    <div>
      <h1 style={styles.heading}>Inventory</h1>

      {/* Restock alerts */}
      {lowStockItems.length > 0 && (
        <div style={styles.alertBox}>
          <p style={styles.alertTitle}>⚠️ {lowStockItems.length} item{lowStockItems.length > 1 ? "s" : ""} need restocking</p>
          {lowStockItems.map((entry) => (
            <p key={entry.id} style={styles.alertRow}>
              <span style={styles.alertName}>{entry.Item?.name}</span>
              <span>
                {entry.quantity} {entry.Item?.unit ?? ""} left — restock at {entry.Item?.restockThreshold}
              </span>
            </p>
          ))}
        </div>
      )}

      {/* Full inventory table */}
      <div style={styles.card}>
        <h2 style={styles.subheading}>All Stock ({inventory.length} items)</h2>

        {loading ? (
          <p style={styles.muted}>Loading...</p>
        ) : inventory.length === 0 ? (
          <p style={styles.muted}>No inventory yet — log a purchase to get started.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {["Item", "Category", "In stock", "Unit", "Restock at", "Status"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {inventory.map((entry) => {
                const low = isLow(entry);
                return (
                  <tr key={entry.id}>
                    <td style={styles.td}>{entry.Item?.name ?? "—"}</td>
                    <td style={styles.td}>{entry.Item?.category ?? "—"}</td>
                    <td style={styles.td}>{entry.quantity}</td>
                    <td style={styles.td}>{entry.Item?.unit ?? "—"}</td>
                    <td style={styles.td}>{entry.Item?.restockThreshold ?? "—"}</td>
                    <td style={styles.td}>
                      <span style={low ? styles.badgeLow : styles.badgeOk}>
                        {low ? "Low stock" : "OK"}
                      </span>
                    </td>
                  </tr>
                );
              })}
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
  alertBox: { background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "12px", padding: "20px 24px", marginBottom: "24px" },
  alertTitle: { fontWeight: "600", fontSize: "14px", color: "#92400e", margin: "0 0 12px" },
  alertRow: { display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#78350f", margin: "6px 0" },
  alertName: { fontWeight: "600" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 12px", fontSize: "13px", fontWeight: "600", color: "#6b7280", borderBottom: "1px solid #e5e7eb" },
  td: { padding: "12px", fontSize: "14px", color: "#111827", borderBottom: "1px solid #f3f4f6" },
  badgeLow: { background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" },
  badgeOk: { background: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0", padding: "3px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "500" },
  muted: { color: "#9ca3af", fontSize: "14px" },
};