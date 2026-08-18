// src/components/GroupDetail.tsx
import { useState } from "react";
import AddMemberModal from "./AddMemberModal";
import PayShareModal from "./PayShareModal"; // ← BARU
import { IconPlus, IconLogout, IconUsers } from "./Icons";
import type { Group, Member } from "./Groups";
import type { Activity } from "../App";

interface GroupDetailProps {
  address: string | null;
  group: Group;
  onAddMember: (groupId: string, member: Member) => void;
  onMarkPaid: (groupId: string, memberAddress: string) => void; // ← BARU
  onDisconnect: () => void;
  onGoHome: () => void;
  onGoGroups: () => void;
  onGoActivity: () => void;
  onActivityAdd?: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
}

function shortAddr(addr: string) {
  if (!addr || addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function GroupDetail({
  address,
  group,
  onAddMember,
  onMarkPaid, // ← BARU
  onDisconnect,
  onGoHome,
  onGoGroups,
  onGoActivity,
  onActivityAdd,
}: GroupDetailProps) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [payTarget, setPayTarget] = useState<Member | null>(null); // ← BARU

  const totalMembers = group.members.length;
  const paidCount = group.members.filter((m) => m.paid).length;
  const yourShare =
    totalMembers > 0 ? group.totalShare / totalMembers : 0;

  const handleMemberAdded = (member: Member) => {
    onAddMember(group.id, member);
  };

  return (
    <div className="dashboard group-detail-page">
      {/* ===== NAVBAR ===== */}
      <header className="navbar dashboard-navbar">
        <div className="brand">
          <div className="brand-icon">
            <span className="brand-bars" />
          </div>
          <h1>SplitBill</h1>
        </div>

        <nav className="dashboard-tabs">
          <button className="dashboard-tab" onClick={onGoHome}>
            Dashboard
          </button>
          <button className="dashboard-tab active" onClick={onGoGroups}>
            Groups
          </button>
          <button className="dashboard-tab" onClick={onGoActivity}>
            Activity
          </button>
        </nav>

        <div className="dashboard-account">
          <span className="pulse-dot" />
          <span className="account-label">Connected</span>
          <span className="account-address">
            {address ? shortAddr(address) : "GABCD...7XYZ"}
          </span>
          <button
            className="account-logout"
            onClick={onDisconnect}
            aria-label="Disconnect"
          >
            <IconLogout />
          </button>
        </div>
      </header>

      {/* ===== BREADCRUMB ===== */}
      <div className="group-breadcrumb">
        <button className="crumb-link" onClick={onGoGroups}>
          Groups
        </button>
        <span className="crumb-sep">›</span>
        <span className="crumb-current">{group.name}</span>
      </div>

      {/* ===== HEADER ===== */}
      <div className="group-detail-header">
        <h1 className="group-detail-title">{group.name}</h1>
        <button
          className="btn-primary btn-add-member"
          onClick={() => setShowAddMember(true)}
        >
          <IconPlus /> Add Member
        </button>
      </div>

      {/* ===== CONTENT GRID ===== */}
      <div className="group-detail-grid">
        {/* MEMBERS */}
        <div className="members-card">
          <h2>Members</h2>
          {group.members.length === 0 ? (
            <p className="members-empty">
              No members yet. Add the first one to start splitting.
            </p>
          ) : (
            <ul className="member-list">
              {group.members.map((m) => {
                const isCurrentUser = address && m.address === address;
                return (
                  <li key={m.address} className="member-row">
                    <span className="member-avatar-lg">
                      <IconUsers />
                    </span>
                    <div className="member-row-identity">
                      <strong>{shortAddr(m.address)}</strong>
                      <span className="member-row-addr">{m.address}</span>
                    </div>
                    <span className="member-row-share">
                      {m.share.toLocaleString()} XLM
                    </span>
                    <span
                      className={`status-badge ${
                        m.paid ? "status-paid" : "status-pending"
                      }`}
                    >
                      {m.paid ? "Paid" : "Pending"}
                    </span>
                    {!m.paid && isCurrentUser && (
                      <button
                        className="btn-pay-share"
                        onClick={() => setPayTarget(m)}
                      >
                        Pay
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* SUMMARY */}
        <div className="summary-card">
          <h2>Group Summary</h2>
          <div className="summary-row">
            <span>Total Members</span>
            <strong>{totalMembers}</strong>
          </div>
          <div className="summary-row">
            <span>Total Bill</span>
            <strong>{group.totalShare.toLocaleString()} XLM</strong>
          </div>
          <div className="summary-row">
            <span>Your Share</span>
            <strong className="share-value">
              {yourShare.toLocaleString()} XLM
            </strong>
          </div>

          <div className="summary-progress-row">
            <span>Progress</span>
            <span
              className={
                totalMembers > 0 && paidCount === totalMembers
                  ? "progress-complete-text"
                  : "progress-text"
              }
            >
              {paidCount}/{totalMembers} Paid
            </span>
          </div>
          <div className="progress-track">
            <div
              className={`progress-fill ${
                totalMembers > 0 && paidCount === totalMembers
                  ? "is-complete"
                  : ""
              }`}
              style={{
                width:
                  totalMembers > 0
                    ? `${(paidCount / totalMembers) * 100}%`
                    : "0%",
              }}
            />
          </div>
        </div>
      </div>

      {/* ===== FOOTER ===== */}
      <footer className="app-footer groups-footer">
        <span className="footer-brand">Built on Stellar Soroban</span>
        <div className="footer-links">
          <a
            href="https://github.com/yyred-max/Stellar-meetup"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source Code
          </a>
          <a
            href="https://developers.stellar.org/docs/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </footer>

      {/* ===== MODALS ===== */}
      {showAddMember && (
        <AddMemberModal
          groupName={group.name}
          currentTotal={group.totalShare}
          onClose={() => setShowAddMember(false)}
          onAdded={handleMemberAdded}
          onViewGroup={() => setShowAddMember(false)}
          onActivityAdd={onActivityAdd}
        />
      )}

      {payTarget && (
        <PayShareModal
          groupName={group.name}
          memberAddress={payTarget.address}
          payerAddress={address}
          shareAmount={payTarget.share}
          onClose={() => setPayTarget(null)}
          onPaid={() => onMarkPaid(group.id, payTarget.address)}
        />
      )}
    </div>
  );
}