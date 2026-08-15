# SplitBill — Stellar Soroban dApp

Aplikasi Split Bill / Group Expense Tracker on-chain menggunakan Soroban smart contract di Stellar Testnet. Anggota grup dapat membayar porsi tagihan masing-masing secara on-chain, dengan status pembayaran yang terlihat real-time.

## ✨ Fitur

- Multi-wallet connect via **Stellar Wallets Kit** (Freighter, Albedo, xBull, Lobstr, dll)
- Smart contract untuk membuat grup, menambahkan anggota, dan membayar porsi tagihan
- Error handling di 2 layer:
  - **Wallet-level**: wallet not found, transaction rejected, insufficient balance
  - **Contract-level**: `AlreadyPaid`, `NotAMember`, `IncorrectAmount`
- Status transaksi real-time (pending → success/fail)
- Event feed real-time dari smart contract (polling event `group_created`, `member_added`, `member_paid`)

## 🧱 Tech Stack

- **Smart Contract**: Rust + Soroban SDK
- **Frontend**: React + TypeScript + Vite
- **Wallet**: `@creit.tech/stellar-wallets-kit`
- **Blockchain SDK**: `@stellar/stellar-sdk`
- **Network**: Stellar Testnet

## 📦 Struktur Project

project/
├── contracts/
│ └── splitbill/
│ ├── src/
│ │ ├── lib.rs
│ │ └── test.rs
│ └── Cargo.toml
└── frontend/
├── src/
│ ├── components/
│ │ ├── WalletConnect.tsx
│ │ └── PayShare.tsx
│ ├── lib/
│ │ ├── wallet.ts
│ │ └── contract.ts
│ ├── App.tsx
│ └── main.tsx
├── index.html
├── package.json
└── vite.config.ts

## 🚀 Setup & Menjalankan Project

### Prasyarat
- [Rust](https://rustup.rs) + target `wasm32-unknown-unknown` atau `wasm32v1-none`
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli)
- Node.js (v18+) & npm
- Browser extension wallet Stellar (contoh: [Freighter](https://www.freighter.app))

### 1. Clone repository
```bash
git clone <URL_REPO_KAMU>
cd <NAMA_REPO>
```

### 2. Build & test smart contract
```bash
cd contracts/splitbill
cargo test
stellar contract build
```

### 3. Deploy ke testnet (opsional, sudah di-deploy — lihat Contract Address di bawah)
```bash
stellar keys generate alice --network testnet --fund
stellar contract deploy \
  --wasm target/wasm32v1-none/release/splitbill.wasm \
  --source alice \
  --network testnet
```

### 4. Jalankan frontend
```bash
cd ../../frontend
npm install
npm run dev
```
Buka `http://localhost:5173` di browser.

### 5. Hubungkan wallet
- Pastikan extension wallet sudah terinstall dan network di-set ke **Testnet**
- Klik **Connect Wallet** di aplikasi, pilih wallet yang tersedia
- Pastikan akun punya saldo testnet (top-up via [Friendbot](https://friendbot.stellar.org) kalau perlu)

## 📜 Deployed Contract

**Contract Address (Testnet):**
CBFCVRIAUNBRD5BIYX3AHP3RWMEKUQBN4L5GTLFJ4P76I2H6JMYB4PDF

**Verifikasi di Stellar Lab:**
https://lab.stellar.org/r/testnet/contract/CBFCVRIAUNBRD5BIYX3AHP3RWMEKUQBN4L5GTLFJ4P76I2H6JMYB4PDF

## 🔁 Transaction Hash (Contract Call)

Contoh pemanggilan fungsi `create_group`:
569ca218174dbfef425283981dd7ef6e14b3dc3f263e51330f2c45fd82a3b141

**Verifikasi di Stellar Explorer:**
https://stellar.expert/explorer/testnet/tx/569ca218174dbfef425283981dd7ef6e14b3dc3f263e51330f2c45fd82a3b141

## ⚠️ Error Handling

| Layer | Error | Kapan Terjadi |
|---|---|---|
| Wallet | `not_found` | Extension wallet tidak terdeteksi/belum install |
| Wallet | `rejected` | User menolak/cancel permintaan koneksi atau signing transaksi |
| Wallet | `insufficient_balance` | Saldo XLM di bawah minimum untuk transaksi |
| Contract | `AlreadyPaid` | Member mencoba membayar porsi yang sudah lunas |
| Contract | `NotAMember` | Address bukan anggota terdaftar di grup tersebut |
| Contract | `IncorrectAmount` | Jumlah pembayaran tidak sesuai porsi yang ditentukan |

## 🧪 Testing

Smart contract sudah diuji dengan 4 unit test yang mencakup 1 skenario sukses dan 3 skenario error:
```bash
cd contracts/splitbill
cargo test
```

## 📝 Fungsi Smart Contract

| Fungsi | Deskripsi |
|---|---|
| `create_group(owner, name)` | Membuat grup baru |
| `add_member(group_id, owner, member, share_amount)` | Menambahkan anggota + porsi tagihan |
| `pay_share(group_id, member, amount)` | Membayar porsi tagihan |
| `get_groups()` | Membaca semua data grup |
| `get_members(group_id)` | Membaca semua anggota dalam satu grup |

## 📄 License

MIT



