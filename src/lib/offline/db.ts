import Dexie, { type EntityTable } from "dexie";

export interface CachedProduct {
  id: string;
  name: string;
  barcode: string | null;
  sellPrice: number;
  trackStock: boolean;
  stockQty: number;
  isConsignment: boolean;
}

export interface PendingTransactionItem {
  productId: string;
  qty: number;
  unitPrice: number;
}

export interface PendingTransaction {
  localId: string;
  totalAmount: number;
  paymentMethod: "cash" | "qris" | "transfer";
  cashReceived: number | null;
  changeAmount: number | null;
  items: PendingTransactionItem[];
  createdAt: string;
  syncStatus: "pending" | "syncing" | "synced" | "failed";
}

const db = new Dexie("mitratitip") as Dexie & {
  cachedProducts: EntityTable<CachedProduct, "id">;
  pendingTransactions: EntityTable<PendingTransaction, "localId">;
};

db.version(1).stores({
  cachedProducts: "id, barcode",
  pendingTransactions: "localId, syncStatus, createdAt",
});

export { db };
