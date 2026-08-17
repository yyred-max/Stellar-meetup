// src/components/CreateGroupModal.tsx
import { useState } from "react";
import {
  IconWallet,
  IconInfo,
  IconX,
  IconCheck,
  IconSpinner,
  IconCopy,
  IconExternalLink,
} from "./Icons";

interface CreateGroupModalProps {
  address: string | null;
  onClose: () => void;
  onViewGroup?: (group: { name: string; hash: string }) => void;
  /**
   * Dipanggil setelah transaksi berhasil, sebelum modal menampilkan success.
   * Cocok untuk menyimpan grup ke state di komponen induk.
   */
  onSuccess?: (data: { name: string; hash: string }) => void;
  /**
   * Ganti dengan pemanggilan kontrak Soroban yang sebenarnya (mis. invoke create_group).
   * Default-nya cuma simulasi delay supaya alur UI bisa langsung dicoba.
   */
  onCreateGroup?: (data: { name: string; description: string }) => Promise<{ hash: string }>;
}

type Step = "form" | "processing" | "success";

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function simulateCreateGroup(): Promise<{ hash: string }> {
  await delay(1400);
  const hash = Array.from({ length: 12 }, () =>
    "0123456789ABCDEF"[Math.floor(Math.random() * 16)]
  ).join("");
  return { hash: `${hash.slice(0, 6)}...${hash.slice(6, 10)}` };
}

export default function CreateGroupModal({
  address,
  onClose,
  onViewGroup,
  onSuccess,
  onCreateGroup,
}: CreateGroupModalProps) {
  const [step, setStep] = useState<Step>("form");
  const [subStep, setSubStep] = useState(0); // 0 preparing, 1 waiting wallet, 2 confirming
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [txHash, setTxHash] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setStep("processing");
    setSubStep(0);
    await delay(500);
    setSubStep(1);

    try {
      const result = await (onCreateGroup
        ? onCreateGroup({ name, description })
        : simulateCreateGroup());

      setSubStep(2);
      await delay(500);

      // ✅ Set hash agar tampil di success UI
      setTxHash(result.hash);
      
      // ✅ Panggil onSuccess agar komponen induk bisa simpan grup ke state
      //    Ini dilakukan SEBELUM setStep("success") agar data sudah tersimpan
      //    meskipun user langsung menutup modal.
      onSuccess?.({ name, hash: result.hash });

      setStep("success");
    } catch (error) {
      console.error("Failed to create group:", error);
      alert("Gagal membuat grup. Silakan coba lagi.");
      setStep("form");
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(txHash).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        {/* ===== FORM ===== */}
        {step === "form" && (
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h2>Create New Group</h2>
              <p>Create a group to start splitting bills with your friends.</p>
            </div>

            <div className="modal-body">
              <label className="field-label">Group Name</label>
              <input
                className="field-input"
                type="text"
                placeholder="e.g. Trip to Bali"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <p className="field-hint">Choose a clear name that everyone can recognize.</p>

              <div className="field-label-row">
                <label className="field-label">Description</label>
                <span className="field-optional">Optional</span>
              </div>
              <textarea
                className="field-textarea"
                placeholder="What's this group for?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />

              <div className="owner-card">
                <div className="owner-card-top">
                  <div className="owner-card-identity">
                    <span className="owner-icon">
                      <IconWallet />
                    </span>
                    <div>
                      <span className="owner-label">Owner Wallet</span>
                      <strong className="owner-address">
                        {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "GABCD...7XYZ"}
                      </strong>
                    </div>
                  </div>
                  <span className="badge-ready owner-connected">
                    <span className="ready-dot" /> Connected
                  </span>
                </div>
                <div className="owner-card-rows">
                  <div>
                    <span>Network</span>
                    <strong>Stellar Testnet</strong>
                  </div>
                  <div>
                    <span>Estimated Network Fee</span>
                    <strong>~0.0001 XLM</strong>
                  </div>
                </div>
              </div>

              <p className="modal-note">
                <IconInfo /> This action will create a new group on the Stellar Soroban smart
                contract.
              </p>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary modal-btn" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" className="btn-primary modal-btn">
                Create Group
              </button>
            </div>
          </form>
        )}

        {/* ===== PROCESSING ===== */}
        {step === "processing" && (
          <div className="modal-processing">
            <div className="modal-header modal-header-row">
              <h2>Create Group</h2>
              <button className="modal-close" onClick={onClose} aria-label="Close">
                <IconX />
              </button>
            </div>

            <div className="modal-body processing-body">
              <div className="processing-spinner">
                <IconSpinner size={28} />
              </div>
              <h3>Confirming your group on Stellar Testnet...</h3>
              <p className="processing-warning">
                Please do not close this window while the transaction is being processed.
              </p>

              <div className="processing-steps">
                <div className="processing-step">
                  <span className={`step-dot ${subStep >= 1 ? "done" : "active"}`}>
                    {subStep >= 1 ? <IconCheck /> : <IconSpinner size={14} />}
                  </span>
                  <span className={subStep >= 1 ? "step-label done" : "step-label active"}>
                    Preparing transaction
                  </span>
                </div>
                <div className="step-connector" />
                <div className="processing-step">
                  <span
                    className={`step-dot ${subStep >= 2 ? "done" : subStep === 1 ? "active" : "pending"}`}
                  >
                    {subStep >= 2 ? <IconCheck /> : subStep === 1 ? <IconSpinner size={14} /> : null}
                  </span>
                  <span
                    className={`step-label ${subStep >= 2 ? "done" : subStep === 1 ? "active" : "pending"}`}
                  >
                    Waiting for wallet confirmation
                  </span>
                </div>
                <div className="step-connector" />
                <div className="processing-step">
                  <span className={`step-dot ${subStep === 2 ? "active" : "pending"}`}>
                    {subStep === 2 ? <IconSpinner size={14} /> : null}
                  </span>
                  <span className={`step-label ${subStep === 2 ? "active" : "pending"}`}>
                    Confirming on Stellar Network
                  </span>
                </div>
              </div>

              <p className="processing-footer">
                <IconSpinner size={13} /> Creating...
              </p>
            </div>
          </div>
        )}

        {/* ===== SUCCESS ===== */}
        {step === "success" && (
          <div className="modal-success">
            <div className="success-icon">
              <IconCheck />
            </div>
            <h2>Group Created Successfully</h2>
            <p>Your group is now ready for members and shared payments.</p>

            <div className="success-card">
              <div className="success-row">
                <span>Group</span>
                <strong>{name}</strong>
              </div>
              <div className="success-row">
                <span>Transaction Hash</span>
                <span className="success-hash">
                  {txHash}
                  <button className="hash-copy" onClick={handleCopy} aria-label="Copy hash">
                    <IconCopy />
                  </button>
                </span>
              </div>
              <a
                className="explorer-link"
                href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Explorer <IconExternalLink />
              </a>
              {copied && <span className="copied-toast">Copied!</span>}
            </div>

            <button
              className="btn-primary modal-btn-wide"
              onClick={() => onViewGroup?.({ name, hash: txHash })}
            >
              VIEW GROUP
            </button>
            <button className="btn-secondary modal-btn-wide" onClick={onClose}>
              DONE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}