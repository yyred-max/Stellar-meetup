// src/components/Dashboard.tsx
import { useState } from "react";
import {
  IconPlus,
  IconLogout,
  IconCreditCard,
  IconUserPlus,
} from "./Icons";

interface DashboardProps {
  address: string | null;
  userName?: string;
  onDisconnect: () => void;
  onGoGroups: () => void;
}

type GroupStatus = { paid: number; pending: number; completed: boolean };

interface Group {
  name: string;
  members: number;
  total: number;
  yourShare: number;
  status: GroupStatus;
  percent: number;
}

interface Activity {
  icon: "pay" | "add";
  title: string;
  sub: string;
  time: string;
}

const groups: Group[] = [
  {
    name: "Dinner at Surabaya",
    members: 5,
    total: 125.0,
    yourShare: 25.0,
    status: { paid: 3, pending: 2, completed: false },
    percent: 60,
  },
  {
    name: "Weekend Trip",
    members: 4,
    total: 240.0,
    yourShare: 60.0,
    status: { paid: 2, pending: 2, completed: false },
    percent: 50,
  },
  {
    name: "Office Lunch",
    members: 6,
    total: 90.0,
    yourShare: 15.0,
    status: { paid: 6, pending: 0, completed: true },
    percent: 100,
  },
];

const activities: Activity[] = [
  { icon: "pay", title: "Yuliana paid 25 XLM", sub: "Dinner at Surabaya • 2 mins ago", time: "" },
  { icon: "add", title: "You added Rizky", sub: "Weekend Trip • 15 mins ago", time: "" },
  { icon: "add", title: 'You created "Office Lunch"', sub: "Today, 09:42", time: "" },
  { icon: "pay", title: "Andi paid 25 XLM", sub: "Dinner at Surabaya • Today, 09:35", time: "" },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 11) return "Good morning";
  if (hour < 15) return "Good afternoon";
  if (hour < 19) return "Good evening";
  return "Good night";
}

export default function Dashboard({ address, userName = "Yuli", onDisconnect, onGoGroups }: DashboardProps) {
  const [tab, setTab] = useState<"Dashboard" | "Groups" | "Activity">("Dashboard");

  return (
    <div className="dashboard">
      {/* ===== NAVBAR ===== */}
      <header className="navbar dashboard-navbar">
        <div className="brand">
          <div className="brand-icon">
            <span className="brand-bars" />
          </div>
          <h1>SplitBill</h1>
        </div>

        <nav className="dashboard-tabs">
          {(["Dashboard", "Groups", "Activity"] as const).map((t) => (
            <button
              key={t}
              className={`dashboard-tab ${tab === t ? "active" : ""}`}
              onClick={() => (t === "Groups" ? onGoGroups() : setTab(t))}
            >
              {t}
            </button>
          ))}
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

      {tab !== "Dashboard" ? (
        <div className="dashboard-placeholder">
          <p>{tab} belum tersedia — segera hadir.</p>
        </div>
      ) : (
        <>
          {/* ===== GREETING ===== */}
          <section className="dashboard-greeting">
            <div>
              <p className="greeting-title">
                {getGreeting()}, {userName} 👋
              </p>
              <p className="greeting-sub">Manage shared bills easily and transparently using Stellar.</p>
            </div>
            <button className="btn-primary btn-create-group">
              <IconPlus /> Create Group
            </button>
          </section>

          {/* ===== STAT CARDS ===== */}
          <section className="stat-grid">
            <div className="stat-card">
              <span className="stat-label">TOTAL GROUPS</span>
              <strong className="stat-value">04</strong>
            </div>
            <div className="stat-card">
              <span className="stat-label">TOTAL MEMBERS</span>
              <strong className="stat-value">12</strong>
            </div>
            <div className="stat-card outstanding">
              <span className="stat-label">TOTAL OUTSTANDING</span>
              <strong className="stat-value">24.50 XLM</strong>
            </div>
            <div className="stat-card paid">
              <span className="stat-label">TOTAL PAID</span>
              <strong className="stat-value">68.20 XLM</strong>
            </div>
          </section>

          {/* ===== GROUPS + ACTIVITY ===== */}
          <section className="dashboard-content">
            <div className="dashboard-groups">
              <h2>Your Groups</h2>
              <div className="group-list">
                {groups.map((g) => (
                  <div className="group-card" key={g.name}>
                    <div className="group-card-top">
                      <div>
                        <span className="group-name">
                          {g.name}
                          {g.status.completed && <span className="badge-completed">Completed</span>}
                        </span>
                        <span className="group-meta">
                          {g.members} members • Total: {g.total.toFixed(2)} XLM
                        </span>
                      </div>
                      <div className="group-share">
                        <span>Your Share</span>
                        <strong className={g.status.completed ? "share-paid" : "share-pending"}>
                          {g.yourShare.toFixed(2)} XLM
                        </strong>
                      </div>
                    </div>

                    <div className="group-status-row">
                      <span>
                        Status: {g.status.paid} Paid
                        {g.status.pending > 0 && `, ${g.status.pending} Pending`}
                      </span>
                      <span>{g.percent}%</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className={`progress-fill ${g.percent === 100 ? "is-complete" : ""}`}
                        style={{ width: `${g.percent}%` }}
                      />
                    </div>

                    <button className="btn-secondary btn-view-group">View Group</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="dashboard-activity">
              <h2>Recent Activity</h2>
              <div className="activity-feed">
                {activities.map((a, i) => (
                  <div className="activity-item" key={i}>
                    <span className={`activity-icon ${a.icon}`}>
                      {a.icon === "pay" ? <IconCreditCard /> : <IconUserPlus />}
                    </span>
                    <div>
                      <p className="activity-title">{a.title}</p>
                      <p className="activity-sub">{a.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
