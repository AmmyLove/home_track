import { useState, useEffect } from "react";
import {
  getDailySpending,
  getWeeklySpending,
  getMonthlySpending,
  getAllTimeSpending,
  getMonthlyHistory,
} from "../api/spending.js";
import { getInventory } from "../api/inventory.js";
import { formatMoney, CURRENCIES } from "../utils/format.js";
import { useAuth } from "../context/AuthContext.jsx";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// ── Design tokens ─────────────────────────────────────────────────
const C = {
  bg:         "#fdf6e3",
  cardBg:     "#fff9f0",
  border:     "#f5e6c8",
  coral:      "#ff6b6b",
  coralLight: "#ffeeee",
  brown:      "#3d2b1f",
  tan:        "#b8956a",
  muted:      "#8b7355",
};

// ── Reusable card wrapper ─────────────────────────────────────────
const Card = ({ children, style = {} }) => (
  <div style={{ background: C.cardBg, border: `2px solid ${C.border}`, borderRadius: "24px", padding: "20px", ...style }}>
    {children}
  </div>
);

// ── Section heading ───────────────────────────────────────────────
const SectionTitle = ({ emoji, title }) => (
  <p style={{ fontSize: "14px", fontWeight: "700", color: C.brown, marginBottom: "14px", fontFamily: "Georgia, serif", display: "flex", alignItems: "center", gap: "7px" }}>
    <span>{emoji}</span>{title}
  </p>
);

