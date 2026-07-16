"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

const productInputSchema = z.object({
  name: z.string().trim().min(1, "Nama wajib diisi"),
  barcode: z.string().trim().optional().nullable(),
  category: z.string().trim().optional().nullable(),
  costPrice: z.coerce.number().min(0, "Harga modal tidak boleh negatif"),
  sellPrice: z.coerce.number().min(0, "Harga jual tidak boleh negatif"),
  trackStock: z.coerce.boolean(),
  stockQty: z.coerce.number().min(0).default(0),
  lowStockThreshold: z.coerce.number().min(0).optional().nullable(),
});

export type ProductActionState = { error: string | null };

function parseProductForm(formData: FormData) {
  return productInputSchema.safeParse({
    name: formData.get("name"),
    barcode: formData.get("barcode") || null,
    category: formData.get("category") || null,
    costPrice: formData.get("costPrice"),
    sellPrice: formData.get("sellPrice"),
    trackStock: formData.get("trackStock") === "on",
    stockQty: formData.get("stockQty") || 0,
    lowStockThreshold: formData.get("lowStockThreshold") || null,
  });
}

export async function createProduct(
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const profile = await getCurrentProfile();
  if (!profile.tenantId) {
    return { error: "Tenant tidak ditemukan" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    tenant_id: profile.tenantId,
    name: parsed.data.name,
    barcode: parsed.data.barcode,
    category: parsed.data.category,
    cost_price: parsed.data.costPrice,
    sell_price: parsed.data.sellPrice,
    track_stock: parsed.data.trackStock,
    stock_qty: parsed.data.stockQty,
    low_stock_threshold: parsed.data.lowStockThreshold,
  });

  if (error) {
    const message =
      error.code === "23505" ? "Barcode sudah dipakai" : "Gagal menyimpan produk";
    return { error: message };
  }

  revalidatePath("/dashboard/products");
  return { error: null };
}

export async function updateProduct(
  productId: string,
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const parsed = parseProductForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  const profile = await getCurrentProfile();
  if (!profile.tenantId) {
    return { error: "Tenant tidak ditemukan" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.data.name,
      barcode: parsed.data.barcode,
      category: parsed.data.category,
      cost_price: parsed.data.costPrice,
      sell_price: parsed.data.sellPrice,
      track_stock: parsed.data.trackStock,
      stock_qty: parsed.data.stockQty,
      low_stock_threshold: parsed.data.lowStockThreshold,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId)
    .eq("tenant_id", profile.tenantId);

  if (error) {
    const message =
      error.code === "23505" ? "Barcode sudah dipakai" : "Gagal menyimpan produk";
    return { error: message };
  }

  revalidatePath("/dashboard/products");
  return { error: null };
}

export async function deleteProduct(productId: string): Promise<void> {
  const profile = await getCurrentProfile();
  if (!profile.tenantId) return;

  const supabase = await createClient();
  await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("tenant_id", profile.tenantId);

  revalidatePath("/dashboard/products");
}
