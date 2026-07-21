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

async function getChronologicalSettlementItems(
  supabase: any,
  consignorId: string
) {
  // 1. Ambil semua batch penitip ini untuk tahu limit stok aslinya
  const { data: batches } = await supabase
    .from("consignment_batches")
    .select("id, qty_received, qty_returned")
    .eq("consignor_id", consignorId);

  const batchCaps = new Map<string, number>();
  for (const b of batches || []) {
    batchCaps.set(b.id, b.qty_received - (b.qty_returned || 0));
  }

  // 2. Ambil SEMUA transaksi untuk batch ini sepanjang waktu
  const { data: items } = await supabase
    .from("transaction_items")
    .select(`
      id,
      qty,
      unit_price,
      fee_percent_snapshot,
      consignment_batch_id,
      products ( id, name ),
      transactions!inner ( created_at )
    `)
    .in("consignment_batch_id", batches?.map((b: any) => b.id) || []);

  if (!items) return [];

  // 3. Urutkan dari yang paling lama
  const sortedItems = items.sort((a: any, b: any) => {
    return new Date(a.transactions.created_at).getTime() - new Date(b.transactions.created_at).getTime();
  });

  // 4. Lewati transaksi chronologically, capping qty
  const cappedItems = [];
  for (const item of sortedItems) {
    const batchId = item.consignment_batch_id;
    if (!batchId) continue;

    const remainingCap = batchCaps.get(batchId) || 0;
    if (remainingCap <= 0) continue; // Sudah melebihi stok, abaikan transaksi sisa

    const allowedQty = Math.min(item.qty, remainingCap);
    batchCaps.set(batchId, remainingCap - allowedQty);

    cappedItems.push({
      ...item,
      cappedQty: allowedQty,
      cappedSubtotal: allowedQty * item.unit_price
    });
  }

  return cappedItems;
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
  
  // 1. Hitung semua item valid (setelah di-cap) secara kronologis
  const allCappedItems = await getChronologicalSettlementItems(supabase, parsed.data.consignorId);

  // 2. Filter item yang masuk dalam periode ini
  const periodStartIso = `${parsed.data.periodStart}T00:00:00.000Z`;
  const periodEndIso = `${parsed.data.periodEnd}T23:59:59.999Z`;
  
  const periodItems = allCappedItems.filter((item: any) => {
    const time = item.transactions.created_at;
    return time >= periodStartIso && time <= periodEndIso;
  });

  let totalSales = 0;
  let totalFee = 0;
  let totalPayout = 0;

  for (const item of periodItems) {
    totalSales += item.cappedSubtotal;
    const fee = item.cappedSubtotal * (item.fee_percent_snapshot / 100);
    totalFee += fee;
    totalPayout += (item.cappedSubtotal - fee);
  }

  // 3. Get existing settlements in period
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
    // Cari detail untuk settlement ini
    const sItems = periodItems.filter((item: any) => {
      const time = item.transactions.created_at;
      const minTime = lastCreatedAt;
      const maxTime = s.created_at;
      if (minTime && time <= minTime) return false;
      if (time > maxTime) return false;
      return true;
    });

    const grouped = new Map<string, SettlementItemDetail>();
    for (const item of sItems) {
      const product = Array.isArray(item.products) ? item.products[0] : item.products;
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
      g.qty += item.cappedQty;
      g.totalSales += item.cappedSubtotal;
      const fee = item.cappedSubtotal * (item.fee_percent_snapshot / 100);
      g.totalFee += fee;
      g.totalPayout += (item.cappedSubtotal - fee);
    }

    lastCreatedAt = s.created_at;
    
    existingSettlements.push({
      id: s.id,
      totalSales: s.total_sales,
      totalFee: s.total_fee,
      totalPayout: s.total_payout,
      createdAt: s.created_at,
      periodStart: s.period_start,
      periodEnd: s.period_end,
      details: Array.from(grouped.values()),
    });
  }

  // 4. Calculate unsettled totals from the REMAINING items (after last settlement)
  const unsettledItems = periodItems.filter((item: any) => {
    if (!lastCreatedAt) return true;
    return item.transactions.created_at > lastCreatedAt;
  });

  let unsettledSales = 0;
  let unsettledFee = 0;
  let unsettledPayout = 0;
  const unsettledGrouped = new Map<string, SettlementItemDetail>();

  for (const item of unsettledItems) {
    unsettledSales += item.cappedSubtotal;
    const fee = item.cappedSubtotal * (item.fee_percent_snapshot / 100);
    unsettledFee += fee;
    unsettledPayout += (item.cappedSubtotal - fee);

    const product = Array.isArray(item.products) ? item.products[0] : item.products;
    const pId = product.id;
    if (!unsettledGrouped.has(pId)) {
      unsettledGrouped.set(pId, {
        productId: pId,
        productName: product.name,
        qty: 0,
        totalSales: 0,
        totalFee: 0,
        totalPayout: 0,
      });
    }
    const g = unsettledGrouped.get(pId)!;
    g.qty += item.cappedQty;
    g.totalSales += item.cappedSubtotal;
    g.totalFee += fee;
    g.totalPayout += (item.cappedSubtotal - fee);
  }

  let unsettledPreview = null;
  if (unsettledSales > 0) {
    unsettledPreview = {
      totalSales: unsettledSales,
      totalFee: unsettledFee,
      totalPayout: unsettledPayout,
      details: Array.from(unsettledGrouped.values()),
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

  if (error) {
    console.error("Error saving settlement:", error);
    return { error: "Gagal menyimpan settlement" };
  }
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
  const maxTime = settlementCreatedAt;

  const allCappedItems = await getChronologicalSettlementItems(supabase, consignorId);
  const periodStartIso = `${periodStart}T00:00:00.000Z`;
  const periodEndIso = `${periodEnd}T23:59:59.999Z`;

  const sItems = allCappedItems.filter((item: any) => {
    const time = item.transactions.created_at;
    if (time < periodStartIso || time > periodEndIso) return false;
    if (minTime && time <= minTime) return false;
    if (time > maxTime) return false;
    return true;
  });

  const grouped = new Map<string, SettlementItemDetail>();
  for (const item of sItems) {
    const product = Array.isArray(item.products) ? item.products[0] : item.products;
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
    g.qty += item.cappedQty;
    g.totalSales += item.cappedSubtotal;
    const fee = item.cappedSubtotal * (item.fee_percent_snapshot / 100);
    g.totalFee += fee;
    g.totalPayout += (item.cappedSubtotal - fee);
  }

  return Array.from(grouped.values());
}
