// WalletConnect.tsx — versi final sesuai mockup
import { useState } from "react";
import { kit } from "../lib/wallet";
import { Server } from "@stellar/stellar-sdk/rpc";

const RPC_URL = "https://soroban-testnet.stellar.org";
const server = new Server(RPC_URL);

interface WalletConnectProps {
  onConnected: (address: string) => void;
}

export default function WalletConnect({ onConnected }: WalletConnectProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function checkBalance(publicKey: string): Promise<boolean> {
    try {
      const account = (await server.getAccount(publicKey)) as any;
      const nativeBalance = account.balances?.find(
        (b: any) => b.asset_type === "native"
      );
      const balance = nativeBalance ? parseFloat(nativeBalance.balance) : 0;
      return balance >= 2;
    } catch {
      return false;
    }
  }

  async function handleConnect() {
    setErrorMsg(null);
    setLoading(true);

    try {
      await kit.openModal({
        onWalletSelected: async (option) => {
          try {
            kit.setWallet(option.id);
            const { address: publicKey } = await kit.getAddress();

            if (!publicKey) {
              setErrorMsg(
                "Wallet tidak ditemukan. Pastikan extension wallet sudah terinstall."
              );
              setLoading(false);
              return;
            }

            const hasEnoughBalance = await checkBalance(publicKey);
            if (!hasEnoughBalance) {
              setErrorMsg(
                "Saldo XLM tidak cukup. Top-up via Friendbot terlebih dahulu."
              );
              setLoading(false);
              return;
            }

            setAddress(publicKey);
            onConnected(publicKey);
          } catch (err: any) {
            handleError(err);
          } finally {
            setLoading(false);
          }
        },
        onClosed: () => {
          setLoading(false);
        },
      });
    } catch (err: any) {
      handleError(err);
      setLoading(false);
    }
  }

  function handleError(err: any) {
    const msg = String(err?.message || err || "").toLowerCase();
    if (msg.includes("reject") || msg.includes("declined") || msg.includes("cancel")) {
      setErrorMsg("Koneksi ditolak. Coba lagi jika mau.");
    } else if (msg.includes("not found") || msg.includes("not installed")) {
      setErrorMsg("Wallet tidak ditemukan. Pastikan extension sudah terinstall.");
    } else {
      setErrorMsg("Terjadi kesalahan. Coba lagi.");
    }
  }

  function handleDisconnect() {
    setAddress(null);
    setErrorMsg(null);
    onConnected(""); // memberitahu App bahwa wallet terputus
  }

  function resetAndRetry() {
    setErrorMsg(null);
    handleConnect();
  }

  // Jika sudah connect, tampilkan address dan tombol disconnect
  if (address) {
    return (
      <div className="wallet-connect">
        <div className="wallet-info">
          <span>{address.slice(0, 6)}…{address.slice(-4)}</span>
          <button className="btn-secondary" onClick={handleDisconnect}>
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  // Jika error, tampilkan pesan error + tombol "Try Again"
  if (errorMsg) {
    return (
      <div className="wallet-connect wallet-error-state">
        <div className="wallet-error-box">
          <p className="wallet-error-title">Failed to connect wallet.</p>
          <p className="wallet-error-desc">{errorMsg}</p>
          <button className="btn-secondary" onClick={resetAndRetry}>
            TRY AGAIN
          </button>
        </div>
        {/* Tetap tampilkan tombol Connect Wallet di header? Tidak, karena error state biasanya menggantikan tombol. 
            Tapi di mockup, error muncul di card tengah, bukan di header. Di header, hanya tombol "Connect Wallet" 
            yang berubah menjadi "Connecting". Saya akan ikuti mockup: saat error, di header tetap tampilkan tombol 
            "Connect Wallet" (bukan error). Error ditampilkan di card terpisah. 
            Untuk memudahkan, saya akan kembali ke mode tombol biasa saat error, dan error hanya ditampilkan di bawah 
            tombol (seperti sebelumnya) tetapi dengan desain lebih baik. */}
      </div>
    );
  }

  // Default: tombol "Connect Wallet" (loading atau idle)
  return (
    <div className="wallet-connect">
      <button
        className="btn-primary"
        onClick={handleConnect}
        disabled={loading}
      >
        {loading ? "Connecting…" : "Connect Wallet"}
      </button>
      {loading && (
        <p className="wallet-loading-text">Waiting for wallet confirmation…</p>
      )}
      {/* Error message kecil jika ada (tapi di sini errorMsg null karena sudah ditangani di atas) */}
    </div>
  );
}