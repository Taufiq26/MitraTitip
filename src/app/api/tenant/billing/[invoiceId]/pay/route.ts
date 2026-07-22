import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createSnapTransaction } from "@/lib/billing/midtrans";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ invoiceId: string }> },
) {
  const { invoiceId } = await params;
  const profile = await getCurrentProfile();

  if (profile.role !== "admin" || !profile.tenantId) {
    return NextResponse.json({ success: false, data: null, error: "Tidak diizinkan" }, { status: 403 });
  }

  const supabase = createAdminClient();
  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("id, tenant_id, amount_due, status, midtrans_order_id")
    .eq("id", invoiceId)
    .single();

  if (error || !invoice || invoice.tenant_id !== profile.tenantId) {
    return NextResponse.json({ success: false, data: null, error: "Invoice tidak ditemukan" }, { status: 404 });
  }

  if (invoice.status === "paid" || invoice.status === "manual_paid") {
    return NextResponse.json({ success: false, data: null, error: "Invoice sudah lunas" }, { status: 409 });
  }

  const { data: authUser } = await supabase.auth.admin.getUserById(profile.id);
  const orderId = invoice.midtrans_order_id ?? `INV-${invoice.id}`;

  try {
    const snap = await createSnapTransaction({
      orderId,
      amount: Math.round(Number(invoice.amount_due)),
      customerName: profile.fullName,
      customerEmail: authUser.user?.email ?? "no-reply@mitratitip.app",
    });

    if (!invoice.midtrans_order_id) {
      await supabase.from("invoices").update({ midtrans_order_id: orderId }).eq("id", invoice.id);
    }

    return NextResponse.json({
      success: true,
      data: { snap_token: snap.token, redirect_url: snap.redirectUrl },
      error: null,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal membuat transaksi pembayaran";
    return NextResponse.json({ success: false, data: null, error: message }, { status: 500 });
  }
}
