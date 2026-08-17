import { useRef, useState } from "react";
import WalletConnect, { WalletConnectHandle, WalletStatus } from "./components/WalletConnect";
import Dashboard from "./components/Dashboard";
import Groups from "./components/Groups";
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

type MemberStatus = "paid" | "pending" | "unpaid";

interface Member {
  name: string;
  share: number;
  status: MemberStatus;
}

function App() {
  const walletRef = useRef<WalletConnectHandle>(null);

  const [walletStatus, setWalletStatus] = useState<WalletStatus>("idle");
  const [address, setAddress] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showErrorToast, setShowErrorToast] = useState(false);
  const [isDemo, setIsDemo] = useState(false);
  const [page, setPage] = useState<"landing" | "dashboard" | "groups">("landing");

  const demoGroup = {
    name: "Trip to Bali",
    total: 5000,
    members: [
      { name: "Alice", share: 1250, status: "paid" },
      { name: "Bob", share: 1250, status: "pending" },
      { name: "You (Demo)", share: 1250, status: "unpaid" },
      { name: "Charlie", share: 1250, status: "paid" },
    ] as Member[],
  };

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

  if (page === "dashboard" && walletStatus === "connected") {
    return (
      <Dashboard
        address={address}
        onDisconnect={handleFullDisconnect}
        onGoGroups={() => setPage("groups")}
      />
    );
  }

  if (page === "groups" && walletStatus === "connected") {
    return (
      <Groups
        address={address}
        onDisconnect={handleFullDisconnect}
        onGoHome={() => setPage("dashboard")}
      />
    );
  }

  return (
    <div className="app">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <div className="container">
        {/* ===== HEADER ===== */}
        <header className="navbar">
          <div className="brand">
            <div className="brand-icon">
              <span className="brand-bars" />
            </div>
            <h1>SplitBill</h1>
          </div>
          <WalletConnect ref={walletRef} onStatusChange={handleStatusChange} />
        </header>

        {/* ===== ERROR TOAST (overlay, independen dari card di bawahnya) ===== */}
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

        {/* ===== MAIN CONTENT (state-driven, exclusive) ===== */}

        {walletStatus === "connected" ? (
          // === CONNECTED STATE (Image 4) ===
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
          // === DEMO MODE (Image 3) ===
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
          // === CONNECTING / ERROR STATE (Image 1) ===
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
          // === IDLE / HOME (Image 2) ===
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

        {/* ===== FOOTER ===== */}
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
