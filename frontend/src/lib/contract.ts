import {
  Contract,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  nativeToScVal,
  scValToNative,
  rpc,
  Address,
} from "@stellar/stellar-sdk";
import { kit } from "./wallet";
import { Group, Member } from "../App";

export const CONTRACT_ID =
  "CACVL5DDKQ3OQO7X3MDM5SQ7VDF4QKGE7KEJGZ46QL2R7XZHFOWGXAGH";

export const RPC_URL =
  "https://soroban-testnet.stellar.org";

export const server = new rpc.Server(RPC_URL);

const contract = new Contract(CONTRACT_ID);

export type TxStatus =
  | "idle"
  | "pending"
  | "success"
  | "fail";

/**
 * Fungsi untuk membaca data dari kontrak (view / read-only)
 * Tanpa menandatangani transaksi, hanya simulasi.
 */
export async function viewContract(
  method: string,
  args: any[],
  sourcePublicKey: string
) {
  if (!sourcePublicKey) {
    throw new Error("Wallet belum terhubung.");
  }

  const account = await server.getAccount(sourcePublicKey);

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simulated = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(simulated)) {
    throw new Error(`Simulation gagal: ${simulated.error}`);
  }

  // Ambil return value dari simulasi
  const result = simulated.result?.retval;
  if (result) {
    return scValToNative(result);
  }
  return null;
}

/**
 * Menjalankan fungsi contract (write / mutasi).
 */
export async function callContract(
  method: string,
  args: any[],
  sourcePublicKey: string
) {
  if (!sourcePublicKey) {
    throw new Error("Wallet belum terhubung.");
  }

  const account = await server.getAccount(sourcePublicKey);

  let tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simulated = await server.simulateTransaction(tx);

  if (rpc.Api.isSimulationError(simulated)) {
    throw new Error(`Simulation gagal: ${simulated.error}`);
  }

  tx = rpc.assembleTransaction(tx, simulated).build();

  const { signedTxXdr } = await kit.signTransaction(tx.toXDR(), {
    networkPassphrase: Networks.TESTNET,
  });

  if (!signedTxXdr) {
    throw new Error(
      "Wallet tidak mengembalikan transaksi yang sudah ditandatangani."
    );
  }

  const signedTx = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);

  const sendResponse = await server.sendTransaction(signedTx);

  if (sendResponse.status === "ERROR") {
    throw new Error("Transaksi ditolak oleh jaringan Stellar.");
  }

  const txHash = sendResponse.hash;

  let response = await server.getTransaction(txHash);

  let attempts = 0;
  const maxAttempts = 20;

  while (response.status === "NOT_FOUND" && attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    response = await server.getTransaction(txHash);
    attempts++;
  }

  if (response.status === "SUCCESS") {
    const result = response.returnValue ? scValToNative(response.returnValue) : null;
    return {
      hash: txHash,
      result,
    };
  }

  throw new Error(`Transaksi gagal dengan status: ${response.status}`);
}

/**
 * Mengambil semua grup milik owner tertentu.
 * Karena kontrak get_groups tidak menerima parameter, kita ambil semua lalu filter.
 */
export async function getGroups(owner: string): Promise<Group[]> {
  try {
    // Panggil get_groups tanpa argumen (sesuai kontrak)
    const result = await viewContract("get_groups", [], owner);
    if (Array.isArray(result)) {
      const allGroups = result.map((item: any) => ({
        id: String(item.id),
        name: String(item.name),
        owner: String(item.owner),
        totalShare: Number(item.total_share ?? item.totalShare),
        members: (item.members || []).map((m: any) => ({
          address: String(m.address),
          share: Number(m.share),
          paid: Boolean(m.paid),
        })),
      }));
      // Filter berdasarkan owner
      return allGroups.filter((g: Group) => g.owner === owner);
    }
    return [];
  } catch (err) {
    console.error("Error in getGroups:", err);
    return [];
  }
}

/**
 * Mengambil semua grup di mana alamat tertentu terdaftar sebagai member.
 * Memanggil fungsi get_groups_by_member di smart contract.
 */
export async function getGroupsByMember(member: string): Promise<Group[]> {
  try {
    const memberScVal = new Address(member).toScVal();
    const result = await viewContract("get_groups_by_member", [memberScVal], member);
    if (Array.isArray(result)) {
      return result.map((item: any) => ({
        id: String(item.id),
        name: String(item.name),
        owner: String(item.owner),
        totalShare: Number(item.total_share ?? item.totalShare),
        members: (item.members || []).map((m: any) => ({
          address: String(m.address),
          share: Number(m.share),
          paid: Boolean(m.paid),
        })),
      }));
    }
    return [];
  } catch (err) {
    console.error("Error in getGroupsByMember:", err);
    return [];
  }
}

/**
 * Create Group
 */
export async function createGroup(owner: string, name: string) {
  if (!owner) {
    throw new Error("Wallet belum terhubung.");
  }
  if (!name.trim()) {
    throw new Error("Nama group tidak boleh kosong.");
  }

  return callContract(
    "create_group",
    [
      new Address(owner).toScVal(),
      nativeToScVal(name.trim(), { type: "string" }),
    ],
    owner
  );
}

/**
 * Add Member
 */
export async function addMember(
  groupId: bigint,
  owner: string,
  member: string,
  shareAmount: bigint
) {
  if (!owner) {
    throw new Error("Wallet owner belum terhubung.");
  }
  if (!member) {
    throw new Error("Alamat member wajib diisi.");
  }
  if (groupId <= 0n) {
    throw new Error("Group ID harus lebih besar dari 0.");
  }
  if (shareAmount <= 0n) {
    throw new Error("Share amount harus lebih besar dari 0.");
  }

  return callContract(
    "add_member",
    [
      nativeToScVal(groupId, { type: "u64" }),
      new Address(owner).toScVal(),
      new Address(member).toScVal(),
      nativeToScVal(shareAmount, { type: "i128" }),
    ],
    owner
  );
}

/**
 * Pay Share
 */
export async function payShare(
  groupId: bigint,
  member: string,
  amount: bigint
) {
  if (!member) {
    throw new Error("Wallet belum terhubung.");
  }
  if (groupId <= 0n) {
    throw new Error("Group ID harus lebih besar dari 0.");
  }
  if (amount <= 0n) {
    throw new Error("Amount harus lebih besar dari 0.");
  }

  return callContract(
    "pay_share",
    [
      nativeToScVal(groupId, { type: "u64" }),
      new Address(member).toScVal(),
      nativeToScVal(amount, { type: "i128" }),
    ],
    member
  );
}