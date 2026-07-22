import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncSubscriptionStatus } from "@/lib/billing/subscription-status";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const profile = await getCurrentProfile();
  if (profile.role !== "super_admin") {
    return NextResponse.json({ success: false, data: null, error: "Tidak diizinkan" }, { status: 403 });
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: invoice, error: fetchError } = await supabase
    .from("invoices")
    .select("id, tenant_id, status")
    .eq("id", id)
    .maybeSingle();

  if (fetchError || !invoice) {
    return NextResponse.json({ success: false, data: null, error: "Invoice tidak ditemukan" }, { status: 404 });
  }

  if (invoice.status === "paid" || invoice.status === "manual_paid") {
    return NextResponse.json({ success: false, data: null, error: "Invoice sudah lunas" }, { status: 409 });
  }

  const { data, error } = await supabase
    .from("invoices")
    .update({ status: "manual_paid", paid_at: new Date().toISOString(), marked_paid_by: profile.id })
    .eq("id", id)
    .select("id, status, marked_paid_by")
    .single();

  if (error || !data) {
    return NextResponse.json({ success: false, data: null, error: "Gagal menandai invoice lunas" }, { status: 500 });
  }

  await syncSubscriptionStatus({ supabase, tenantId: invoice.tenant_id });

  return NextResponse.json({ success: true, data, error: null });
}
