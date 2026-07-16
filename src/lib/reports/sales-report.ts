import type { SupabaseClient } from "@supabase/supabase-js";

export interface SalesReport {
  totalRevenue: number;
  byPaymentMethod: Record<"cash" | "qris" | "transfer", number>;
  transactionCount: number;
  grossProfit: number;
  netProfit: number;
  consignmentPayout: number;
  topProducts: { productId: string; name: string; qtySold: number; revenue: number }[];
}

interface TransactionRow {
  id: string;
  payment_method: "cash" | "qris" | "transfer";
  total_amount: number;
}

interface TransactionItemRow {
  transaction_id: string;
  product_id: string;
  qty: number;
  cost_price_snapshot: number;
  fee_percent_snapshot: number | null;
  subtotal: number;
  products: { name: string } | null;
}

export async function computeSalesReport(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  periodStart: string,
  periodEnd: string,
): Promise<SalesReport> {
  const { data: transactions } = await supabase
    .from("transactions")
    .select("id, payment_method, total_amount")
    .gte("created_at", `${periodStart}T00:00:00`)
    .lte("created_at", `${periodEnd}T23:59:59`)
    .returns<TransactionRow[]>();

  const txRows = transactions ?? [];
  const txIds = txRows.map((t) => t.id);

  const byPaymentMethod: SalesReport["byPaymentMethod"] = {
    cash: 0,
    qris: 0,
    transfer: 0,
  };
  let totalRevenue = 0;
  for (const tx of txRows) {
    byPaymentMethod[tx.payment_method] += tx.total_amount;
    totalRevenue += tx.total_amount;
  }

  let items: TransactionItemRow[] = [];
  if (txIds.length > 0) {
    const { data } = await supabase
      .from("transaction_items")
      .select(
        "transaction_id, product_id, qty, cost_price_snapshot, fee_percent_snapshot, subtotal, products(name)",
      )
      .in("transaction_id", txIds)
      .returns<TransactionItemRow[]>();
    items = data ?? [];
  }

  let grossProfit = 0;
  let consignmentPayout = 0;
  const productAgg = new Map<
    string,
    { name: string; qtySold: number; revenue: number }
  >();

  for (const item of items) {
    grossProfit += item.subtotal - item.cost_price_snapshot * item.qty;

    if (item.fee_percent_snapshot !== null) {
      consignmentPayout += item.subtotal * (1 - item.fee_percent_snapshot / 100);
    }

    const existing = productAgg.get(item.product_id);
    const name = item.products?.name ?? "Barang";
    if (existing) {
      existing.qtySold += item.qty;
      existing.revenue += item.subtotal;
    } else {
      productAgg.set(item.product_id, {
        name,
        qtySold: item.qty,
        revenue: item.subtotal,
      });
    }
  }

  const topProducts = [...productAgg.entries()]
    .map(([productId, agg]) => ({ productId, ...agg }))
    .sort((a, b) => b.qtySold - a.qtySold)
    .slice(0, 10);

  return {
    totalRevenue,
    byPaymentMethod,
    transactionCount: txRows.length,
    grossProfit,
    netProfit: grossProfit - consignmentPayout,
    consignmentPayout,
    topProducts,
  };
}
