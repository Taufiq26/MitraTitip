import { db, type PendingTransaction } from "./db";

export async function queueTransaction(
  transaction: Omit<PendingTransaction, "syncStatus">,
): Promise<void> {
  await db.pendingTransactions.put({ ...transaction, syncStatus: "pending" });
}

type SyncResult = { synced: string[]; failed: string[] };

export async function flushPendingTransactions(): Promise<SyncResult> {
  const pending = await db.pendingTransactions
    .where("syncStatus")
    .anyOf(["pending", "failed"])
    .toArray();

  if (pending.length === 0) {
    return { synced: [], failed: [] };
  }

  await db.pendingTransactions
    .where("localId")
    .anyOf(pending.map((t) => t.localId))
    .modify({ syncStatus: "syncing" });

  try {
    const res = await fetch("/api/sync/push", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactions: pending.map((t) => ({
          local_id: t.localId,
          total_amount: t.totalAmount,
          payment_method: t.paymentMethod,
          cash_received: t.cashReceived,
          change_amount: t.changeAmount,
          items: t.items.map((item) => ({
            product_id: item.productId,
            qty: item.qty,
            unit_price: item.unitPrice,
          })),
          created_at: t.createdAt,
        })),
      }),
    });

    const json = await res.json();
    const synced: string[] = json?.data?.synced ?? [];

    if (synced.length > 0) {
      await db.pendingTransactions.bulkDelete(synced);
    }

    const failed = pending
      .map((t) => t.localId)
      .filter((localId) => !synced.includes(localId));

    if (failed.length > 0) {
      await db.pendingTransactions
        .where("localId")
        .anyOf(failed)
        .modify({ syncStatus: "failed" });
    }

    return { synced, failed };
  } catch {
    await db.pendingTransactions
      .where("localId")
      .anyOf(pending.map((t) => t.localId))
      .modify({ syncStatus: "failed" });
    return { synced: [], failed: pending.map((t) => t.localId) };
  }
}

export async function countPendingTransactions(): Promise<number> {
  return db.pendingTransactions
    .where("syncStatus")
    .anyOf(["pending", "failed", "syncing"])
    .count();
}
