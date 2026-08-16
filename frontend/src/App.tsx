import { useState } from "react";
import WalletConnect from "./components/WalletConnect";
import CreateGroup from "./components/CreateGroup";
import AddMember from "./components/AddMember";
import PayShare from "./components/PayShare";
import "./App.css";

function App() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  return (
    <div className="app">
      {/* Background glow (opsional, bisa dipertahankan) */}
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <div className="container">
        {/* ===== HEADER ===== */}
        <header className="navbar">
          <div className="brand">
            <div className="brand-icon">S</div>
            <div>
              <h1>SplitBill</h1>
              <span>Stellar Web3 Payments</span>
            </div>
          </div>
          <WalletConnect onConnected={setWalletAddress} />
        </header>

        {/* ===== STATUS BAR ===== */}
        <div className="status-bar">
          <span className="status-dot" />
          <span className="status-text">Stellar testnet active</span>
        </div>

        {/* ===== HERO ===== */}
        <section className="hero-section">
          <p className="eyebrow">POWERED BY STELLAR</p>
          <h1>
            Split bills.<br />
            <span className="highlight">Pay smarter.</span>
          </h1>
          <p className="hero-description">
            Kelola tagihan bersama, tambahkan member, dan lakukan
            pembayaran secara transparan menggunakan Stellar.
          </p>
        </section>

        {/* ===== DASHBOARD ATAU CONNECT CARD ===== */}
        {walletAddress ? (
          <>
            <div className="wallet-banner">
              <div className="wallet-status">
                <div className="online-dot" />
                <div>
                  <span>Connected Wallet</span>
                  <strong>
                    {walletAddress.slice(0, 8)}...
                    {walletAddress.slice(-8)}
                  </strong>
                </div>
              </div>
              <div className="wallet-network">TESTNET</div>
            </div>

            <div className="dashboard-grid">
              <div className="dashboard-card">
                <div className="card-number">01</div>
                <CreateGroup walletAddress={walletAddress} />
              </div>
              <div className="dashboard-card">
                <div className="card-number">02</div>
                <AddMember walletAddress={walletAddress} />
              </div>
              <div className="dashboard-card payment-card">
                <div className="card-number">03</div>
                <PayShare walletAddress={walletAddress} />
              </div>
            </div>
          </>
        ) : (
          <div className="connect-card">
            <div className="connect-icon">💳</div>
            <h3>Hubungkan wallet kamu</h3>
            <p className="connect-description">
              Mulai buat group dan lakukan pembayaran bersama.
            </p>
            <div className="connect-cta-wrapper">
              <WalletConnect onConnected={setWalletAddress} />
            </div>
          </div>
        )}

        {/* ===== FOOTER ===== */}
        <footer className="app-footer">
          <span className="footer-brand">Built on Stellar Soroban</span>
          <div className="footer-links">
            <a
              href="https://github.com/yyred-max/Stellar-meetup"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.15 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.62.24 2.85.12 3.15.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
            <a
              href="https://developers.stellar.org/docs/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Documentation"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;