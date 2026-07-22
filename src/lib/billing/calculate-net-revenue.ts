import type { SupabaseClient } from "@supabase/supabase-js";

interface NetRevenueParams {
  supabase: SupabaseClient;
  tenantId: string;
  periodStart: string;
  periodEnd: string;
}

/**
 * Pendapatan bersih toko = margin barang non-konsinyasi + fee konsinyasi yang sudah
 * difinalisasi (settlements.status = 'paid'). Sengaja tidak memakai total_amount
 * transaksi mentah karena sebagian uang itu adalah hak penitip, bukan toko.
 */
export async function calculateNetRevenue({
  supabase,
  tenantId,
  periodStart,
  periodEnd,
}: NetRevenueParams): Promise<number> {
  const { data: transactions, error: txError } = await supabase
    .from("transactions")
    .select("id")
    .eq("tenant_id", tenantId)
    .gte("created_at", periodStart)
    .lt("created_at", periodEnd);

  if (txError) {
    throw new Error(`Gagal mengambil transaksi: ${txError.message}`);
  }

  const transactionIds = (transactions ?? []).map((t) => t.id as string);
  let margin = 0;

  if (transactionIds.length > 0) {
    const { data: items, error: itemsError } = await supabase
      .from("transaction_items")
      .select("qty, unit_price, cost_price_snapshot")
      .in("transaction_id", transactionIds)
      .is("consignment_batch_id", null);

    if (itemsError) {
      throw new Error(`Gagal menghitung margin produk: ${itemsError.message}`);
    }

    margin = (items ?? []).reduce(
      (sum, item) =>
        sum + (Number(item.unit_price) - Number(item.cost_price_snapshot)) * Number(item.qty),
      0,
    );
  }

  const { data: settlements, error: settlementsError } = await supabase
    .from("settlements")
    .select("total_fee")
    .eq("tenant_id", tenantId)
    .eq("status", "paid")
    .gte("created_at", periodStart)
    .lt("created_at", periodEnd);

  if (settlementsError) {
    throw new Error(`Gagal menghitung fee konsinyasi: ${settlementsError.message}`);
  }

  const consignmentFee = (settlements ?? []).reduce(
    (sum, settlement) => sum + Number(settlement.total_fee),
    0,
  );

  return margin + consignmentFee;
}
