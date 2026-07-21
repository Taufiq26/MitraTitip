"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

const periodSchema = z.object({
  consignorId: z.string().uuid(),
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
});

export type SettlementItemDetail = {
  productId: string;
  productName: string;
  qty: number;
  totalSales: number;
  totalFee: number;
  totalPayout: number;
};

export type SettlementPreview = {
  totalSales: number;
  totalFee: number;
  totalPayout: number;
  isRealized?: boolean;
  details?: SettlementItemDetail[];
};

export type SettlementPreviewState = {
  error: string | null;
  existingSettlements?: {
    id: string;
    totalSales: number;
    totalFee: number;
    totalPayout: number;
    createdAt: string;
    periodStart: string;
    periodEnd: string;
    details?: SettlementItemDetail[];
  }[];
  unsettledPreview?: SettlementPreview | null;
};

async function getSettlementDetails(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  consignorId: string,
  periodStart: string,
  periodEnd: string
): Promise<SettlementItemDetail[]> {
  const { data } = await supabase
    .from("transaction_items")
    .select(`
      qty,
      subtotal,
      fee_percent_snapshot,
      products ( id, name ),
      transactions!inner ( created_at ),
      consignment_batches!inner ( consignor_id )
    `)
    .eq("consignment_batches.consignor_id", consignorId)
    .gte("transactions.created_at", `${periodStart}T00:00:00.000Z`)
    .lte("transactions.created_at", `${periodEnd}T23:59:59.999Z`);

  if (!data) return [];

  const grouped = new Map<string, SettlementItemDetail>();
  for (const item of data) {
    const product = Array.isArray(item.products) ? item.products[0] : item.products;
    if (!product) continue;
    const pId = product.id;
    
    if (!grouped.has(pId)) {
      grouped.set(pId, {
        productId: pId,
        productName: product.name,
        qty: 0,
        totalSales: 0,
        totalFee: 0,
        totalPayout: 0,
      });
    }
    const g = grouped.get(pId)!;
    g.qty += Number(item.qty);
    g.totalSales += Number(item.subtotal);
    
    const fee = Number(item.subtotal) * (Number(item.fee_percent_snapshot) / 100);
    g.totalFee += fee;
    g.totalPayout += (Number(item.subtotal) - fee);
  }
  return Array.from(grouped.values());
}

export async function previewSettlement(
  _prevState: SettlementPreviewState,
  formData: FormData,
): Promise<SettlementPreviewState> {
  const parsed = periodSchema.safeParse({
    consignorId: formData.get("consignorId"),
    periodStart: formData.get("periodStart"),
    periodEnd: formData.get("periodEnd"),
  });

  if (!parsed.success) {
    return { error: "Pilih penitip dan periode yang valid" };
  }

  const profile = await getCurrentProfile();
  if (!profile.tenantId) {
    return { error: "Tenant tidak ditemukan" };
  }

  const supabase = await createClient();
  
  // 1. Get all transactions in period
  const { data, error } = await supabase
    .rpc("compute_consignor_settlement", {
      p_consignor_id: parsed.data.consignorId,
      p_period_start: parsed.data.periodStart,
      p_period_end: parsed.data.periodEnd,
    })
    .single();

  if (error || !data) {
    return { error: "Gagal menghitung rekap settlement" };
  }

  const row = data as {
    total_sales: number;
    total_fee: number;
    total_payout: number;
  };

  // 1b. Get RAW details for this queried period
  const rawDetails = await getSettlementDetails(
    supabase,
    parsed.data.consignorId,
    parsed.data.periodStart,
    parsed.data.periodEnd
  );

  // 2. Get existing settlements in period (overlapping)
  const { data: existing } = await supabase
    .from("settlements")
    .select("id, total_sales, total_fee, total_payout, created_at, period_start, period_end")
    .eq("consignor_id", parsed.data.consignorId)
    .lte("period_start", parsed.data.periodEnd)
    .gte("period_end", parsed.data.periodStart)
    .order("created_at", { ascending: true });

  const existingSettlements = await Promise.all((existing ?? []).map(async (s) => {
    // Fetch details for each existing settlement based on its period
    const sDetails = await getSettlementDetails(
      supabase,
      parsed.data.consignorId,
      s.period_start,
      s.period_end
    );
    return {
      id: s.id,
      totalSales: s.total_sales,
      totalFee: s.total_fee,
      totalPayout: s.total_payout,
      createdAt: s.created_at,
      periodStart: s.period_start,
      periodEnd: s.period_end,
      details: sDetails,
    };
  }));

  // 3. Subtract existing from total to find unsettled
  const settledSales = existingSettlements.reduce((sum, s) => sum + s.totalSales, 0);
  const settledFee = existingSettlements.reduce((sum, s) => sum + s.totalFee, 0);
  const settledPayout = existingSettlements.reduce((sum, s) => sum + s.totalPayout, 0);

  const unsettledSales = Math.max(0, row.total_sales - settledSales);
  const unsettledFee = Math.max(0, row.total_fee - settledFee);
  const unsettledPayout = Math.max(0, row.total_payout - settledPayout);

  // 3b. Subtract existing details from raw details to find unsettled details
  const unsettledDetailsMap = new Map<string, SettlementItemDetail>();
  for (const item of rawDetails) {
    unsettledDetailsMap.set(item.productId, { ...item }); // clone
  }

  for (const s of existingSettlements) {
    for (const d of s.details ?? []) {
      if (unsettledDetailsMap.has(d.productId)) {
        const target = unsettledDetailsMap.get(d.productId)!;
        target.qty = Math.max(0, target.qty - d.qty);
        target.totalSales = Math.max(0, target.totalSales - d.totalSales);
        target.totalFee = Math.max(0, target.totalFee - d.totalFee);
        target.totalPayout = Math.max(0, target.totalPayout - d.totalPayout);
      }
    }
  }

  // Filter out products that have 0 unsettled qty
  const unsettledDetails = Array.from(unsettledDetailsMap.values()).filter(d => d.qty > 0);

  let unsettledPreview = null;
  if (unsettledSales > 0) {
    unsettledPreview = {
      totalSales: unsettledSales,
      totalFee: unsettledFee,
      totalPayout: unsettledPayout,
      details: unsettledDetails,
    };
  }

  return {
    error: null,
    existingSettlements,
    unsettledPreview,
  };
}

export async function finalizeSettlement(
  consignorId: string,
  periodStart: string,
  periodEnd: string,
  preview: SettlementPreview,
): Promise<{ error: string | null }> {
  const profile = await getCurrentProfile();
  if (!profile.tenantId) return { error: "Tenant tidak ditemukan" };

  const supabase = await createClient();
  const { error } = await supabase.from("settlements").insert({
    tenant_id: profile.tenantId,
    consignor_id: consignorId,
    period_start: periodStart,
    period_end: periodEnd,
    total_sales: preview.totalSales,
    total_fee: preview.totalFee,
    total_payout: preview.totalPayout,
    status: "paid",
  });

  if (error) return { error: "Gagal menyimpan settlement" };
  return { error: null };
}

export async function getReceiptDetails(
  consignorId: string,
  periodStart: string,
  periodEnd: string
): Promise<SettlementItemDetail[]> {
  const supabase = await createClient();
  return getSettlementDetails(supabase, consignorId, periodStart, periodEnd);
}
