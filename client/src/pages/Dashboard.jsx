import { useState, useEffect } from "react";
import {
  getDailySpending,
  getWeeklySpending,
  getMonthlySpending,
  getAllTimeSpending,
  getMonthlyHistory,
} from "../api/spending.js";
import { getInventory } from "../api/inventory.js";
// import from utils instead of defining inline
import { formatMoney, CURRENCIES } from "../utils/format.js";

// ← REPLACE the old recharts imports with these
import {
  LineChart,      // the chart container
  Line,           // one line per currency
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [spending, setSpending] = useState({
    daily: null,
    weekly: null,
    monthly: null,
    allTime: null,
  });
  const [lowStock, setLowStock] = useState([]);
  const [monthlyHistory, setMonthlyHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [daily, weekly, monthly, allTime, inventory, history] = await Promise.all([
        getDailySpending(),
        getWeeklySpending(),
        getMonthlySpending(),
        getAllTimeSpending(),
        getInventory(),
        getMonthlyHistory(),
      ]);

      setSpending({
        daily: daily.data,
        weekly: weekly.data,
        monthly: monthly.data,
        allTime: allTime.data,
      });

      setMonthlyHistory(history.data);

      const low = inventory.data.filter((entry) => {
        const threshold = entry.Item?.restockThreshold ?? 0;
        return entry.quantity <= threshold && threshold > 0;
      });
      setLowStock(low);
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  // Renders one spending card (Today / This week / etc.)
  const SpendingCard = ({ title, data }) => {
    if (!data) return null;

    // Only show currencies that have at least one purchase
    const activeCurrencies = CURRENCIES.filter(
      (c) => data.breakdown[c.code]?.count > 0
    );

    return (
      <div style={styles.spendCard}>
        <p style={styles.spendLabel}>{title}</p>
        <p style={styles.spendCount}>
          {data.totalPurchases} purchase{data.totalPurchases !== 1 ? "s" : ""}
        </p>
        {activeCurrencies.length === 0 ? (
          <p style={styles.spendTotal}>—</p>
        ) : (
          activeCurrencies.map((c) => (
            <p key={c.code} style={styles.spendTotal}>
              {/* formatMoney handles all formatting */}
              {formatMoney(data.breakdown[c.code].total, c.code)}
            </p>
          ))
        )}
      </div>
    );
  };


  // Custom tooltip that formats numbers as money 
  // Recharts calls this when you hover over a bar
  const ChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div style={styles.tooltip}>
        <p style={styles.tooltipLabel}>{label}</p>
        {payload.map((entry) => (
          // Only show currencies with a non-zero value
          entry.value > 0 && (
            <p key={entry.dataKey} style={{ ...styles.tooltipRow, color: entry.color }}>
              {entry.dataKey}: {formatMoney(entry.value, entry.dataKey)}
            </p>
          )
        ))}
      </div>
    );
  };


  if (loading) return <p style={styles.muted}>Loading dashboard...</p>;
  if (error) return <p style={styles.error}>{error}</p>;

  // Check which currencies actually have data in the chart
  // So we don't show a legend entry for a currency you've never used
  const activeCurrenciesInChart = CURRENCIES.filter((c) =>
  (monthlyHistory || []).some((m) => m[c.code] > 0)
);

  // Colors for each currency bar in the chart
  const CHART_COLORS = { NGN: "#4f46e5", USD: "#10b981", EUR: "#f59e0b" };



  return (
    <div>
      <h1 style={styles.heading}>Dashboard</h1>

      {/* Low stock alert banner — only shows when items need restocking */}
      {lowStock.length > 0 && (
        <div style={styles.alertBox}>
          <p style={styles.alertTitle}>
            ⚠️ {lowStock.length} item{lowStock.length > 1 ? "s" : ""} need restocking
          </p>
          <p style={styles.alertSub}>
            {lowStock.map((e) => e.Item?.name).join(", ")}
          </p>
        </div>
      )}

      {/* Spending summary cards */}
      <div style={styles.card}>
        <h2 style={styles.subheading}>Spending overview</h2>
        <div style={styles.spendGrid}>
          <SpendingCard title="Today" data={spending.daily} />
          <SpendingCard title="This week" data={spending.weekly} />
          <SpendingCard title="This month" data={spending.monthly} />
          <SpendingCard title="All time" data={spending.allTime} />
        </div>
      </div>



      {/* ── ADD: Monthly spending chart ──────────────────────────── */}
      <div style={styles.card}>
        <h2 style={styles.subheading}>Monthly spending — last 6 months</h2>

        {monthlyHistory.length === 0 ? (
          <p style={styles.muted}>No purchase data yet.</p>
        ) : (
          // ResponsiveContainer makes the chart fill its parent's width
          <ResponsiveContainer width="100%" height={280}>
            <LineChart
              data={monthlyHistory}
              margin={{ top: 8, right: 16, left: 16, bottom: 4 }}
            >
              {/* Light horizontal grid lines */}
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />

              {/* X axis — month labels */}
              <XAxis
                dataKey="label"
                tick={{ fontSize: 12, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
              />

              {/* Y axis — hide the line, keep the numbers */}
              <YAxis
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                axisLine={false}
                tickLine={false}
                width={48}
              />

              {/* Custom hover tooltip */}
              <Tooltip content={<ChartTooltip />} />

              {/* Only render bars for currencies that have been used */}
              <Legend
                wrapperStyle={{ fontSize: "13px", paddingTop: "12px" }}
              />
              {activeCurrenciesInChart.map((c) => (
                <Line
                  key={c.code}
                  type="monotone"       // smooth curved line
                  dataKey={c.code}
                  name={c.code}
                  stroke={CHART_COLORS[c.code]}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: CHART_COLORS[c.code] }}         // dots at each data point
                  activeDot={{ r: 6, fill: CHART_COLORS[c.code] }}   // bigger dot on hover
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>




      {/* Recent purchases — shows latest 8 */}
      <div style={styles.card}>
        <h2 style={styles.subheading}>Recent purchases</h2>
        {spending.allTime?.purchases?.length === 0 ? (
          <p style={styles.muted}>No purchases yet.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                {["Item", "Qty", "Total", "Date"].map((h) => (
                  <th key={h} style={styles.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {spending.allTime?.purchases?.slice(0, 8).map((p) => (
                <tr key={p.id}>
                  <td style={styles.td}>{p.Item?.name ?? "—"}</td>
                  <td style={styles.td}>{p.quantity} {p.Item?.unit ?? ""}</td>
                  {/* proper money formatting */}
                  <td style={styles.td}>
                    {formatMoney(p.price * p.quantity, p.currency)}
                  </td>
                  <td style={styles.td}>
                    {new Date(p.purchasedAt || p.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
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
  alertBox: { background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "12px", padding: "16px 24px", marginBottom: "24px" },
  alertTitle: { fontWeight: "600", fontSize: "14px", color: "#92400e", margin: "0 0 4px" },
  alertSub: { fontSize: "13px", color: "#78350f", margin: 0 },
  spendGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "16px" },
  spendCard: { background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "10px", padding: "16px" },
  spendLabel: { fontSize: "12px", fontWeight: "600", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 6px" },
  spendCount: { fontSize: "12px", color: "#9ca3af", margin: "0 0 6px" },
  spendTotal: { fontSize: "22px", fontWeight: "700", color: "#111827", margin: "0" },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 12px", fontSize: "13px", fontWeight: "600", color: "#6b7280", borderBottom: "1px solid #e5e7eb" },
  td: { padding: "12px", fontSize: "14px", color: "#111827", borderBottom: "1px solid #f3f4f6" },
  muted: { color: "#9ca3af", fontSize: "14px" },
  error: { color: "#dc2626", fontSize: "14px" },
};