"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

const periodSchema = z.object({
  consignorId: z.string().uuid(),
  periodStart: z.string().min(1),
  periodEnd: z.string().min(1),
});

export type SettlementPreview = {
  totalSales: number;
  totalFee: number;
  totalPayout: number;
  isRealized?: boolean;
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
  }[];
  unsettledPreview?: SettlementPreview | null;
};

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

  const existingSettlements = (existing ?? []).map((s) => ({
    id: s.id,
    totalSales: s.total_sales,
    totalFee: s.total_fee,
    totalPayout: s.total_payout,
    createdAt: s.created_at,
    periodStart: s.period_start,
    periodEnd: s.period_end,
  }));

  // 3. Subtract existing from total to find unsettled
  const settledSales = existingSettlements.reduce((sum, s) => sum + s.totalSales, 0);
  const settledFee = existingSettlements.reduce((sum, s) => sum + s.totalFee, 0);
  const settledPayout = existingSettlements.reduce((sum, s) => sum + s.totalPayout, 0);

  const unsettledSales = Math.max(0, row.total_sales - settledSales);
  const unsettledFee = Math.max(0, row.total_fee - settledFee);
  const unsettledPayout = Math.max(0, row.total_payout - settledPayout);

  let unsettledPreview = null;
  if (unsettledSales > 0) {
    unsettledPreview = {
      totalSales: unsettledSales,
      totalFee: unsettledFee,
      totalPayout: unsettledPayout,
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
