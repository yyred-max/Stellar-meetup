// src/App.tsx
import { useRef, useState, useEffect } from "react";
import WalletConnect, { WalletConnectHandle, WalletStatus } from "./components/WalletConnect";
import Dashboard from "./components/Dashboard";
import Groups from "./components/Groups";
import ActivityPage from "./components/Activity";
import GroupDetail from "./components/GroupDetail";
import { getGroups, getGroupsByMember, getMembers } from "./lib/contract";
import {
  IconWallet,
  IconCheck,
  IconWarning,
  IconClose,
  IconSpinner,
  IconSplit,
  IconEye,
  IconBolt,
  IconUser,
} from "./components/Icons";
import "./App.css";

// ============================================
//  TIPE DATA
// ============================================
export interface Member {
  address: string;
  share: number;
  paid: boolean;
}

export interface Group {
  id: string;
  name: string;
  owner: string;
  totalShare: number;
  members: Member[];
}

export interface Activity {
  id: string;
  type: 'group_created' | 'member_added' | 'share_paid';
  title: string;
  description?: string;
  timestamp: string;
}

type MemberStatus = "paid" | "pending" | "unpaid";

interface DemoMember {
  name: string;
  share: number;
  status: MemberStatus;
}

function App() {
  const walletRef = useRef<WalletConnectHandle>(null);

  // ===== STATE =====
  const [walletStatus, setWalletStatus] = useState<WalletStatus>("idle");
  const [address, setAddress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  // ===== PAGE STATE =====
  const [page, setPage] = useState<"landing" | "dashboard" | "groups" | "activity" | "groupDetail">("landing");

  // ===== SOURCE DATA =====
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);

  // ===== FUNGSI LOAD DATA DARI BLOCKCHAIN DENGAN FALLBACK LOCALSTORAGE =====
  const loadGroups = async () => {
    if (!address) {
      console.warn("⛔ loadGroups: address is null");
      return;
    }
    console.log("🔄 loadGroups for address:", address);
    setIsLoadingGroups(true);
    try {
      const ownedGroups = await getGroups(address);
      const memberGroups = await getGroupsByMember(address);

      const mergedMap = new Map<string, Group>();
      [...ownedGroups, ...memberGroups].forEach((g) => {
        mergedMap.set(g.id, g);
      });
      let allGroups = Array.from(mergedMap.values());

      // 🔥 Ambil daftar member untuk setiap grup
      const groupsWithMembers = await Promise.all(
        allGroups.map(async (g) => {
          try {
            let groupId: bigint;
            try {
              groupId = BigInt(g.id);
            } catch (e) {
              console.warn(`⚠️ Invalid group.id for ${g.id}, skipping members fetch`);
              return g;
            }
            const members = await getMembers(groupId, address);
            return { ...g, members };
          } catch (err) {
            console.error(`Failed to get members for group ${g.id}:`, err);
            return g;
          }
        })
      );

      allGroups = groupsWithMembers;

      console.log("📦 allGroups with members:", allGroups);
      setGroups(allGroups);

      if (allGroups.length > 0) {
        localStorage.setItem(`splitbill_groups_${address}`, JSON.stringify(allGroups));
      } else {
        const cached = localStorage.getItem(`splitbill_groups_${address}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed.length > 0) {
              console.log("📦 Using cached data from localStorage");
              setGroups(parsed);
              return;
            }
          } catch (e) {}
        }
        setGroups([]);
      }
    } catch (err) {
      console.error("❌ Failed to load groups:", err);
      const cached = localStorage.getItem(`splitbill_groups_${address}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.length > 0) {
            setGroups(parsed);
            return;
          }
        } catch (e) {}
      }
      setGroups([]);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  // ===== PANGGIL LOADGROUPS SAAT WALLET CONNECT =====
  useEffect(() => {
    if (walletStatus === "connected" && address) {
      loadGroups();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletStatus, address]);

  // ===== SIMPAN KE LOCALSTORAGE SAAT GROUPS BERUBAH (sebagai cache) =====
  useEffect(() => {
    if (address && groups.length > 0) {
      localStorage.setItem(`splitbill_groups_${address}`, JSON.stringify(groups));
    }
  }, [groups, address]);

  // ===== FUNGSI UNTUK MENAMBAH ACTIVITY =====
  const addActivity = (activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...activity,
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  // ===== FUNGSI UNTUK MENAMBAH GROUP =====
  const addGroup = (newGroup: Group) => {
    setGroups((prev) => [...prev, newGroup]);
    addActivity({
      type: 'group_created',
      title: `You created group "${newGroup.name}"`,
      description: `Group ID: ${newGroup.id}`,
    });
  };

  // ===== FUNGSI UNTUK MENAMBAH MEMBER =====
  const addMemberToGroup = (groupId: string, member: Member) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id !== groupId) return g;
        const updatedMembers = [...g.members, member];
        const totalShare = updatedMembers.reduce((acc, m) => acc + m.share, 0);
        return {
          ...g,
          members: updatedMembers,
          totalShare,
        };
      })
    );
    const group = groups.find(g => g.id === groupId);
    if (group) {
      addActivity({
        type: 'member_added',
        title: `You added ${member.address.slice(0,6)}...${member.address.slice(-4)} to ${group.name}`,
        description: `Share: ${member.share} XLM`,
      });
    }
  };

  // ===== FUNGSI UNTUK MENANDAI MEMBER SUDAH BAYAR =====
  const markMemberPaid = (groupId: string, memberAddress: string) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? {
              ...g,
              members: g.members.map((m) =>
                m.address === memberAddress ? { ...m, paid: true } : m
              ),
            }
          : g
      )
    );
    // Tambahkan activity
    const group = groups.find(g => g.id === groupId);
    if (group) {
      addActivity({
        type: 'share_paid',
        title: `You paid your share for "${group.name}"`,
        description: `Amount: ${group.members.find(m => m.address === memberAddress)?.share} XLM`,
      });
    }
  };

  // ===== FUNGSI UNTUK BUKA HALAMAN DETAIL GRUP =====
  const handleViewGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
    setPage("groupDetail");
  };

  // ===== DEMO DATA =====
  const demoGroup: { name: string; total: number; members: DemoMember[] } = {
    name: "Trip to Bali",
    total: 5000,
    members: [
      { name: "Alice", share: 1250, status: "paid" },
      { name: "Bob", share: 1250, status: "pending" },
      { name: "You (Demo)", share: 1250, status: "unpaid" },
      { name: "Charlie", share: 1250, status: "paid" },
    ],
  };

  // ===== HANDLER =====
  function handleStatusChange(
    status: WalletStatus,
    data?: { address?: string; error?: string }
  ) {
    setWalletStatus(status);
    if (status === "connected") {
      setAddress(data?.address ?? null);
      setShowErrorToast(false);
      setIsDemo(false);
    }
    if (status === "error") {
      setErrorMsg(data?.error ?? "Wallet could not connect. Please ensure your wallet is available and try again.");
      setShowErrorToast(true);
    }
    if (status === "idle") {
      setAddress(null);
    }
  }

  function goIdle() {
    setShowErrorToast(false);
    setWalletStatus("idle");
  }

  function handleFullDisconnect() {
    setAddress(null);
    setWalletStatus("idle");
    setPage("landing");
  }

  // ============================================================
  //  RENDER BERDASARKAN PAGE
  // ============================================================

  if (page === "dashboard" && walletStatus === "connected") {
    return (
      <Dashboard
        address={address}
        groups={groups}
        activities={activities}
        onAddGroup={addGroup}
        onDisconnect={handleFullDisconnect}
        onGoGroups={() => setPage("groups")}
        onGoActivity={() => setPage("activity")}
      />
    );
  }

  if (page === "groups" && walletStatus === "connected") {
    return (
      <Groups
        address={address}
        groups={groups}
        isLoading={isLoadingGroups}
        error={errorMsg}
        onRefresh={loadGroups}
        onAddGroup={addGroup}
        onViewGroup={handleViewGroup}
        onDisconnect={handleFullDisconnect}
        onGoHome={() => setPage("dashboard")}
        onGoActivity={() => setPage("activity")}
      />
    );
  }

  if (page === "groupDetail" && walletStatus === "connected") {
    const selectedGroup = groups.find((g) => g.id === selectedGroupId);
    if (!selectedGroup) {
      setPage("groups");
      return null;
    }
    return (
      <GroupDetail
        address={address}
        group={selectedGroup}
        onAddMember={addMemberToGroup}
        onMarkPaid={markMemberPaid}
        onDisconnect={handleFullDisconnect}
        onGoHome={() => setPage("dashboard")}
        onGoGroups={() => setPage("groups")}
        onGoActivity={() => setPage("activity")}
      />
    );
  }

  if (page === "activity" && walletStatus === "connected") {
    return (
      <ActivityPage
        address={address}
        activities={activities}
        onDisconnect={handleFullDisconnect}
        onGoDashboard={() => setPage("dashboard")}
        onGoGroups={() => setPage("groups")}
      />
    );
  }

  // ============================================================
  //  LANDING PAGE (belum connect atau demo)
  // ============================================================
  return (
    <div className="app">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <div className="container">
        <header className="navbar">
          <div className="brand">
            <div className="brand-icon">
              <span className="brand-bars" />
            </div>
            <h1>SplitBill</h1>
          </div>
          <WalletConnect ref={walletRef} onStatusChange={handleStatusChange} />
        </header>

        {/* ERROR TOAST */}
        {showErrorToast && walletStatus === "error" && (
          <div className="error-toast">
            <IconWarning />
            <div className="error-toast-body">
              <p className="error-toast-title">Failed to connect wallet.</p>
              <p className="error-toast-desc">{errorMsg}</p>
              <button
                className="error-toast-retry"
                onClick={() => walletRef.current?.connect()}
              >
                TRY AGAIN
              </button>
            </div>
            <button className="error-toast-close" onClick={goIdle} aria-label="Close">
              <IconClose />
            </button>
          </div>
        )}

        {/* MAIN CONTENT */}
        {walletStatus === "connected" ? (
          <div className="center-stage">
            <div className="connected-card">
              <div className="connected-icon">
                <IconCheck />
              </div>
              <h2>Wallet Connected</h2>
              <p>Your account is successfully linked.</p>
              <div className="connected-address">
                <IconWallet />
                <div>
                  <span className="address-label">STELLAR NETWORK</span>
                  <strong>
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </strong>
                </div>
              </div>
              <div className="connected-actions">
                <button className="btn-primary" onClick={() => setPage("dashboard")}>
                  Open Dashboard
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => walletRef.current?.disconnect()}
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        ) : isDemo ? (
          <div className="center-stage">
            <p className="demo-badge">Preview Mode: Group Bill</p>
            <p className="demo-sub">Simulated transaction environment.</p>
            <div className="demo-card">
              <div className="demo-card-header">
                <div>
                  <span className="demo-eyebrow">GROUP TRIP</span>
                  <h3>{demoGroup.name}</h3>
                </div>
                <div className="demo-total">
                  <span>Total Bill</span>
                  <strong>
                    {demoGroup.total.toLocaleString()} <em>XLM</em>
                  </strong>
                </div>
              </div>
              <ul className="demo-members">
                {demoGroup.members.map((m) => (
                  <li key={m.name} className={m.name.includes("(Demo)") ? "is-you" : ""}>
                    <div className="member-info">
                      <span className="avatar">
                        {m.name.includes("(Demo)") ? <IconUser /> : m.name[0]}
                      </span>
                      {m.name}
                    </div>
                    <span className="member-share">{m.share.toLocaleString()} XLM</span>
                    <span className={`status-badge status-${m.status}`}>
                      {m.status === "paid" && "✓ Paid"}
                      {m.status === "pending" && "⏱ Pending"}
                      {m.status === "unpaid" && "! Unpaid"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <p className="demo-note">
              This is demo mode. Connect wallet to perform real transactions.
            </p>
            <button
              className="btn-primary btn-wide"
              onClick={() => walletRef.current?.connect()}
            >
              <IconWallet /> Connect Wallet Now
            </button>
          </div>
        ) : walletStatus === "connecting" || walletStatus === "error" ? (
          <div className="center-stage">
            <div className="connect-simple-card">
              <div className="connect-simple-icon">
                <IconWallet />
              </div>
              <h3>Connect Wallet</h3>
              <p className="connect-description">
                Securely authenticate to access your decentralized split bills on
                Stellar Soroban.
              </p>
              <button className="btn-primary btn-wide" disabled>
                <IconSpinner /> CONNECTING...
              </button>
              <p className="waiting-text">
                <span className="waiting-dot" /> Waiting for wallet confirmation...
              </p>
            </div>
          </div>
        ) : (
          <section className="hero-grid">
            <div className="hero-left">
              <p className="eyebrow">
                <IconSplit /> POWERED BY STELLAR
              </p>
              <h1>
                Split bills. <span className="highlight">Pay smarter.</span>
              </h1>
              <p className="hero-description">
                Manage shared bills, add members, and make transparent payments
                using Stellar.
              </p>
              <div className="hero-divider" />
              <div className="features">
                <div className="feature">
                  <span className="feature-icon">
                    <IconSplit />
                  </span>
                  <h4>Split bills easily</h4>
                </div>
                <div className="feature">
                  <span className="feature-icon">
                    <IconEye />
                  </span>
                  <h4>Transparent payments</h4>
                </div>
                <div className="feature">
                  <span className="feature-icon">
                    <IconBolt />
                  </span>
                  <h4>Powered by Stellar</h4>
                </div>
              </div>
            </div>

            <div className="hero-right">
              <div className="connect-card">
                <div className="connect-card-top">
                  <div className="connect-icon">
                    <IconWallet />
                  </div>
                  <span className="badge-ready">
                    <span className="ready-dot" /> System Ready
                  </span>
                </div>
                <h3>Connect your wallet</h3>
                <p className="connect-description">
                  Start creating groups and making payments together.
                </p>
                <button
                  className="btn-primary btn-wide"
                  onClick={() => walletRef.current?.connect()}
                >
                  Connect Wallet →
                </button>
                <button
                  className="btn-secondary btn-wide"
                  onClick={() => setIsDemo(true)}
                >
                  View Demo
                </button>
                <div className="hero-divider" />
                <div className="network-info">
                  <div>
                    <span>Network</span>
                    <strong>Stellar Testnet</strong>
                  </div>
                  <div>
                    <span>Network fees paid in</span>
                    <strong>XLM</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <footer className="app-footer">
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
      </div>
    </div>
  );
}

export default App;