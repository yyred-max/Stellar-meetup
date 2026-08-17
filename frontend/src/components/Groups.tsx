// src/components/Groups.tsx
import { useMemo, useState } from "react";
import { IconPlus, IconLogout, IconSearch, IconChevronDown, IconUsers } from "./Icons";

interface GroupsProps {
  address: string | null;
  onDisconnect: () => void;
  onGoHome: () => void;
}

type Status = "Active" | "Pending" | "Completed";

interface GroupItem {
  name: string;
  status: Status;
  members: number;
  total: number;
  share: number;
  percent: number;
}

const allGroups: GroupItem[] = [
  { name: "Dinner at Surabaya", status: "Active", members: 5, total: 250, share: 50, percent: 60 },
  { name: "Weekend Trip", status: "Pending", members: 8, total: 1200, share: 150, percent: 25 },
  { name: "Office Lunch", status: "Completed", members: 4, total: 120, share: 30, percent: 100 },
  { name: "Monthly Rent", status: "Active", members: 3, total: 4500, share: 1500, percent: 85 },
];

export default function Groups({ address, onDisconnect, onGoHome }: GroupsProps) {
  const [tab, setTab] = useState<"Dashboard" | "Groups" | "Activity">("Groups");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All Groups" | Status>("All Groups");

  const filtered = useMemo(() => {
    return allGroups.filter((g) => {
      const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
      const matchesFilter = filter === "All Groups" || g.status === filter;
      return matchesSearch && matchesFilter;
    });
  }, [search, filter]);

  return (
    <div className="dashboard groups-page">
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
              onClick={() => (t === "Dashboard" ? onGoHome() : setTab(t))}
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

      {tab !== "Groups" ? (
        <div className="dashboard-placeholder">
          <p>{tab} belum tersedia — segera hadir.</p>
        </div>
      ) : (
        <>
          {/* ===== HEADER + CONTROLS ===== */}
          <section className="groups-header">
            <div>
              <h1 className="groups-title">Your Groups</h1>
              <p className="groups-sub">Manage and track all your shared expenses.</p>
            </div>

            <div className="groups-controls">
              <div className="groups-search">
                <IconSearch />
                <input
                  type="text"
                  placeholder="Search groups..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="groups-select-wrap">
                <select
                  className="groups-select"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as typeof filter)}
                >
                  <option>All Groups</option>
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Completed</option>
                </select>
                <IconChevronDown />
              </div>

              <button className="btn-primary btn-new-group">
                <IconPlus /> New Group
              </button>
            </div>
          </section>

          {/* ===== GRID ===== */}
          {filtered.length === 0 ? (
            <p className="groups-empty">Tidak ada grup yang cocok dengan pencarian/filter.</p>
          ) : (
            <section className="groups-grid">
              {filtered.map((g) => (
                <div
                  className={`group-card ${g.status === "Completed" ? "completed" : ""}`}
                  key={g.name}
                >
                  <div className="group-card-top">
                    <div>
                      <span className="group-name-lg">{g.name}</span>
                      <span className="group-meta">
                        <IconUsers /> {g.members} members
                      </span>
                    </div>
                    <span className={`status-pill status-${g.status.toLowerCase()}`}>{g.status}</span>
                  </div>

                  <div className="group-amounts">
                    <div>
                      <span>TOTAL AMOUNT</span>
                      <strong>{g.total.toLocaleString()} XLM</strong>
                    </div>
                    <div className="align-right">
                      <span>YOUR SHARE</span>
                      <strong className="share-value">{g.share.toLocaleString()} XLM</strong>
                    </div>
                  </div>

                  <div className="group-status-row">
                    <span>Progress</span>
                    <span className={g.percent === 100 ? "progress-complete-text" : "progress-text"}>
                      {g.percent}% Paid
                    </span>
                  </div>
                  <div className="progress-track">
                    <div
                      className={`progress-fill ${g.percent === 100 ? "is-complete" : ""}`}
                      style={{ width: `${g.percent}%` }}
                    />
                  </div>

                  <button className="btn-view-details">View Details</button>
                </div>
              ))}
            </section>
          )}
        </>
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
