import { useAuth } from "../context/AuthContext.jsx";

const C = {
  cardBg: "#fff9f0",
  border: "#f5e6c8",
  coral: "#ff6b6b",
  brown: "#3d2b1f",
  tan: "#b8956a",
  muted: "#8b7355",
};

const Card = ({ children, style = {} }) => (
  <div style={{ background: C.cardBg, border: `2px solid ${C.border}`, borderRadius: "24px", padding: "28px", marginBottom: "20px", ...style }}>
    {children}
  </div>
);

const Feature = ({ emoji, title, description }) => (
  <div style={{ display: "flex", gap: "16px", padding: "14px 0", borderBottom: `1.5px dotted ${C.border}` }}>
    <div style={{ fontSize: "24px", flexShrink: 0, marginTop: "2px" }}>{emoji}</div>
    <div>
      <p style={{ fontSize: "14px", fontWeight: "700", color: C.brown, marginBottom: "4px", fontFamily: "system-ui, sans-serif" }}>{title}</p>
      <p style={{ fontSize: "13px", color: C.tan, lineHeight: "1.6", fontStyle: "italic" }}>{description}</p>
    </div>
  </div>
);

const Tech = ({ name, description }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1.5px dotted ${C.border}`, flexWrap: "wrap", gap: "8px" }}>
    <span style={{ fontSize: "13px", fontWeight: "700", color: C.brown, fontFamily: "system-ui, sans-serif", background: "#fdf6e3", border: `1.5px solid ${C.border}`, borderRadius: "20px", padding: "3px 12px" }}>{name}</span>
    <span style={{ fontSize: "12px", color: C.tan, fontStyle: "italic" }}>{description}</span>
  </div>
);

export default function About() {
  const { user } = useAuth();

  return (
    <div style={{ fontFamily: "Georgia, serif" }}>

      {/* Hero section */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
          <div style={{ width: "52px", height: "52px", background: C.coral, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", border: "2px solid #ffaaaa", flexShrink: 0 }}>
            🏡
          </div>
          <div>
            <h1 style={{ fontSize: "clamp(22px, 4vw, 28px)", fontWeight: "700", color: C.brown, marginBottom: "2px" }}>HomeTrack</h1>
            <p style={{ fontSize: "13px", color: C.tan, fontStyle: "italic" }}>your little home helper</p>
          </div>
        </div>
        <p style={{ fontSize: "15px", color: C.brown, lineHeight: "1.8", maxWidth: "640px" }}>
          HomeTrack is a personal home inventory and grocery tracking app that helps you stay on top of what you have, what you've spent, and what you need — all in one place.
        </p>
      </div>

      {/* What it does */}
      <Card>
        <p style={{ fontSize: "16px", fontWeight: "700", color: C.brown, marginBottom: "4px" }}>✨ What HomeTrack does</p>
        <p style={{ fontSize: "13px", color: C.tan, fontStyle: "italic", marginBottom: "16px" }}>Six features, one simple goal — never be caught off guard at home.</p>

        <Feature
          emoji="🏷"
          title="Items"
          description="Build a master list of everything you buy and use at home. Set a restock threshold for each item so the app knows when to alert you."
        />
        <Feature
          emoji="🛒"
          title="Purchases"
          description="Log every grocery run with item, quantity, price and currency. Backdate purchases you forgot to log. Your spending history is always there."
        />
        <Feature
          emoji="📦"
          title="Inventory"
          description="Your stock levels update automatically every time you log a purchase or consumption. Visual progress bars show at a glance what's running low."
        />
        <Feature
          emoji="🔥"
          title="Consumption"
          description="Log what you use at home — cooking, cleaning, eating. The more you log, the smarter the app gets at predicting when you'll run out."
        />
        <Feature
          emoji="🍳"
          title="Recipes"
          description="Save recipes like Jollof Rice or Egusi Soup with their ingredients. Generate a shopping list for any recipe that compares what you need against what you already have."
        />
        <Feature
          emoji="📊"
          title="Dashboard"
          description="See your spending today, this week, this month and all time — across multiple currencies. A line chart shows your spending trend over the last six months."
        />
      </Card>

      {/* How it's built */}
      {/* <Card>
        <p style={{ fontSize: "16px", fontWeight: "700", color: C.brown, marginBottom: "4px" }}>🔧 How it's built</p>
        <p style={{ fontSize: "13px", color: C.tan, fontStyle: "italic", marginBottom: "16px" }}>A full-stack JavaScript application, built from scratch.</p>

        <p style={{ fontSize: "12px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px", fontFamily: "system-ui, sans-serif" }}>Backend</p>
        <Tech name="Node.js + Express.js" description="REST API server — handles all requests and business logic" />
        <Tech name="Sequelize ORM" description="Manages database models and queries in JavaScript" />
        <Tech name="PostgreSQL" description="Relational database — stores all your home data" />
        <Tech name="JWT + bcrypt" description="Secure authentication — passwords hashed, sessions tokenised" />

        <p style={{ fontSize: "12px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: "16px 0 10px", fontFamily: "system-ui, sans-serif" }}>Frontend</p>
        <Tech name="React + Vite" description="Fast, modern frontend framework" />
        <Tech name="React Router" description="Client-side navigation between pages" />
        <Tech name="Recharts" description="Line chart for the spending history" />
        <Tech name="Axios" description="HTTP client — talks to the backend API" />

        <p style={{ fontSize: "12px", fontWeight: "700", color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", margin: "16px 0 10px", fontFamily: "system-ui, sans-serif" }}>Hosting</p>
        <Tech name="Render" description="Backend API + PostgreSQL database" />
        <Tech name="Vercel" description="React frontend — global CDN" />
      </Card> */}

      {/* Multi-user */}
      <Card>
        <p style={{ fontSize: "16px", fontWeight: "700", color: C.brown, marginBottom: "16px" }}>👥 Multiple accounts, separate data</p>
        <p style={{ fontSize: "14px", color: C.tan, lineHeight: "1.8", fontStyle: "italic" }}>
          Every account on HomeTrack is completely private. Your items, purchases, recipes and consumption logs are only visible to you — no one else can see your data. You can create an account, invite a family member to create their own, and each of you will have a completely separate home inventory.
        </p>
      </Card>

      {/* Currencies */}
      <Card>
        <p style={{ fontSize: "16px", fontWeight: "700", color: C.brown, marginBottom: "16px" }}>💱 Multi-currency support</p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {[
            { symbol: "₦", name: "Nigerian Naira", code: "NGN", bg: "#fff0f0", border: "#ffb3b3", color: "#b91c1c" },
            { symbol: "$", name: "US Dollar",      code: "USD", bg: "#f0fdf4", border: "#b3f0c9", color: "#166534" },
            { symbol: "€", name: "Euro",           code: "EUR", bg: "#f0f4ff", border: "#b3c9f0", color: "#1d4ed8" },
          ].map((c) => (
            <div key={c.code} style={{ background: c.bg, border: `2px solid ${c.border}`, borderRadius: "18px", padding: "16px 20px", textAlign: "center", minWidth: "120px" }}>
              <div style={{ fontSize: "28px", fontWeight: "800", color: c.color, fontFamily: "system-ui, sans-serif" }}>{c.symbol}</div>
              <div style={{ fontSize: "13px", fontWeight: "700", color: C.brown, marginTop: "4px", fontFamily: "system-ui, sans-serif" }}>{c.code}</div>
              <div style={{ fontSize: "11px", color: C.tan, fontStyle: "italic" }}>{c.name}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: "13px", color: C.tan, fontStyle: "italic", marginTop: "14px" }}>
          Each purchase can be logged in a different currency. Spending totals are grouped by currency so your ₦ and $ are never mixed together.
        </p>
      </Card>

      {/* Footer note */}
      <div style={{ textAlign: "center", padding: "20px 0 8px", color: C.tan, fontSize: "13px", fontStyle: "italic" }}>
        Built with 🌿 and lots of jollof rice.
        {user && <span style={{ marginLeft: "8px" }}>Logged in as {user.name}.</span>}
      </div>
    </div>
  );
}