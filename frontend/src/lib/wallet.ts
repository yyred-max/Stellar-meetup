import {
  StellarWalletsKit,
  WalletNetwork,
  FREIGHTER_ID,
  FreighterModule,
  AlbedoModule,
  LobstrModule,
  XbullModule,      // xBull wallet (ekstensi Chrome)
  RabetModule,      // Rabet wallet (ekstensi Chrome)
} from "@creit.tech/stellar-wallets-kit";

export const kit: StellarWalletsKit = new StellarWalletsKit({
  network: WalletNetwork.TESTNET,
  selectedWalletId: FREIGHTER_ID,
  modules: [
    new FreighterModule(),   // Freighter (ekstensi Chrome)
    new AlbedoModule(),      // Albedo (web-based & ekstensi)
    new LobstrModule(),      // LOBSTR (ekstensi Chrome)
    new XbullModule(),       // xBull (ekstensi Chrome)
    new RabetModule(),       // Rabet (ekstensi Chrome)
  ],
});