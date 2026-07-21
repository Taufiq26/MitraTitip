import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const itemSchema = z.object({
  product_id: z.string().uuid(),
  qty: z.number().positive(),
  unit_price: z.number().min(0),
});

const transactionSchema = z.object({
  local_id: z.string().min(1),
  total_amount: z.number().min(0),
  payment_method: z.enum(["cash", "qris", "transfer"]),
  cash_received: z.number().min(0).nullable().optional(),
  change_amount: z.number().min(0).nullable().optional(),
  items: z.array(itemSchema).min(1),
  created_at: z.string(),
});

const pushSchema = z.object({
  transactions: z.array(transactionSchema).min(1),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json(
      { success: false, data: null, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, role")
    .eq("id", user.id)
    .single();

  if (!profile?.tenant_id || profile.role === "super_admin") {
    return NextResponse.json(
      { success: false, data: null, error: "Tenant tidak ditemukan" },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = pushSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, data: null, error: "Payload tidak valid" },
      { status: 422 },
    );
  }

  const synced: string[] = [];
  const conflicts: string[] = [];

  for (const tx of parsed.data.transactions) {
    const { data: existing } = await supabase
      .from("transactions")
      .select("id")
      .eq("tenant_id", profile.tenant_id)
      .eq("local_id", tx.local_id)
      .maybeSingle();

    if (existing) {
      synced.push(tx.local_id);
      continue;
    }

    const productIds = [...new Set(tx.items.map((item) => item.product_id))];
    const { data: products } = await supabase
      .from("products")
      .select("id, track_stock, is_consignment, cost_price")
      .in("id", productIds);

    const productById = new Map((products ?? []).map((p) => [p.id, p]));

    const { data: insertedTx, error: txError } = await supabase
      .from("transactions")
      .insert({
        tenant_id: profile.tenant_id,
        cashier_id: user.id,
        local_id: tx.local_id,
        total_amount: tx.total_amount,
        payment_method: tx.payment_method,
        cash_received: tx.cash_received ?? null,
        change_amount: tx.change_amount ?? null,
        created_at: tx.created_at,
      })
      .select("id")
      .single();

    if (txError || !insertedTx) {
      conflicts.push(tx.local_id);
      continue;
    }

    for (const item of tx.items) {
      const product = productById.get(item.product_id);
      if (product?.is_consignment) {
        const { data: batches } = await supabase
          .from("consignment_batches")
          .select("id, fee_percent, qty_received, qty_sold, qty_returned")
          .eq("product_id", item.product_id)
          .eq("status", "active")
          .order("date_received", { ascending: true });

        let remainingQty = item.qty;

        if (batches) {
          for (const batch of batches) {
            if (remainingQty <= 0) break;
            const batchRemaining = batch.qty_received - batch.qty_sold - batch.qty_returned;
            if (batchRemaining <= 0) continue;

            const qtyToDeduct = Math.min(remainingQty, batchRemaining);
            const { error: rpcError } = await supabase.rpc("increment_batch_qty_sold", {
              p_batch_id: batch.id,
              p_qty: qtyToDeduct,
            });
            
            if (rpcError) {
              console.error("Failed to increment batch qty:", rpcError);
              continue; // If it fails, try the next batch or fallback
            }

            await supabase.from("transaction_items").insert({
              transaction_id: insertedTx.id,
              product_id: item.product_id,
              consignment_batch_id: batch.id,
              qty: qtyToDeduct,
              unit_price: item.unit_price,
              cost_price_snapshot: product?.cost_price ?? 0,
              fee_percent_snapshot: batch.fee_percent,
              subtotal: qtyToDeduct * item.unit_price,
            });

            remainingQty -= qtyToDeduct;
          }
        }

        // If there's still quantity left (e.g. oversold), record it without a batch
        if (remainingQty > 0) {
          await supabase.from("transaction_items").insert({
            transaction_id: insertedTx.id,
            product_id: item.product_id,
            consignment_batch_id: null,
            qty: remainingQty,
            unit_price: item.unit_price,
            cost_price_snapshot: product?.cost_price ?? 0,
            fee_percent_snapshot: null,
            subtotal: remainingQty * item.unit_price,
          });
        }
      } else {
        await supabase.from("transaction_items").insert({
          transaction_id: insertedTx.id,
          product_id: item.product_id,
          consignment_batch_id: null,
          qty: item.qty,
          unit_price: item.unit_price,
          cost_price_snapshot: product?.cost_price ?? 0,
          fee_percent_snapshot: null,
          subtotal: item.qty * item.unit_price,
        });
      }

      if (product?.track_stock) {
        await supabase.rpc("decrement_product_stock", {
          p_product_id: item.product_id,
          p_qty: item.qty,
        });
      }
    }

    synced.push(tx.local_id);
  }

  return NextResponse.json({
    success: true,
    data: { synced, conflicts },
    error: null,
  });
}