// ── Custom chart tooltip ──────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: C.cardBg, border: `2px solid ${C.border}`, borderRadius: "12px", padding: "10px 14px", fontFamily: "system-ui, sans-serif" }}>
      <p style={{ fontSize: "12px", fontWeight: "700", color: C.brown, marginBottom: "4px" }}>{label}</p>
      {payload.map((entry) => entry.value > 0 && (
        <p key={entry.dataKey} style={{ fontSize: "12px", color: C.coral, margin: 0 }}>
          {formatMoney(entry.value, entry.dataKey)}
        </p>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { user } = useAuth();

  const [spending, setSpending] = useState({ daily: null, weekly: null, monthly: null, allTime: null });
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [lowStock, setLowStock]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [daily, weekly, monthly, allTime, inventory, history] = await Promise.all([
        getDailySpending(), getWeeklySpending(), getMonthlySpending(),
        getAllTimeSpending(), getInventory(), getMonthlyHistory(),
      ]);
      setSpending({ daily: daily.data, weekly: weekly.data, monthly: monthly.data, allTime: allTime.data });
      setMonthlyHistory(history.data || []);
      setLowStock(inventory.data.filter((e) => {
        const t = e.Item?.restockThreshold ?? 0;
        return e.quantity <= t && t > 0;
      }));
    } catch {
      setError("Couldn't load your dashboard. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const activeCurrencies = CURRENCIES.filter((c) =>
    (monthlyHistory || []).some((m) => m[c.code] > 0)
  );

  const CHART_COLORS = { NGN: "#ff6b6b", USD: "#10b981", EUR: "#3b6fc4" };

  if (loading) return (
    <div style={{ textAlign: "center", padding: "60px 0", fontFamily: "Georgia, serif", color: C.tan }}>
      <div style={{ fontSize: "40px", marginBottom: "12px" }}>🏡</div>
      <p style={{ fontStyle: "italic" }}>Loading your home...</p>
    </div>
  );

  if (error) return (
    <div style={{ background: "#fff0f0", border: `2px solid #ffb3b3`, borderRadius: "16px", padding: "20px", color: "#b91c1c", fontFamily: "system-ui, sans-serif" }}>
      {error}
    </div>
  );

  return (
    <div style={{ fontFamily: "Georgia, serif" }}>
      {/* Greeting */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "clamp(20px, 4vw, 26px)", fontWeight: "700", color: C.brown, marginBottom: "4px" }}>
          Hello, {user?.name?.split(" ")[0]}! 🌸
        </h1>
        <p style={{ fontSize: "13px", color: C.tan, fontStyle: "italic" }}>
          {lowStock.length > 0
            ? `Your home needs some attention — ${lowStock.length} item${lowStock.length > 1 ? "s" : ""} running low.`
            : "Your home is well-stocked. Great job! 🌿"}
        </p>
      </div>

      {/* Low stock banner */}
      {lowStock.length > 0 && (
        <div style={{ background: "#fffaf0", border: "1.5px dashed #f5c842", borderRadius: "16px", padding: "14px 18px", marginBottom: "20px", display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", fontWeight: "700", color: "#8b6914" }}>🌱 Restock soon:</span>
          {lowStock.map((e) => (
            <span key={e.id} style={{ background: "#fef3c7", border: "1.5px solid #f5c842", borderRadius: "20px", padding: "2px 12px", fontSize: "12px", color: "#8b6914", fontFamily: "system-ui, sans-serif", fontWeight: "600" }}>
              {e.Item?.name}
            </span>
          ))}
        </div>
      )}

      {/* KPI cards — blob shapes, responsive grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "20px" }}>
        {[
          { emoji: "📅", label: "Today",      val: spending.daily,   color: "#e05c5c", bg: "#fff0f0", borderColor: "#ffb3b3", shape: "60% 40% 55% 45%/45% 55% 45% 55%" },
          { emoji: "🌿", label: "This week",  val: spending.weekly,  color: "#2d8a4e", bg: "#f0fff4", borderColor: "#b3f0c9", shape: "45% 55% 40% 60%/55% 45% 55% 45%" },
          { emoji: "🗓", label: "This month", val: spending.monthly, color: "#3b6fc4", bg: "#f0f4ff", borderColor: "#b3c9f0", shape: "55% 45% 60% 40%/40% 60% 40% 60%" },
          { emoji: "🏦", label: "All time",   val: spending.allTime, color: "#b8860b", bg: "#fffdf0", borderColor: "#f0e8b3", shape: "40% 60% 45% 55%/60% 40% 60% 40%" },
        ].map(({ emoji, label, val, color, bg, borderColor, shape }) => {
          const active = CURRENCIES.filter((c) => val?.breakdown?.[c.code]?.count > 0);
          return (
            <div key={label} style={{ background: bg, border: `2px solid ${borderColor}`, borderRadius: shape, padding: "16px 18px" }}>
              <div style={{ fontSize: "20px", marginBottom: "6px" }}>{emoji}</div>
              <div style={{ fontSize: "10px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "5px", fontFamily: "system-ui, sans-serif" }}>{label}</div>
              {active.length === 0
                ? <div style={{ fontSize: "20px", fontWeight: "800", color: C.brown, fontFamily: "system-ui, sans-serif" }}>—</div>
                : active.map((c) => (
                  <div key={c.code} style={{ fontSize: "clamp(16px, 3vw, 21px)", fontWeight: "800", color, fontFamily: "system-ui, sans-serif", lineHeight: 1.2 }}>
                    {formatMoney(val.breakdown[c.code].total, c.code)}
                  </div>
                ))}
              <div style={{ fontSize: "11px", color: C.tan, marginTop: "4px", fontStyle: "italic" }}>
                {val?.totalPurchases ?? 0} purchase{val?.totalPurchases !== 1 ? "s" : ""}
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart + alerts row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "16px" }}>
        {/* Line chart */}
        <Card>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <SectionTitle emoji="📈" title="Spending over time" />
          </div>
          {monthlyHistory.length === 0 ? (
            <p style={{ color: C.tan, fontStyle: "italic", fontSize: "13px" }}>No purchase data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={monthlyHistory} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: C.tan, fontFamily: "system-ui" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: C.tan, fontFamily: "system-ui" }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                {activeCurrencies.map((c) => (
                  <Line key={c.code} type="monotone" dataKey={c.code} stroke={CHART_COLORS[c.code]}
                    strokeWidth={2.5} dot={{ r: 4, fill: CHART_COLORS[c.code], stroke: C.cardBg, strokeWidth: 2 }}
                    activeDot={{ r: 6 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Restock alerts */}
        <Card>
          <SectionTitle emoji="🌱" title="Restock soon" />
          {lowStock.length === 0 ? (
            <p style={{ color: C.tan, fontStyle: "italic", fontSize: "13px" }}>Everything is well-stocked! 🎉</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {lowStock.map((entry) => (
                <div key={entry.id} style={{ background: "#fffaf0", border: "1.5px dashed #f5c842", borderRadius: "999px", padding: "9px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "16px" }}>
                      {entry.Item?.category === "Produce" ? "🥬" : entry.Item?.category === "Dairy" ? "🥛" : "🛒"}
                    </span>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: "700", color: C.brown, fontFamily: "system-ui, sans-serif" }}>{entry.Item?.name}</div>
                      <div style={{ fontSize: "10px", color: C.tan, fontStyle: "italic" }}>{entry.quantity} {entry.Item?.unit} left</div>
                    </div>
                  </div>
                  <span style={{ background: "#fef3c7", border: "1.5px solid #f5c842", color: "#8b6914", borderRadius: "20px", padding: "2px 10px", fontSize: "10px", fontWeight: "700", fontFamily: "system-ui, sans-serif" }}>Low</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Bottom row — recent purchases + inventory status */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
        {/* Recent purchases */}
        <Card>
          <SectionTitle emoji="🛒" title="Recent purchases" />
          {spending.allTime?.purchases?.length === 0 ? (
            <p style={{ color: C.tan, fontStyle: "italic", fontSize: "13px" }}>No purchases yet.</p>
          ) : (
            <div>
              {spending.allTime?.purchases?.slice(0, 6).map((p) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1.5px dotted ${C.border}` }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: "600", color: C.brown, fontFamily: "system-ui, sans-serif" }}>{p.Item?.name ?? "—"}</div>
                    <div style={{ fontSize: "11px", color: C.tan, fontStyle: "italic" }}>
                      {new Date(p.purchasedAt || p.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      {" · "}{p.quantity} {p.Item?.unit ?? ""}
                    </div>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: "700", color: C.brown, fontFamily: "system-ui, sans-serif" }}>
                    {formatMoney(p.price * p.quantity, p.currency)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Inventory status with progress bars */}
        <Card>
          <SectionTitle emoji="🥦" title="Inventory status" />
          {spending.allTime?.purchases?.length === 0 ? (
            <p style={{ color: C.tan, fontStyle: "italic", fontSize: "13px" }}>Log purchases to see inventory.</p>
          ) : (
            <div>
              {lowStock.slice(0, 5).map((entry) => (
                <InventoryRow key={entry.id} entry={entry} low />
              ))}
            </div>
          )}
          <InventoryFromAPI />
        </Card>
      </div>
    </div>
  );
}

// Inventory rows fetched separately so the card is self-contained
function InventoryFromAPI() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    getInventory().then((res) => setInventory(res.data)).catch(() => {});
  }, []);

  const healthy = inventory.filter((e) => {
    const t = e.Item?.restockThreshold ?? 0;
    return e.quantity > t || t === 0;
  });

  return (
    <div>
      {healthy.slice(0, 5).map((entry) => (
        <InventoryRow key={entry.id} entry={entry} low={false} />
      ))}
    </div>
  );
}

function InventoryRow({ entry, low }) {
  const threshold = entry.Item?.restockThreshold ?? 0;
  const max       = Math.max(entry.quantity, threshold * 2, 1);
  const pct       = Math.min((entry.quantity / max) * 100, 100);

  const EMOJI_MAP = { Produce: "🥬", Dairy: "🥛", Meat: "🍗", Grains: "🌾", Beverages: "🧃", Cleaning: "🧹" };
  const emoji = EMOJI_MAP[entry.Item?.category] ?? "📦";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "7px 0", borderBottom: `1.5px dotted #f5e6c8` }}>
      <span style={{ fontSize: "14px", width: "18px", textAlign: "center" }}>{emoji}</span>
      <span style={{ fontSize: "11px", fontWeight: "600", color: "#3d2b1f", width: "70px", flexShrink: 0, fontFamily: "system-ui, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {entry.Item?.name}
      </span>
      <div style={{ flex: 1, height: "5px", background: "#f5e6c8", borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: low ? "#e05c5c" : "#ff6b6b", borderRadius: "3px" }} />
      </div>
      <span style={{ fontSize: "10px", color: "#b8956a", width: "36px", textAlign: "right", fontStyle: "italic" }}>
        {entry.quantity} {entry.Item?.unit ?? ""}
      </span>
      <span style={{ fontSize: "9px", padding: "2px 7px", borderRadius: "20px", fontFamily: "system-ui, sans-serif", fontWeight: "600", flexShrink: 0, background: low ? "#fff0f0" : "#f0fdf4", color: low ? "#b91c1c" : "#166534", border: `1px solid ${low ? "#ffb3b3" : "#b3f0c9"}` }}>
        {low ? "Low" : "OK"}
      </span>
    </div>
  );
}