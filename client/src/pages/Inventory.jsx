import { useState, useEffect } from "react";
import { getInventory } from "../api/inventory.js";
import { useAutoFade } from "../hooks/useAutoFade.js";

const C = { cardBg: "#fff9f0", border: "#f5e6c8", coral: "#ff6b6b", brown: "#3d2b1f", tan: "#b8956a", muted: "#8b7355" };
const EMOJI_MAP = { Produce: "🥬", Dairy: "🥛", Meat: "🍗", Grains: "🌾", Beverages: "🧃", Cleaning: "🧹", Other: "📦" };

export default function Inventory() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);


  useAutoFade(success, setSuccess);
  useAutoFade(error, setError, 6000);

  useEffect(() => {
    getInventory()
      .then((r) => setInventory(r.data))
      .catch(() => setError("Failed to load inventory."))
      .finally(() => setLoading(false));
  }, []);

  const isLow = (e) => {
    const t = e.Item?.restockThreshold ?? 0;
    return e.quantity <= t && t > 0;
  };

  const low     = inventory.filter(isLow);
  const healthy = inventory.filter((e) => !isLow(e));

  return (
    <div style={{ fontFamily: "Georgia, serif" }}>
      <h1 style={{ fontSize: "clamp(20px, 4vw, 24px)", fontWeight: "700", color: C.brown, marginBottom: "6px" }}>Inventory 📦</h1>
      <p style={{ fontSize: "13px", color: C.tan, fontStyle: "italic", marginBottom: "24px" }}>See what you have and what needs restocking.</p>

      {error && <div style={alertStyle("error")}>{error}</div>}

      {/* Low stock section */}
      {low.length > 0 && (
        <div style={{ background: "#fffaf0", border: "2px dashed #f5c842", borderRadius: "20px", padding: "20px", marginBottom: "20px" }}>
          <p style={{ fontSize: "14px", fontWeight: "700", color: "#8b6914", marginBottom: "14px" }}>
            ⚠️ {low.length} item{low.length > 1 ? "s" : ""} need restocking
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {low.map((entry) => <InventoryRow key={entry.id} entry={entry} low />)}
          </div>
        </div>
      )}

      {/* Full inventory */}
      <div style={{ background: C.cardBg, border: `2px solid ${C.border}`, borderRadius: "24px", padding: "22px" }}>
        <p style={{ fontSize: "14px", fontWeight: "700", color: C.brown, marginBottom: "16px" }}>
          🏠 All stock ({inventory.length} items)
        </p>
        {loading ? (
          <p style={{ color: C.tan, fontStyle: "italic", fontSize: "13px" }}>Loading your inventory...</p>
        ) : inventory.length === 0 ? (
          <p style={{ color: C.tan, fontStyle: "italic", fontSize: "13px" }}>No inventory yet — log a purchase to get started! 🛒</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {[...low, ...healthy].map((entry) => (
              <InventoryRow key={entry.id} entry={entry} low={isLow(entry)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function InventoryRow({ entry, low }) {
  const threshold = entry.Item?.restockThreshold ?? 0;
  const max       = Math.max(entry.quantity, threshold * 2, 1);
  const pct       = Math.min((entry.quantity / max) * 100, 100);
  const emoji     = EMOJI_MAP[entry.Item?.category] ?? "📦";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 0", borderBottom: "1.5px dotted #f5e6c8", flexWrap: "wrap" }}>
      <span style={{ fontSize: "16px", width: "22px", textAlign: "center", flexShrink: 0 }}>{emoji}</span>
      <span style={{ fontSize: "13px", fontWeight: "600", color: "#3d2b1f", width: "100px", flexShrink: 0, fontFamily: "system-ui, sans-serif" }}>{entry.Item?.name}</span>
      <span style={{ fontSize: "11px", color: "#b8956a", width: "60px", flexShrink: 0, fontFamily: "system-ui, sans-serif" }}>{entry.Item?.category || "—"}</span>
      <div style={{ flex: 1, minWidth: "80px", height: "6px", background: "#f5e6c8", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: low ? "#e05c5c" : "#ff6b6b", borderRadius: "3px", transition: "width 0.4s" }} />
      </div>
      <span style={{ fontSize: "12px", color: "#b8956a", width: "60px", textAlign: "right", flexShrink: 0, fontStyle: "italic", fontFamily: "system-ui, sans-serif" }}>
        {entry.quantity} {entry.Item?.unit ?? ""}
      </span>
      <span style={{ fontSize: "10px", padding: "3px 10px", borderRadius: "20px", fontFamily: "system-ui, sans-serif", fontWeight: "600", flexShrink: 0, background: low ? "#fff0f0" : "#f0fdf4", color: low ? "#b91c1c" : "#166534", border: `1px solid ${low ? "#ffb3b3" : "#b3f0c9"}` }}>
        {low ? "Low stock" : "OK"}
      </span>
    </div>
  );
}

const alertStyle = (type) => ({
  background: "#fff0f0", border: "1.5px solid #ffb3b3", borderRadius: "14px",
  padding: "11px 16px", fontSize: "13px", color: "#b91c1c",
  marginBottom: "16px", fontFamily: "system-ui, sans-serif",
});