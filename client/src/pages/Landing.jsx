// src/pages/Landing.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// ── Design tokens ─────────────────────────────────────────────────
const C = {
  bg:         "#fdf6e3",
  cardBg:     "#fff9f0",
  border:     "#f5e6c8",
  coral:      "#ff6b6b",
  coralLight: "#ffaaaa",
  brown:      "#3d2b1f",
  tan:        "#b8956a",
  muted:      "#8b7355",
  gold:       "#8b6914",
};

// ── Reusable blob KPI card — same as the app's dashboard ──────────
const BlobCard = ({ emoji, label, value, color, bg, borderColor, shape }) => (
  <div style={{ background: bg, border: `2px solid ${borderColor}`, borderRadius: shape, padding: "16px 18px", flex: "1", minWidth: "120px" }}>
    <div style={{ fontSize: "18px", marginBottom: "5px" }}>{emoji}</div>
    <div style={{ fontSize: "10px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "4px", fontFamily: "system-ui, sans-serif" }}>{label}</div>
    <div style={{ fontSize: "18px", fontWeight: "800", color, fontFamily: "system-ui, sans-serif", lineHeight: 1 }}>{value}</div>
  </div>
);

// ── Animated line chart (pure SVG, no recharts needed) ────────────
const DemoLineChart = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate the line drawing in over 1.5 seconds
    const start = Date.now();
    const duration = 1500;
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p < 1) requestAnimationFrame(tick);
    };
    const timeout = setTimeout(() => requestAnimationFrame(tick), 400);
    return () => clearTimeout(timeout);
  }, []);

  // Data points for the chart
  const points = [
    { x: 0,   y: 85 },
    { x: 80,  y: 70 },
    { x: 160, y: 42 },
    { x: 240, y: 58 },
    { x: 320, y: 16 },
    { x: 400, y: 20 },
  ];

  // Build the polyline points string trimmed to current progress
  const totalLength = 400;
  const visibleX = progress * totalLength;
  const visiblePoints = points
    .filter((p) => p.x <= visibleX)
    .map((p) => `${p.x},${p.y}`)
    .join(" ");

  // Interpolate the last partial segment
  const lastFull = points.findLast((p) => p.x <= visibleX);
  const nextPoint = points.find((p) => p.x > visibleX);
  let interpolatedPoint = "";
  if (lastFull && nextPoint) {
    const segProgress = (visibleX - lastFull.x) / (nextPoint.x - lastFull.x);
    const ix = lastFull.x + (nextPoint.x - lastFull.x) * segProgress;
    const iy = lastFull.y + (nextPoint.y - lastFull.y) * segProgress;
    interpolatedPoint = ` ${ix},${iy}`;
  }

  const allVisiblePoints = visiblePoints + interpolatedPoint;

  return (
    <svg width="100%" height="108" viewBox="0 0 400 108" preserveAspectRatio="none">
      <defs>
        <linearGradient id="demofill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff6b6b" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#ff6b6b" stopOpacity="0.01" />
        </linearGradient>
      </defs>
      {/* Grid lines */}
      {[25, 55, 85].map((y) => (
        <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#f5e6c8" strokeWidth="1" strokeDasharray="4,3" />
      ))}
      {/* Area fill */}
      {progress > 0.1 && (
        <path
          d={`M0,85 L${allVisiblePoints.split(" ").join(" L")} L${Math.min(visibleX, 400)},108 L0,108 Z`}
          fill="url(#demofill)"
        />
      )}
      {/* Line */}
      {allVisiblePoints && (
        <polyline
          points={allVisiblePoints}
          fill="none"
          stroke="#ff6b6b"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {/* Dots — only show for fully visible points */}
      {points
        .filter((p) => p.x < visibleX - 4)
        .map((p) => (
          <circle key={p.x} cx={p.x} cy={p.y} r="4" fill="#ff6b6b" stroke="#fff9f0" strokeWidth="2" />
        ))}
      {/* Tooltip on the highest point when fully drawn */}
      {progress === 1 && (
        <>
          <rect x="272" y="3" width="96" height="15" rx="8" fill="#ff6b6b" />
          <text x="320" y="13.5" textAnchor="middle" fontSize="8.5" fill="#fff" fontFamily="system-ui,sans-serif" fontWeight="700">
            ₦142k this month ✨
          </text>
        </>
      )}
    </svg>
  );
};

// ── Animated inventory rows ───────────────────────────────────────
const InventoryRow = ({ emoji, name, pct, low, delay }) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setWidth(pct), delay);
    return () => clearTimeout(timeout);
  }, [pct, delay]);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 0", borderBottom: `1.5px dotted ${C.border}` }}>
      <span style={{ fontSize: "14px", width: "18px", textAlign: "center", flexShrink: 0 }}>{emoji}</span>
      <span style={{ fontSize: "11px", fontWeight: "600", color: C.brown, width: "64px", flexShrink: 0, fontFamily: "system-ui, sans-serif" }}>{name}</span>
      <div style={{ flex: 1, height: "5px", background: C.border, borderRadius: "3px", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${width}%`, background: low ? "#e05c5c" : C.coral, borderRadius: "3px", transition: "width 0.8s ease" }} />
      </div>
      <span style={{ fontSize: "9px", padding: "1px 6px", borderRadius: "20px", fontFamily: "system-ui, sans-serif", fontWeight: "600", flexShrink: 0, background: low ? "#fff0f0" : "#f0fdf4", color: low ? "#b91c1c" : "#166534", border: `1px solid ${low ? "#ffb3b3" : "#b3f0c9"}` }}>
        {low ? "Low" : "OK"}
      </span>
    </div>
  );
};

// ── The live dashboard preview ────────────────────────────────────
const DashboardPreview = () => (
  <div style={{ background: C.cardBg, border: `2px solid ${C.border}`, borderRadius: "24px", padding: "20px", boxShadow: "0 8px 40px rgba(61,43,31,0.10)", maxWidth: "680px", margin: "0 auto", fontFamily: "Georgia, serif" }}>

    {/* Mini navbar */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "14px", borderBottom: `2px solid ${C.border}`, marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{ width: "26px", height: "26px", background: C.coral, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", border: "2px solid #ffaaaa" }}>🏡</div>
        <span style={{ fontSize: "13px", fontWeight: "700", color: C.brown }}>HomeTrack</span>
      </div>
      <div style={{ display: "flex", gap: "4px" }}>
        {["Dashboard", "Purchases", "Inventory"].map((l) => (
          <span key={l} style={{ fontSize: "10px", padding: "3px 9px", borderRadius: "20px", background: l === "Dashboard" ? C.coral : "transparent", color: l === "Dashboard" ? "#fff" : C.gold, fontFamily: "Georgia, serif", border: l === "Dashboard" ? "none" : `1.5px solid transparent` }}>
            {l}
          </span>
        ))}
      </div>
      <span style={{ fontSize: "11px", color: C.tan, fontStyle: "italic" }}>🌸 Amarachi</span>
    </div>

    {/* Greeting */}
    <div style={{ marginBottom: "14px" }}>
      <div style={{ fontSize: "16px", fontWeight: "700", color: C.brown }}>Hello, Amarachi! 🌸</div>
      <div style={{ fontSize: "11px", color: C.tan, fontStyle: "italic" }}>Your home is mostly well-stocked — a few things need your attention.</div>
    </div>

    {/* KPI blobs */}
    <div style={{ display: "flex", gap: "10px", marginBottom: "16px", flexWrap: "wrap" }}>
      <BlobCard emoji="📅" label="Today"      value="₦4,500"   color="#e05c5c" bg="#fff0f0" borderColor="#ffb3b3" shape="60% 40% 55% 45%/45% 55% 45% 55%" />
      <BlobCard emoji="🌿" label="This week"  value="₦28,750"  color="#2d8a4e" bg="#f0fff4" borderColor="#b3f0c9" shape="45% 55% 40% 60%/55% 45% 55% 45%" />
      <BlobCard emoji="🗓" label="This month" value="₦142,300" color="#3b6fc4" bg="#f0f4ff" borderColor="#b3c9f0" shape="55% 45% 60% 40%/40% 60% 40% 60%" />
      <BlobCard emoji="🏦" label="All time"   value="₦890k"    color="#b8860b" bg="#fffdf0" borderColor="#f0e8b3" shape="40% 60% 45% 55%/60% 40% 60% 40%" />
    </div>

    {/* Chart + inventory */}
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
      <div style={{ background: "#fdf6e3", border: `2px solid ${C.border}`, borderRadius: "18px", padding: "14px" }}>
        <div style={{ fontSize: "12px", fontWeight: "700", color: C.brown, marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>📈 Spending over time</div>
        <DemoLineChart />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "5px" }}>
          {["Oct", "Nov", "Dec", "Jan", "Mar ✨", "Apr→"].map((m) => (
            <span key={m} style={{ fontSize: "9px", color: m.includes("✨") ? C.coral : C.tan, fontFamily: "system-ui, sans-serif", fontWeight: m.includes("✨") ? "700" : "400" }}>{m}</span>
          ))}
        </div>
      </div>

      <div style={{ background: "#fdf6e3", border: `2px solid ${C.border}`, borderRadius: "18px", padding: "14px" }}>
        <div style={{ fontSize: "12px", fontWeight: "700", color: C.brown, marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>🥦 Inventory status</div>
        <InventoryRow emoji="🌾" name="Rice"      pct={80} low={false} delay={600} />
        <InventoryRow emoji="🍅" name="Tomatoes"  pct={18} low={true}  delay={800} />
        <InventoryRow emoji="🥚" name="Eggs"      pct={12} low={true}  delay={1000} />
        <InventoryRow emoji="🥛" name="Milk"      pct={62} low={false} delay={1200} />
        <InventoryRow emoji="🫙" name="Veg. oil"  pct={14} low={true}  delay={1400} />
      </div>
    </div>

    {/* Restock alerts */}
    <div style={{ marginTop: "12px", background: "#fffaf0", border: "1.5px dashed #f5c842", borderRadius: "14px", padding: "10px 14px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      <span style={{ fontSize: "12px", fontWeight: "700", color: C.gold }}>🌱 Restock soon:</span>
      {["🍅 Tomatoes", "🥚 Eggs", "🫙 Veg. oil"].map((item) => (
        <span key={item} style={{ background: "#fef3c7", border: "1.5px solid #f5c842", borderRadius: "20px", padding: "2px 10px", fontSize: "11px", color: C.gold, fontFamily: "system-ui, sans-serif", fontWeight: "600" }}>
          {item}
        </span>
      ))}
    </div>
  </div>
);

// ── Main landing page component ───────────────────────────────────
export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ background: C.bg, minHeight: "100vh", fontFamily: "Georgia, serif" }}>

      {/* ── Navbar ─────────────────────────────────────────────── */}
      <nav style={{ background: C.cardBg, borderBottom: `2px solid ${C.border}`, padding: "0 24px", height: "62px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "34px", height: "34px", background: C.coral, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "17px", border: `2px solid ${C.coralLight}` }}>
            🏡
          </div>
          <div>
            <div style={{ fontSize: "16px", fontWeight: "700", color: C.brown }}>HomeTrack</div>
            <div style={{ fontSize: "10px", color: C.tan, fontStyle: "italic" }}>your little home helper</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button onClick={() => navigate("/login")} style={{ background: "transparent", border: `2px solid ${C.border}`, borderRadius: "20px", padding: "7px 18px", fontSize: "13px", color: C.gold, cursor: "pointer", fontFamily: "Georgia, serif" }}>
            Sign in
          </button>
          <button onClick={() => navigate("/register")} style={{ background: C.coral, border: "none", borderRadius: "20px", padding: "8px 20px", fontSize: "13px", fontWeight: "700", color: "#fff", cursor: "pointer", fontFamily: "Georgia, serif" }}>
            Get started free →
          </button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────── */}
      <div style={{ padding: "56px 24px 48px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        {/* Background blobs */}
        <div style={{ position: "absolute", width: "320px", height: "320px", background: "#ffecec", borderRadius: "60% 40% 55% 45%/45% 55% 45% 55%", top: "-100px", right: "-80px", zIndex: 0, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "260px", height: "260px", background: "#f0fff4", borderRadius: "45% 55% 40% 60%/55% 45% 55% 45%", bottom: "-60px", left: "-60px", zIndex: 0, pointerEvents: "none" }} />
        <div style={{ position: "absolute", width: "200px", height: "200px", background: "#f0f4ff", borderRadius: "55% 45% 60% 40%/40% 60% 40% 60%", top: "40px", left: "-40px", zIndex: 0, pointerEvents: "none" }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "inline-block", background: "#fff3cd", border: "1.5px dashed #f5c842", borderRadius: "20px", padding: "5px 16px", fontSize: "12px", color: C.gold, fontStyle: "italic", marginBottom: "20px" }}>
            🌿 Free to use · No credit card needed
          </div>
          <h1 style={{ fontSize: "clamp(28px, 6vw, 52px)", fontWeight: "700", color: C.brown, lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: "16px" }}>
            Never run out of<br />
            <span style={{ color: C.coral }}>what matters most</span>
          </h1>
          <p style={{ fontSize: "15px", color: C.tan, fontStyle: "italic", lineHeight: 1.8, maxWidth: "520px", margin: "0 auto 28px" }}>
            HomeTrack helps you track your groceries, monitor your spending, and always know what's in your home — so you can stop guessing and start living.
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "12px" }}>
            <button onClick={() => navigate("/register")} style={{ background: C.coral, border: "none", borderRadius: "20px", padding: "13px 28px", fontSize: "15px", fontWeight: "700", color: "#fff", cursor: "pointer", fontFamily: "Georgia, serif" }}>
              Start tracking for free 🏡
            </button>
            <button onClick={() => document.getElementById("demo").scrollIntoView({ behavior: "smooth" })} style={{ background: "transparent", border: `2px solid ${C.border}`, borderRadius: "20px", padding: "13px 28px", fontSize: "14px", color: C.gold, cursor: "pointer", fontFamily: "Georgia, serif" }}>
              See it in action →
            </button>
          </div>
          <p style={{ fontSize: "12px", color: C.tan, fontStyle: "italic" }}>
            Join families already tracking their homes with HomeTrack 🌸
          </p>
        </div>
      </div>

      {/* ── Stats blobs ────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))", gap: "12px", padding: "0 24px 48px", maxWidth: "700px", margin: "0 auto" }}>
        {[
          { emoji: "🛒", num: "6",  label: "powerful features",   bg: "#fff0f0", border: "#ffb3b3", shape: "60% 40% 55% 45%/45% 55% 45% 55%" },
          { emoji: "💱", num: "3",  label: "currencies supported", bg: "#f0fff4", border: "#b3f0c9", shape: "45% 55% 40% 60%/55% 45% 55% 45%" },
          { emoji: "📦", num: "∞",  label: "items to track",       bg: "#f0f4ff", border: "#b3c9f0", shape: "55% 45% 60% 40%/40% 60% 40% 60%" },
          { emoji: "😌", num: "0",  label: "surprises at the store",bg: "#fffdf0", border: "#f0e8b3", shape: "40% 60% 45% 55%/60% 40% 60% 40%" },
        ].map(({ emoji, num, label, bg, border, shape }) => (
          <div key={label} style={{ background: bg, border: `2px solid ${border}`, borderRadius: shape, padding: "18px", textAlign: "center" }}>
            <div style={{ fontSize: "20px", marginBottom: "6px" }}>{emoji}</div>
            <div style={{ fontSize: "26px", fontWeight: "800", color: C.brown, fontFamily: "system-ui, sans-serif" }}>{num}</div>
            <div style={{ fontSize: "11px", color: C.tan, fontStyle: "italic", marginTop: "4px" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Live demo ──────────────────────────────────────────── */}
      <div id="demo" style={{ padding: "0 24px 56px", maxWidth: "760px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px", fontFamily: "system-ui, sans-serif" }}>
            Live preview
          </div>
          <h2 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: "700", color: C.brown, marginBottom: "8px" }}>
            This is what your dashboard looks like 🌸
          </h2>
          <p style={{ fontSize: "13px", color: C.tan, fontStyle: "italic" }}>
            The chart and inventory bars animate when the page loads — just like the real app.
          </p>
        </div>
        <DashboardPreview />
      </div>

      {/* ── Features ───────────────────────────────────────────── */}
      <div style={{ padding: "0 24px 56px", maxWidth: "900px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px", fontFamily: "system-ui, sans-serif" }}>
            Everything you need
          </div>
          <h2 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: "700", color: C.brown, marginBottom: "8px" }}>
            Your home, fully tracked 🌿
          </h2>
          <p style={{ fontSize: "13px", color: C.tan, fontStyle: "italic" }}>
            Six features that work together to keep your home running smoothly.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px" }}>
          {[
            { emoji: "🛒", title: "Purchase tracking",     desc: "Log every grocery run with item, quantity, price and currency. Backdate anything you forgot." },
            { emoji: "📦", title: "Inventory monitoring",  desc: "Stock levels update automatically. Visual progress bars show what's running low at a glance." },
            { emoji: "🔥", title: "Consumption insights",  desc: "Log what you use. The app learns how fast you go through each item and predicts when you'll run out." },
            { emoji: "🍳", title: "Recipe shopping lists", desc: "Save your favourite dishes. Get an instant shopping list showing exactly what you still need to buy." },
            { emoji: "📊", title: "Spending dashboard",    desc: "See spending today, this week, this month and all time. A line chart shows your 6-month trend." },
            { emoji: "🌱", title: "Restock alerts",        desc: "Set a threshold for each item. Get alerted the moment stock drops below your minimum level." },
          ].map(({ emoji, title, desc }) => (
            <div key={title} style={{ background: C.cardBg, border: `2px solid ${C.border}`, borderRadius: "22px", padding: "22px" }}>
              <div style={{ fontSize: "26px", marginBottom: "10px" }}>{emoji}</div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: C.brown, marginBottom: "6px" }}>{title}</div>
              <div style={{ fontSize: "12px", color: C.tan, lineHeight: "1.7", fontStyle: "italic" }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── How it works ───────────────────────────────────────── */}
      <div style={{ background: C.cardBg, borderTop: `2px solid ${C.border}`, borderBottom: `2px solid ${C.border}`, padding: "48px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "11px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "10px", fontFamily: "system-ui, sans-serif" }}>
            How it works
          </div>
          <h2 style={{ fontSize: "clamp(22px, 4vw, 30px)", fontWeight: "700", color: C.brown, marginBottom: "8px" }}>
            Up and running in minutes ✨
          </h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px", maxWidth: "860px", margin: "0 auto" }}>
          {[
            { num: "1", title: "Create your account",       desc: "Sign up free. Your data is completely private — only you can see it." },
            { num: "2", title: "Add your items",            desc: "Build your list of groceries and household items with units and restock thresholds." },
            { num: "3", title: "Log your purchases",        desc: "Every time you shop, log what you bought. Your inventory updates automatically." },
            { num: "4", title: "Let HomeTrack do the rest", desc: "Get alerts when stock runs low. See spending trends. Never be caught off guard again." },
          ].map(({ num, title, desc }) => (
            <div key={num} style={{ textAlign: "center", padding: "8px" }}>
              <div style={{ width: "36px", height: "36px", background: C.coral, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: "700", color: "#fff", margin: "0 auto 12px", fontFamily: "system-ui, sans-serif" }}>
                {num}
              </div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: C.brown, marginBottom: "6px" }}>{title}</div>
              <div style={{ fontSize: "12px", color: C.tan, fontStyle: "italic", lineHeight: "1.6" }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Final CTA ──────────────────────────────────────────── */}
      <div style={{ padding: "56px 24px", textAlign: "center" }}>
        <div style={{ background: C.brown, borderRadius: "28px", padding: "48px 32px", maxWidth: "560px", margin: "0 auto", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: "200px", height: "200px", background: "rgba(255,107,107,0.15)", borderRadius: "60% 40% 55% 45%/45% 55% 45% 55%", top: "-40px", right: "-40px", pointerEvents: "none" }} />
          <h2 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: "700", color: "#f5edd8", marginBottom: "10px", position: "relative" }}>
            Ready to take control of your home? 🏡
          </h2>
          <p style={{ fontSize: "13px", color: "#a89070", fontStyle: "italic", marginBottom: "24px", lineHeight: "1.7", position: "relative" }}>
            Join HomeTrack today. It's free, it's simple, and your future self will thank you when you never run out of rice again.
          </p>
          <button onClick={() => navigate("/register")} style={{ background: C.coral, border: "none", borderRadius: "20px", padding: "14px 32px", fontSize: "15px", fontWeight: "700", color: "#fff", cursor: "pointer", fontFamily: "Georgia, serif", position: "relative" }}>
            Create your free account →
          </button>
          <p style={{ fontSize: "12px", color: "#7d6a52", fontStyle: "italic", marginTop: "12px", position: "relative" }}>
            No credit card. No stress. Just a happier home. 🌸
          </p>
        </div>
      </div>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div style={{ background: C.cardBg, borderTop: `2px solid ${C.border}`, padding: "24px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", fontWeight: "700", color: C.brown }}>
          <span style={{ fontSize: "18px" }}>🏡</span> HomeTrack
        </div>
        <div style={{ display: "flex", gap: "16px" }}>
          {[["Sign in", "/login"], ["Register", "/register"], ["About", "/about"]].map(([label, path]) => (
            <button key={label} onClick={() => navigate(path)} style={{ background: "none", border: "none", fontSize: "12px", color: C.tan, fontStyle: "italic", cursor: "pointer", fontFamily: "Georgia, serif" }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: "11px", color: "#d6c4a8", fontStyle: "italic" }}>
          Built with 🌿 and lots of jollof rice.
        </div>
      </div>
    </div>
  );
}