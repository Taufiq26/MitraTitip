"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export type ActionState = { error: string | null };

const consignorSchema = z.object({
  name: z.string().trim().min(1, "Nama penitip wajib diisi"),
  phone: z.string().trim().optional().nullable(),
});

export async function createConsignor(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = consignorSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const profile = await getCurrentProfile();
  if (!profile.tenantId) return { error: "Tenant tidak ditemukan" };

  const supabase = await createClient();
  const { error } = await supabase.from("consignors").insert({
    tenant_id: profile.tenantId,
    name: parsed.data.name,
    phone: parsed.data.phone,
  });

  if (error) return { error: "Gagal menyimpan penitip" };

  revalidatePath("/dashboard/consignors");
  return { error: null };
}

export async function updateConsignor(
  consignorId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = consignorSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || null,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const profile = await getCurrentProfile();
  if (!profile.tenantId) return { error: "Tenant tidak ditemukan" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("consignors")
    .update({ name: parsed.data.name, phone: parsed.data.phone })
    .eq("id", consignorId)
    .eq("tenant_id", profile.tenantId);

  if (error) return { error: "Gagal menyimpan penitip" };

  revalidatePath("/dashboard/consignors");
  return { error: null };
}

export async function deleteConsignor(consignorId: string): Promise<void> {
  const profile = await getCurrentProfile();
  if (!profile.tenantId) return;

  const supabase = await createClient();
  await supabase
    .from("consignors")
    .delete()
    .eq("id", consignorId)
    .eq("tenant_id", profile.tenantId);

  revalidatePath("/dashboard/consignors");
}

const batchSchema = z.object({
  productName: z.string().trim().min(1, "Nama barang wajib diisi"),
  sellPrice: z.coerce.number().min(0, "Harga jual tidak boleh negatif"),
  qtyReceived: z.coerce.number().positive("Jumlah titipan harus lebih dari 0"),
  feePercent: z.coerce.number().min(0).max(100).default(10),
  dateReceived: z.string().min(1, "Tanggal wajib diisi"),
});

export async function createConsignmentBatch(
  consignorId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const parsed = batchSchema.safeParse({
    productName: formData.get("productName"),
    sellPrice: formData.get("sellPrice"),
    qtyReceived: formData.get("qtyReceived"),
    feePercent: formData.get("feePercent") || 10,
    dateReceived: formData.get("dateReceived"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const profile = await getCurrentProfile();
  if (!profile.tenantId) return { error: "Tenant tidak ditemukan" };

  const supabase = await createClient();

  const { data: product, error: productError } = await supabase
    .from("products")
    .insert({
      tenant_id: profile.tenantId,
      name: parsed.data.productName,
      sell_price: parsed.data.sellPrice,
      cost_price: 0,
      track_stock: false,
      is_consignment: true,
    })
    .select("id")
    .single();

  if (productError || !product) {
    return { error: "Gagal membuat data barang titipan" };
  }

  const { error: batchError } = await supabase
    .from("consignment_batches")
    .insert({
      tenant_id: profile.tenantId,
      product_id: product.id,
      consignor_id: consignorId,
      qty_received: parsed.data.qtyReceived,
      fee_percent: parsed.data.feePercent,
      date_received: parsed.data.dateReceived,
    });

  if (batchError) {
    return { error: "Gagal menyimpan batch titipan" };
  }

  revalidatePath(`/dashboard/consignors/${consignorId}`);
  return { error: null };
}

export async function returnConsignmentBatch(
  batchId: string,
  consignorId: string,
): Promise<void> {
  const profile = await getCurrentProfile();
  if (!profile.tenantId) return;

  const supabase = await createClient();
  const { data: batch } = await supabase
    .from("consignment_batches")
    .select("qty_received, qty_sold, qty_returned")
    .eq("id", batchId)
    .eq("tenant_id", profile.tenantId)
    .single();

  if (!batch) return;

  const remaining = batch.qty_received - batch.qty_sold - batch.qty_returned;
  if (remaining <= 0) return;

  await supabase
    .from("consignment_batches")
    .update({
      qty_returned: batch.qty_returned + remaining,
      status: "returned",
    })
    .eq("id", batchId)
    .eq("tenant_id", profile.tenantId);

  revalidatePath(`/dashboard/consignors/${consignorId}`);
}
