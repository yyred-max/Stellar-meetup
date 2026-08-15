// contract.ts
import {
  Contract,
  TransactionBuilder,
  Networks,
  BASE_FEE,
  nativeToScVal,
  scValToNative,
} from "@stellar/stellar-sdk";
import { rpc } from "@stellar/stellar-sdk";
import { kit } from "./wallet";

export const CONTRACT_ID =
  "CBFCVRIAUNBRD5BIYX3AHP3RWMEKUQBN4L5GTLFJ4P76I2H6JMYB4PDF";
const RPC_URL = "https://soroban-testnet.stellar.org";

export const server = new rpc.Server(RPC_URL);
const contract = new Contract(CONTRACT_ID);

export type TxStatus = "idle" | "pending" | "success" | "fail";

export async function callContract(
  method: string,
  args: any[],
  sourcePublicKey: string
) {
  const account = await server.getAccount(sourcePublicKey);

  let tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  // Simulasi dulu untuk hitung resource fee yang tepat
  const simulated = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulated)) {
    throw new Error(simulated.error);
  }

  tx = rpc.assembleTransaction(tx, simulated).build();

  const { signedTxXdr } = await kit.signTransaction(tx.toXDR(), {
    networkPassphrase: Networks.TESTNET,
  });

  const signedTx = TransactionBuilder.fromXDR(signedTxXdr, Networks.TESTNET);

  const sendResponse = await server.sendTransaction(signedTx);

  if (sendResponse.status === "ERROR") {
    throw new Error("Transaksi ditolak jaringan Stellar.");
  }

  // Polling status transaksi sampai selesai
  let getResponse = await server.getTransaction(sendResponse.hash);
  let attempts = 0;
  while (getResponse.status === "NOT_FOUND" && attempts < 15) {
    await new Promise((r) => setTimeout(r, 1500));
    getResponse = await server.getTransaction(sendResponse.hash);
    attempts++;
  }

  if (getResponse.status === "SUCCESS") {
    const returnValue = getResponse.returnValue
      ? scValToNative(getResponse.returnValue)
      : null;
    return { hash: sendResponse.hash, result: returnValue };
  } else {
    throw new Error(
      `Transaksi gagal dengan status: ${getResponse.status}`
    );
  }
}

export async function createGroup(owner: string, name: string) {
  return callContract(
    "create_group",
    [nativeToScVal(owner, { type: "address" }), nativeToScVal(name, { type: "string" })],
    owner
  );
}

export async function payShare(
  groupId: bigint,
  member: string,
  amount: bigint
) {
  return callContract(
    "pay_share",
    [
      nativeToScVal(groupId, { type: "u64" }),
      nativeToScVal(member, { type: "address" }),
      nativeToScVal(amount, { type: "i128" }),
    ],
    member
  );
}

export async function getGroups() {
  // Read-only call, tidak perlu sign — cukup simulate
  const dummyAccount = await server.getAccount(
    "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF"
  ).catch(() => null);

  // Untuk simplifikasi, gunakan simulateTransaction dengan source account manapun yang valid
  // (di production sebaiknya pakai account connected user)
  throw new Error("Implementasi getGroups menyesuaikan account yang connect");
}
