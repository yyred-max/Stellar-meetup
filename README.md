# SplitBill — Stellar Soroban dApp

**SplitBill** adalah aplikasi pembagian tagihan (group expense tracker) berbasis smart contract di **Stellar Soroban** (Testnet). Setiap anggota grup dapat membayar porsi tagihannya secara *on-chain*, dengan status pembayaran yang *real-time* dan transparan.

**Demo langsung:** [stellar-meetup.vercel.app](https://stellar-meetup.vercel.app/)

---

## Fitur Utama

- **Multi-wallet support** — koneksi via [Stellar Wallets Kit](https://github.com/Creit-Tech/Stellar-Wallets-Kit) (Freighter, Albedo, xBull, LOBSTR, dan lainnya)
- **Smart contract** untuk:
  - Membuat grup
  - Menambahkan anggota beserta porsi tagihan
  - Membayar porsi tagihan secara *on-chain*
- **Error handling dua lapis**:
  - *Wallet-level*: wallet tidak ditemukan, permintaan ditolak, saldo tidak cukup
  - *Contract-level*: `AlreadyPaid`, `NotAMember`, `IncorrectAmount`
- **Event feed real-time** — memantau aktivitas grup (grup dibuat, anggota ditambahkan, anggota membayar) tanpa perlu memuat ulang halaman
- **UI modern** — mendukung dark mode, aksesibel, dan responsif

---

## Tech Stack

| Komponen | Teknologi |
|---|---|
| Smart contract | Rust + Soroban SDK |
| Frontend | React + TypeScript + Vite |
| Integrasi wallet | `@creit.tech/stellar-wallets-kit` |
| Blockchain SDK | `@stellar/stellar-sdk` |
| Jaringan | Stellar Testnet |

---

## Struktur Proyek

```
project/
├── contracts/
│   └── splitbill/
│       ├── src/
│       │   ├── lib.rs
│       │   └── test.rs
│       └── Cargo.toml
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── WalletConnect.tsx
    │   │   ├── PayShare.tsx
    │   │   ├── CreateGroup.tsx
    │   │   └── AddMember.tsx
    │   ├── lib/
    │   │   ├── wallet.ts
    │   │   └── contract.ts
    │   ├── App.tsx
    │   └── main.tsx
    ├── index.html
    ├── package.json
    └── vite.config.ts
```

---

## Setup dan Menjalankan Proyek

### Prasyarat

- [Rust](https://rustup.rs) dengan target `wasm32-unknown-unknown` atau `wasm32v1-none`
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli)
- Node.js (v18 ke atas) dan npm
- Ekstensi wallet Stellar (disarankan [Freighter](https://www.freighter.app))

### 1. Clone repository

```bash
git clone <URL_REPO>
cd <NAMA_REPO>
```

### 2. Build dan test smart contract

```bash
cd contracts/splitbill
cargo test
stellar contract build
```

### 3. Deploy ke testnet (opsional — contract sudah di-deploy, lihat alamat di bawah)

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

Buka `http://localhost:5173` di browser, atau langsung coba versi live di [stellar-meetup.vercel.app](https://stellar-meetup.vercel.app/).

### 5. Hubungkan wallet

- Pastikan ekstensi wallet sudah terinstal dan network diset ke **Testnet**.
- Klik **Connect Wallet** di aplikasi, lalu pilih wallet yang tersedia.
- Jika akun belum memiliki saldo testnet, top-up melalui [Friendbot](https://friendbot.stellar.org).

---

## Smart Contract (Deployed)

**Contract address (testnet):**
`CBFCVRIAUNBRD5BIYX3AHP3RWMEKUQBN4L5GTLFJ4P76I2H6JMYB4PDF`

Verifikasi di [Stellar Lab](https://lab.stellar.org/r/testnet/contract/CBFCVRIAUNBRD5BIYX3AHP3RWMEKUQBN4L5GTLFJ4P76I2H6JMYB4PDF)

---

## Contoh Transaksi (Contract Call)

Contoh pemanggilan fungsi `create_group`:
`569ca218174dbfef425283981dd7ef6e14b3dc3f263e51330f2c45fd82a3b141`

Lihat di [Stellar Explorer](https://stellar.expert/explorer/testnet/tx/569ca218174dbfef425283981dd7ef6e14b3dc3f263e51330f2c45fd82a3b141)

---

## Daftar Error dan Penanganannya

| Layer | Error | Kapan terjadi |
|---|---|---|
| Wallet | `not_found` | Ekstensi wallet tidak terdeteksi / belum terinstal |
| Wallet | `rejected` | Pengguna menolak atau membatalkan permintaan koneksi maupun signing |
| Wallet | `insufficient_balance` | Saldo XLM di bawah minimum (untuk fee dan reserve) |
| Contract | `AlreadyPaid` | Anggota mencoba membayar porsi yang sudah lunas |
| Contract | `NotAMember` | Address bukan anggota terdaftar di grup tersebut |
| Contract | `IncorrectAmount` | Jumlah pembayaran tidak sesuai porsi yang ditentukan |

---

## Testing Smart Contract

Terdapat 4 unit test (1 skenario sukses dan 3 skenario error) untuk memastikan reliabilitas contract.

```bash
cd contracts/splitbill
cargo test
```

---

## Fungsi Smart Contract

| Fungsi | Deskripsi |
|---|---|
| `create_group(owner, name)` | Membuat grup baru |
| `add_member(group_id, owner, member, share_amount)` | Menambahkan anggota beserta porsi tagihan |
| `pay_share(group_id, member, amount)` | Membayar porsi tagihan |
| `get_groups()` | Membaca semua data grup |
| `get_members(group_id)` | Membaca semua anggota dalam satu grup |

---

## Lisensi

MIT — bebas digunakan dan dikembangkan.

---

Dibangun di atas **Stellar Soroban**.