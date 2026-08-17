// src/components/Activity.tsx
import { useMemo, useState } from "react";
import {
  IconLogout,
  IconSearch,
  IconCheck,
  IconUser,
  IconFolder,
  IconAlertCircle,
} from "./Icons";

interface ActivityProps {
  address: string | null;
  onDisconnect: () => void;
  onGoDashboard: () => void;
  onGoGroups: () => void;
}

type ActivityKind = "payment" | "member_joined" | "group_created" | "payment_failed";
type Category = "All Activity" | "Payments" | "Group Updates" | "System";

interface ActivityEntry {
  id: string;
  date: string;
  kind: ActivityKind;
  text: string;
  highlight?: string;
  suffix?: string;
  subtext?: string;
  time: string;
  searchable: string;
}

const entries: ActivityEntry[] = [
  {
    id: "1",
    date: "Today",
    kind: "payment",
    text: "Yuliana paid",
    highlight: "25.00 XLM",
    suffix: "for Dinner at Surabaya",
    subtext: "Hash: a1b2...c3d4",
    time: "2 mins ago",
    searchable: "yuliana dinner at surabaya",
  },
  {
    id: "2",
    date: "Today",
    kind: "member_joined",
    text: "Marcus joined Weekend Trip",
    time: "1 hr ago",
    searchable: "marcus weekend trip",
  },
  {
    id: "3",
    date: "Yesterday",
    kind: "group_created",
    text: "New group Office Lunch was created",
    time: "09:42 AM",
    searchable: "office lunch",
  },
  {
    id: "4",
    date: "Yesterday",
    kind: "payment",
    text: "You paid",
    highlight: "120.50 XLM",
    suffix: "to settle Weekend Trip",
    subtext: "Hash: x9y8...z7w6",
    time: "08:15 AM",
    searchable: "weekend trip",
  },
  {
    id: "5",
    date: "October 24",
    kind: "payment_failed",
    text: "Payment failed for Coffee Run",
    subtext: "Insufficient balance",
    time: "02:30 PM",
    searchable: "coffee run",
  },
];

const categoryMap: Record<Category, ActivityKind[] | null> = {
  "All Activity": null,
  Payments: ["payment", "payment_failed"],
  "Group Updates": ["member_joined", "group_created"],
  System: [],
};

function iconFor(kind: ActivityKind) {
  switch (kind) {
    case "payment":
      return { icon: <IconCheck />, className: "icon-success" };
    case "member_joined":
      return { icon: <IconUser />, className: "icon-neutral" };
    case "group_created":
      return { icon: <IconFolder />, className: "icon-purple" };
    case "payment_failed":
      return { icon: <IconAlertCircle />, className: "icon-danger" };
  }
}

export default function Activity({ address, onDisconnect, onGoDashboard, onGoGroups }: ActivityProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("All Activity");

  const filtered = useMemo(() => {
    const allowedKinds = categoryMap[category];
    return entries.filter((e) => {
      const matchesSearch = e.searchable.includes(search.toLowerCase());
      const matchesCategory = allowedKinds === null || allowedKinds.includes(e.kind);
      return matchesSearch && matchesCategory;
    });
  }, [search, category]);

  const grouped = useMemo(() => {
    const map = new Map<string, ActivityEntry[]>();
    filtered.forEach((e) => {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    });
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <div className="dashboard activity-page">
      {/* ===== NAVBAR ===== */}
      <header className="navbar dashboard-navbar">
        <div className="brand">
          <div className="brand-icon">
            <span className="brand-bars" />
          </div>
          <h1>SplitBill</h1>
        </div>

        <nav className="dashboard-tabs">
          <button className="dashboard-tab" onClick={onGoDashboard}>Dashboard</button>
          <button className="dashboard-tab" onClick={onGoGroups}>Groups</button>
          <button className="dashboard-tab active">Activity</button>
        </nav>

        <div className="dashboard-account">
          <span className="pulse-dot" />
          <span className="account-label">Connected</span>
          <span className="account-address">
            {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "GABCD...7XYZ"}
          </span>
          <button className="account-logout" onClick={onDisconnect} aria-label="Disconnect">
            <IconLogout />
          </button>
        </div>
      </header>

      {/* ===== HEADER ===== */}
      <section className="activity-header">
        <h1 className="activity-title">Recent Activity</h1>
        <p className="activity-sub">A complete history of your payments and group updates.</p>
      </section>

      {/* ===== SEARCH + FILTERS ===== */}
      <section className="activity-controls">
        <div className="activity-search">
          <IconSearch />
          <input
            type="text"
            placeholder="Search by group or member name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="activity-filters">
          {(["All Activity", "Payments", "Group Updates", "System"] as const).map((c) => (
            <button
              key={c}
              className={`activity-filter-pill ${category === c ? "active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* ===== TIMELINE ===== */}
      {grouped.length === 0 ? (
        <p className="groups-empty">Tidak ada aktivitas yang cocok.</p>
      ) : (
        <section className="activity-timeline">
          {grouped.map(([date, items]) => (
            <div className="activity-group" key={date}>
              <p className="activity-date">
                <span className="date-bar" /> {date}
              </p>
              <div className="activity-card">
                {items.map((e) => {
                  const { icon, className } = iconFor(e.kind);
                  return (
                    <div className="activity-row" key={e.id}>
                      <span className={`activity-row-icon ${className}`}>{icon}</span>
                      <div className="activity-row-body">
                        <p className="activity-row-text">
                          {e.text}{" "}
                          {e.highlight && <span className="activity-highlight">{e.highlight}</span>}{" "}
                          {e.suffix}
                        </p>
                        {e.subtext && <p className="activity-row-hash">{e.subtext}</p>}
                      </div>
                      <span className="activity-row-time">{e.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ===== FOOTER ===== */}
      <footer className="app-footer groups-footer">
        <span className="footer-brand">Built on Stellar Soroban</span>
        <div className="footer-links">
          <a href="https://github.com/yyred-max/Stellar-meetup" target="_blank" rel="noopener noreferrer">
            Source Code
          </a>
          <a href="https://developers.stellar.org/docs/" target="_blank" rel="noopener noreferrer">
            Documentation
          </a>
        </div>
      </footer>
    </div>
  );
}

