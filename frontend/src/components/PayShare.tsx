// PayShare.tsx
import { useState, useEffect } from "react";
import { payShare, server, CONTRACT_ID, TxStatus } from "../lib/contract";
import { rpc } from "@stellar/stellar-sdk";

interface PayShareProps {
  walletAddress: string;
}

export default function PayShare({ walletAddress }: PayShareProps) {
  const [groupId, setGroupId] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<TxStatus>("idle");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [events, setEvents] = useState<string[]>([]);

  // Event listener real-time: polling event contract setiap beberapa detik
  useEffect(() => {
    let isMounted = true;

    async function pollEvents() {
      try {
        const latestLedger = await server.getLatestLedger();
        const startLedger = Math.max(latestLedger.sequence - 100, 1);

        const res = await server.getEvents({
          startLedger,
          filters: [
            {
              type: "contract",
              contractIds: [CONTRACT_ID],
            },
          ],
        });

        if (isMounted && res.events.length > 0) {
          const newLogs = res.events.map(
            (e) =>
              `Event: ${e.topic.map((t) => t.toString()).join(",")} @ ledger ${e.ledger}`
          );
          setEvents(newLogs.slice(-5)); // tampilkan 5 event terbaru
        }
      } catch (err) {
        console.error("Gagal fetch event:", err);
      }
    }

    pollEvents();
    const interval = setInterval(pollEvents, 5000); // poll tiap 5 detik

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  async function handlePay() {
    setStatus("pending");
    setErrorMsg(null);
    setTxHash(null);

    try {
      const result = await payShare(
        BigInt(groupId),
        walletAddress,
        BigInt(amount)
      );
      setTxHash(result.hash);
      setStatus("success");
    } catch (err: any) {
      const msg = String(err?.message || err);

      // Deteksi 3 error contract-level dari pesan simulasi
      if (msg.includes("AlreadyPaid") || msg.includes("Error(Contract, #1)")) {
        setErrorMsg("Kamu sudah membayar porsi tagihan ini sebelumnya.");
      } else if (msg.includes("NotAMember") || msg.includes("Error(Contract, #2)")) {
        setErrorMsg("Wallet kamu bukan anggota grup ini.");
      } else if (msg.includes("IncorrectAmount") || msg.includes("Error(Contract, #3)")) {
        setErrorMsg("Jumlah pembayaran tidak sesuai dengan porsi yang ditentukan.");
      } else {
        setErrorMsg(msg);
      }

      setStatus("fail");
    }
  }

  return (
    <div className="pay-share">
      <h3>Bayar Porsi Tagihan</h3>

      <input
        placeholder="Group ID"
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
      />
      <input
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <button onClick={handlePay} disabled={status === "pending"}>
        {status === "pending" ? "Memproses..." : "Bayar"}
      </button>

      {/* Status transaksi visible */}
      {status === "pending" && <p>⏳ Transaksi sedang diproses...</p>}
      {status === "success" && (
        <p>
          ✅ Pembayaran berhasil! Tx hash:{" "}
          
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
          >
            {txHash?.slice(0, 10)}...
          </a>
        </p>
      )}
      {status === "fail" && <p>❌ {errorMsg}</p>}

      {/* Real-time event feed */}
      <div className="event-feed">
        <h4>Aktivitas Terbaru</h4>
        {events.length === 0 ? (
          <p>Belum ada aktivitas.</p>
        ) : (
          <ul>
            {events.map((e, i) => (
              <li key={i}>{e}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
