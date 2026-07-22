import type { SupabaseClient } from "@supabase/supabase-js";

export type SubscriptionStatus = "trial" | "active" | "grace" | "suspended";

interface ComputeStatusParams {
  supabase: SupabaseClient;
  tenantId: string;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Status dihitung live dari trial_end + invoice terbaru, bukan sekadar baca kolom
 * cache subscriptions.status, supaya guard akses POS tidak pernah lebih longgar
 * dari kenyataan hanya karena job generate invoice belum sempat jalan.
 */
export async function computeSubscriptionStatus({
  supabase,
  tenantId,
}: ComputeStatusParams): Promise<SubscriptionStatus> {
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("trial_end")
    .eq("tenant_id", tenantId)
    .maybeSingle();

  if (!subscription) return "suspended";
  if (today() <= subscription.trial_end) return "trial";

  const { data: latestInvoice } = await supabase
    .from("invoices")
    .select("status, grace_end")
    .eq("tenant_id", tenantId)
    .order("period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!latestInvoice) return "active";
  if (latestInvoice.status === "paid" || latestInvoice.status === "manual_paid") return "active";
  if (today() <= latestInvoice.grace_end) return "grace";

  return "suspended";
}

export async function syncSubscriptionStatus(params: ComputeStatusParams): Promise<SubscriptionStatus> {
  const status = await computeSubscriptionStatus(params);
  await params.supabase.from("subscriptions").update({ status }).eq("tenant_id", params.tenantId);
  return status;
}
