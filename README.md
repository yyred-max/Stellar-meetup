# SplitBill — Stellar Soroban dApp

**SplitBill** is a group expense tracker application built on a smart contract on **Stellar Soroban** (Testnet). Each group member can pay their share of a bill *on-chain*, with payment status, group ownership, and activity history that are transparent and directly verifiable on the blockchain.

**Live demo:** [stellar-meetup.vercel.app](https://stellar-meetup.vercel.app/)

---

## Key Features

- **Multi-wallet support** — connect via [Stellar Wallets Kit](https://github.com/Creit-Tech/Stellar-Wallets-Kit) (Freighter, Albedo, xBull, LOBSTR, and others)
- **Smart contract** for:
  - Creating a group (`create_group`)
  - Renaming a group (`update_group`) — owner only
  - Deleting a group (`delete_group`) — owner only
  - Adding a member along with their bill share (`add_member`)
  - Paying a bill share *on-chain* (`pay_share`)
- **Sequential group IDs** — each new group gets a sequential ID (1, 2, 3, ...) stored in contract storage, ensuring IDs are always accurate whether read or rewritten from the frontend
- **Two-layer error handling**:
  - *Wallet-level*: wallet not found, request rejected, insufficient balance
  - *Contract-level*: `AlreadyPaid`, `NotAMember`, `IncorrectAmount`, `GroupNotFound`, `NotOwner`
- **Complete pages**: Dashboard (summary & statistics), Groups (group list & search/filter), Group Detail (manage members, edit/delete group, pay share), and Activity (group and payment activity history)
- **Modern UI** — supports dark mode, accessible, and responsive

---

## Tech Stack

| Component         | Technology                         |
| ------------------ | ----------------------------------- |
| Smart contract      | Rust + Soroban SDK                 |
| Frontend            | React + TypeScript + Vite          |
| Wallet integration   | `@creit.tech/stellar-wallets-kit` |
| Blockchain SDK      | `@stellar/stellar-sdk`             |
| Network              | Stellar Testnet                    |

---

## Project Structure

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
    │   │   ├── Dashboard.tsx
    │   │   ├── Groups.tsx
    │   │   ├── GroupDetail.tsx
    │   │   ├── Activity.tsx
    │   │   ├── CreateGroupModal.tsx
    │   │   ├── AddMemberModal.tsx
    │   │   └── PayShareModal.tsx
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

## Setup and Running the Project

### Prerequisites

- [Rust](https://rustup.rs) with the `wasm32-unknown-unknown` or `wasm32v1-none` target
- [Stellar CLI](https://developers.stellar.org/docs/tools/developer-tools/cli/install-cli)
- Node.js (v18 or later) and npm
- A Stellar wallet extension (recommended: [Freighter](https://www.freighter.app))

### 1. Clone the repository

```bash
git clone <REPO_URL>
cd <REPO_NAME>
```

### 2. Build and test the smart contract

```bash
cd contracts/splitbill
cargo test
stellar contract build
```

### 3. Deploy to testnet (optional — the contract is already deployed, see the address below)

```bash
stellar keys generate alice --network testnet --fund
stellar contract deploy \
  --wasm target/wasm32v1-none/release/splitbill.wasm \
  --source alice \
  --network testnet
```

> **Note:** every time the contract is redeployed, the contract address will change. Be sure to update `CONTRACT_ID` in `frontend/src/lib/contract.ts` after redeploying.

### 4. Run the frontend

```bash
cd ../../frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser, or try the live version directly at [stellar-meetup.vercel.app](https://stellar-meetup.vercel.app/).

### 5. Connect your wallet

- Make sure the wallet extension is installed and the network is set to **Testnet**.
- Click **Connect Wallet** in the app, then select an available wallet.
- If the account doesn't have a testnet balance yet, top it up via [Friendbot](https://friendbot.stellar.org).

---

## Smart Contract (Deployed)

**Contract address (testnet):**
`<TODO: fill in with the CONTRACT_ID from the latest redeploy>`

<!--
Previous addresses (no longer in use — group IDs in the old contract are incompatible
due to a change in ID scheme from random u64 to a sequential counter):
CBFCVRIAUNBRD5BIYX3AHP3RWMEKUQBN4L5GTLFJ4P76I2H6JMYB4PDF
CACVL5DDKQ3OQO7X3MDM5SQ7VDF4QKGE7KEJGZ46QL2R7XZHFOWGXAGH
CB35GVI2G7R2P56QIWLUFTDLR2AS4TSFLNUI4DT4YNOGFTEBHZSE36JJ
-->

Verify on Stellar Lab: `https://lab.stellar.org/r/testnet/contract/<CONTRACT_ID>`

---

## Example Transaction (Contract Call)

Example call to the `create_group` function:
`<TODO: fill in with a sample tx hash from the active contract>`

View on Stellar Explorer: `https://stellar.expert/explorer/testnet/tx/<TX_HASH>`

---

## Error List and Handling

| Layer    | Error                  | Code | When it occurs                                                        |
| -------- | ---------------------- | ---- | ----------------------------------------------------------------------- |
| Wallet   | `not_found`            | —    | Wallet extension not detected / not installed                          |
| Wallet   | `rejected`             | —    | User rejected or cancelled the connection or signing request           |
| Wallet   | `insufficient_balance` | —    | XLM balance below the minimum (for fees and reserve)                   |
| Contract | `AlreadyPaid`          | 1    | A member tries to pay a share that has already been paid               |
| Contract | `NotAMember`           | 2    | The address is not a registered member of that group                  |
| Contract | `IncorrectAmount`      | 3    | The payment amount does not match the specified share                 |
| Contract | `GroupNotFound`        | 4    | The submitted Group ID is not found in contract storage                |
| Contract | `NotOwner`             | 5    | The caller of `update_group`/`delete_group` is not the group owner    |

---

## Smart Contract Testing

Unit tests exist to ensure contract reliability, covering both success scenarios and error scenarios (`AlreadyPaid`, `NotAMember`, `IncorrectAmount`, `GroupNotFound`, `NotOwner`).

```bash
cd contracts/splitbill
cargo test
```

---

## Smart Contract Functions

| Function                                                    | Description                                       |
| ------------------------------------------------------------ | --------------------------------------------------- |
| `create_group(owner, name)`                                  | Creates a new group with a sequential ID           |
| `update_group(group_id, owner, new_name)`                    | Renames a group (owner only)                       |
| `delete_group(group_id, owner)`                               | Deletes a group (owner only)                       |
| `add_member(group_id, owner, member, share_amount)`          | Adds a member along with their bill share          |
| `pay_share(group_id, member, amount)`                         | Pays a bill share                                  |
| `get_groups()`                                                | Reads all group data                               |
| `get_groups_by_member(member_address)`                        | Reads all groups in which an address is registered as a member |
| `get_members(group_id)`                                       | Reads all members within a group                   |

---

## License

MIT — free to use and develop.

---

Built on **Stellar Soroban**.