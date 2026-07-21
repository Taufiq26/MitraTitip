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
  periodEnd: string,
  minTime?: string | null,
  maxTime?: string | null
): Promise<SettlementItemDetail[]> {
  let query = supabase
    .from("transaction_items")
    .select(`
      qty,
      subtotal,
      fee_percent_snapshot,
      products ( id, name ),
      transactions!inner ( created_at ),
      consignment_batches!inner ( consignor_id )
    `)
    .eq("consignment_batches.consignor_id", consignorId);

  if (minTime) {
    query = query.gt("transactions.created_at", minTime);
  } else {
    query = query.gte("transactions.created_at", `${periodStart}T00:00:00.000Z`);
  }

  if (maxTime) {
    query = query.lte("transactions.created_at", maxTime);
  } else {
    query = query.lte("transactions.created_at", `${periodEnd}T23:59:59.999Z`);
  }

  const { data } = await query;

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

  // 2. Get existing settlements in period (overlapping)
  const { data: existing } = await supabase
    .from("settlements")
    .select("id, total_sales, total_fee, total_payout, created_at, period_start, period_end")
    .eq("consignor_id", parsed.data.consignorId)
    .lte("period_start", parsed.data.periodEnd)
    .gte("period_end", parsed.data.periodStart)
    .order("created_at", { ascending: true });

  const existingSettlements = [];
  let lastCreatedAt: string | null = null;

  for (const s of (existing ?? [])) {
    const sDetails = await getSettlementDetails(
      supabase,
      parsed.data.consignorId,
      s.period_start,
      s.period_end,
      lastCreatedAt,
      s.created_at
    );
    lastCreatedAt = s.created_at;
    
    existingSettlements.push({
      id: s.id,
      totalSales: s.total_sales,
      totalFee: s.total_fee,
      totalPayout: s.total_payout,
      createdAt: s.created_at,
      periodStart: s.period_start,
      periodEnd: s.period_end,
      details: sDetails,
    });
  }

  // 3. Calculate unsettled totals
  const settledSales = existingSettlements.reduce((sum, s) => sum + s.totalSales, 0);
  const settledFee = existingSettlements.reduce((sum, s) => sum + s.totalFee, 0);
  const settledPayout = existingSettlements.reduce((sum, s) => sum + s.totalPayout, 0);

  const unsettledSales = Math.max(0, row.total_sales - settledSales);
  const unsettledFee = Math.max(0, row.total_fee - settledFee);
  const unsettledPayout = Math.max(0, row.total_payout - settledPayout);

  let unsettledPreview = null;
  if (unsettledSales > 0) {
    const unsettledDetails = await getSettlementDetails(
      supabase,
      parsed.data.consignorId,
      parsed.data.periodStart,
      parsed.data.periodEnd,
      lastCreatedAt,
      null
    );

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
  periodEnd: string,
  settlementCreatedAt: string
): Promise<SettlementItemDetail[]> {
  const supabase = await createClient();
  
  // Find the previous settlement's created_at to use as minTime
  const { data } = await supabase
    .from("settlements")
    .select("created_at")
    .eq("consignor_id", consignorId)
    .lte("period_start", periodEnd)
    .gte("period_end", periodStart)
    .lt("created_at", settlementCreatedAt)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  const minTime = data ? data.created_at : null;
  
  return getSettlementDetails(supabase, consignorId, periodStart, periodEnd, minTime, settlementCreatedAt);
}
