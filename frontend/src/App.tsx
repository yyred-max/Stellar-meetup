import { useState } from "react";
import WalletConnect from "./components/WalletConnect";
import CreateGroup from "./components/CreateGroup";
import AddMember from "./components/AddMember";
import PayShare from "./components/PayShare";
import "./App.css";

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);

  // Data demo untuk preview
  const demoGroup = {
    name: "Trip to Bali",
    total: 5000,
    members: [
      { name: "Alice", share: 1250, paid: true },
      { name: "Bob", share: 1250, paid: false },
      { name: "You (Demo)", share: 1250, paid: false },
      { name: "Charlie", share: 1250, paid: true },
    ],
  };

  return (
    <div className="app">
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <div className="container">
        {/* ===== HEADER ===== */}
        <header className="navbar">
          <div className="brand">
            <div className="brand-icon">S</div>
            <h1>SplitBill</h1>
          </div>
          <WalletConnect onConnected={setWalletAddress} />
        </header>

        {/* ===== STATUS BAR ===== */}
        <div className="status-bar">
          <span className="status-dot" />
          <span className="status-text">
            {walletAddress ? "Wallet Connected" : "System Ready"}
          </span>
        </div>

        {/* ===== HERO SECTION ===== */}
        <section className="hero-section">
          <p className="eyebrow">POWERED BY STELLAR</p>
          <h1>
            Split bills. <br />
            <span className="highlight">Pay smarter.</span>
          </h1>
          <p className="hero-description">
            Manage shared bills, add members, and make transparent payments
            using Stellar.
          </p>
          <div className="hero-buttons">
            <button
              className="btn-primary"
              onClick={() => {
                const btn = document.querySelector(".wallet-connect button");
                if (btn) (btn as HTMLButtonElement).click();
              }}
            >
              Connect Wallet →
            </button>
            <button className="btn-secondary" onClick={() => setIsDemo(!isDemo)}>
              {isDemo ? "Hide Demo" : "View Demo"}
            </button>
          </div>
        </section>

        {/* ===== MAIN CONTENT ===== */}
        {walletAddress ? (
          // === CONNECTED STATE ===
          <div className="connected-state">
            <div className="connected-card">
              <div className="connected-icon">✅</div>
              <h2>Wallet Connected</h2>
              <p>Your account is successfully linked.</p>
              <div className="connected-address">
                <span className="address-label">STELLAR NETWORK</span>
                <strong>
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
                </strong>
              </div>
              <div className="connected-actions">
                <button className="btn-primary">Open Dashboard</button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setWalletAddress(null);
                    // Trigger disconnect via WalletConnect jika perlu
                  }}
                >
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        ) : isDemo ? (
          // === DEMO MODE ===
          <div className="demo-mode">
            <div className="demo-card">
              <div className="demo-badge">Preview Mode: Group Bill</div>
              <p className="demo-sub">Simulated transaction environment.</p>
              <div className="demo-group">
                <h3>{demoGroup.name}</h3>
                <div className="demo-total">
                  <span>Total Bill</span>
                  <strong>{demoGroup.total.toLocaleString()} XLM</strong>
                </div>
                <ul className="demo-members">
                  {demoGroup.members.map((m, i) => (
                    <li key={i}>
                      <span>{m.name}</span>
                      <span>{m.share.toLocaleString()} XLM</span>
                      <span className={m.paid ? "paid" : "pending"}>
                        {m.paid ? "Paid" : "Pending"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <p className="demo-note">
                This is demo mode. Connect wallet to perform real transactions.
              </p>
              <button
                className="btn-primary"
                onClick={() => {
                  const btn = document.querySelector(".wallet-connect button");
                  if (btn) (btn as HTMLButtonElement).click();
                }}
              >
                Connect Wallet Now
              </button>
            </div>
          </div>
        ) : (
          // === CONNECT CARD ===
          <div className="connect-card">
            <div className="connect-icon">💳</div>
            <h3>Connect your wallet</h3>
            <p className="connect-description">
              Start creating groups and making payments together.
            </p>
            <button
              className="btn-primary"
              onClick={() => {
                const btn = document.querySelector(".wallet-connect button");
                if (btn) (btn as HTMLButtonElement).click();
              }}
            >
              Connect Wallet →
            </button>
          </div>
        )}

        {/* ===== FEATURES (opsional) ===== */}
        <section className="features">
          <div className="feature">
            <span>💸</span>
            <h4>Split bills easily</h4>
          </div>
          <div className="feature">
            <span>🔍</span>
            <h4>Transparent payments</h4>
          </div>
          <div className="feature">
            <span>⚡</span>
            <h4>Powered by Stellar</h4>
          </div>
        </section>

        {/* ===== NETWORK INFO ===== */}
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