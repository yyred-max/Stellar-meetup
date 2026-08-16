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
      <div className="background-glow glow-one" />
      <div className="background-glow glow-two" />

      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">S</div>
          <div>
            <h1>SplitBill</h1>
            <span>Stellar Web3 Payments</span>
          </div>
        </div>

        {/* Satu CTA utama — sama dengan yang di card bawah */}
        <WalletConnect
          onConnected={(address) => setWalletAddress(address)}
        />
      </header>

      <main className="container">
        <section className="hero">
          <div>
            <span className="eyebrow">✦ POWERED BY STELLAR</span>

            <h2>
              Split bills.
              <br />
              <span>Pay smarter.</span>
            </h2>

            {/* Kontras teks dinaikkan — tambahkan kelas untuk warna lebih terang */}
            <p className="hero-description">
              Kelola tagihan bersama, tambahkan member, dan lakukan
              pembayaran secara transparan menggunakan Stellar.
            </p>
          </div>

          <div className="network-card">
            <div className="network-dot" />
            <div>
              <strong>Stellar Testnet</strong>
              <span>Network Active</span>
            </div>
          </div>
        </section>

        {walletAddress ? (
          <>
            <section className="wallet-banner">
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
            </section>

            <section className="dashboard-grid">
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
            </section>
          </>
        ) : (
          <section className="connect-card">
            {/* Icon wallet jelas, bukan lingkaran generik */}
            <div className="connect-icon">💳</div>
            <h3>Connect your wallet</h3>
            <p className="connect-description">
              Hubungkan wallet Stellar kamu untuk mulai membuat
              group dan melakukan pembayaran.
            </p>
            {/* CTA yang sama — gunakan WalletConnect lagi */}
            <div className="connect-cta-wrapper">
              <WalletConnect
                onConnected={(address) => setWalletAddress(address)}
              />
            </div>
          </section>
        )}

        {/* Footer diperkuat dengan link trust signal */}
        <footer className="app-footer">
          <div className="footer-links">
            <a
              href="https://github.com/yyred-max/Stellar-meetup"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href="https://developers.stellar.org/docs/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Dokumentasi Stellar
            </a>
            <a
              href="https://stellar.org/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Stellar.org
            </a>
          </div>
          <div className="footer-brand">
            <span>SplitBill</span>
            <span>Built on Stellar Soroban</span>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default App;