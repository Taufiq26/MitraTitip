import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { verifyMidtransSignature } from "@/lib/billing/midtrans-signature";
import { syncSubscriptionStatus } from "@/lib/billing/subscription-status";

interface MidtransNotification {
  order_id: string;
  transaction_id: string;
  status_code: string;
  gross_amount: string;
  signature_key: string;
  transaction_status: string;
  fraud_status?: string;
}

const PAID_STATUSES = new Set(["settlement", "capture"]);

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as MidtransNotification | null;

  if (!payload) {
    return NextResponse.json({ success: false, data: null, error: "Payload tidak valid" }, { status: 400 });
  }

  const isValidSignature = verifyMidtransSignature({
    orderId: payload.order_id,
    statusCode: payload.status_code,
    grossAmount: payload.gross_amount,
    signatureKey: payload.signature_key,
  });

  if (!isValidSignature) {
    return NextResponse.json({ success: false, data: null, error: "Signature tidak valid" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("id, tenant_id, status")
    .eq("midtrans_order_id", payload.order_id)
    .maybeSingle();

  if (error || !invoice) {
    // Notifikasi untuk order_id yang tidak dikenal — tetap balas 200 agar Midtrans tidak retry terus.
    return NextResponse.json({ success: true, data: { processed: false }, error: null });
  }

  const isPaid =
    PAID_STATUSES.has(payload.transaction_status) &&
    (payload.fraud_status === undefined || payload.fraud_status === "accept");

  if (isPaid && invoice.status !== "paid" && invoice.status !== "manual_paid") {
    await supabase
      .from("invoices")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        midtrans_transaction_id: payload.transaction_id,
      })
      .eq("id", invoice.id);
    await syncSubscriptionStatus({ supabase, tenantId: invoice.tenant_id });
  }

  return NextResponse.json({ success: true, data: { processed: true }, error: null });
}
