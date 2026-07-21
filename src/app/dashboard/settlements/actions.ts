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
  preview: SettlementPreview | null;
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
    return { error: "Pilih penitip dan periode yang valid", preview: null };
  }

  const profile = await getCurrentProfile();
  if (!profile.tenantId) {
    return { error: "Tenant tidak ditemukan", preview: null };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .rpc("compute_consignor_settlement", {
      p_consignor_id: parsed.data.consignorId,
      p_period_start: parsed.data.periodStart,
      p_period_end: parsed.data.periodEnd,
    })
    .single();

  if (error || !data) {
    return { error: "Gagal menghitung rekap settlement", preview: null };
  }

  const row = data as {
    total_sales: number;
    total_fee: number;
    total_payout: number;
  };

  const { data: existingSettlement } = await supabase
    .from("settlements")
    .select("id")
    .eq("consignor_id", parsed.data.consignorId)
    .eq("period_start", parsed.data.periodStart)
    .eq("period_end", parsed.data.periodEnd)
    .limit(1)
    .maybeSingle();

  const isRealized = !!existingSettlement;

  return {
    error: null,
    preview: {
      totalSales: row.total_sales,
      totalFee: row.total_fee,
      totalPayout: row.total_payout,
      isRealized,
    },
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
