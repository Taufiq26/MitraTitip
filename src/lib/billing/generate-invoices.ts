import type { SupabaseClient } from "@supabase/supabase-js";
import { calculateNetRevenue } from "./calculate-net-revenue";
import { syncSubscriptionStatus } from "./subscription-status";
import { BILLING_PERIOD_DAYS, INVOICE_DUE_DAYS, INVOICE_GRACE_DAYS } from "./constants";

function addDays(dateString: string, days: number): Date {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date;
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

interface GenerateResult {
  generated: number;
  markedOverdue: number;
}

/**
 * Dipanggil oleh cron bulanan (lihat /api/billing/generate). Menandai invoice yang
 * lewat jatuh tempo sebagai overdue, lalu membuat invoice baru untuk setiap tenant
 * yang periode penagihannya sudah selesai tapi belum ditagih.
 */
export async function generateDueInvoices(supabase: SupabaseClient): Promise<GenerateResult> {
  const today = toDateString(new Date());

  const { data: overdueRows, error: overdueError } = await supabase
    .from("invoices")
    .update({ status: "overdue" })
    .eq("status", "unpaid")
    .lt("due_date", today)
    .select("id");

  if (overdueError) {
    throw new Error(`Gagal menandai invoice overdue: ${overdueError.message}`);
  }

  const { data: subscriptions, error: subError } = await supabase
    .from("subscriptions")
    .select("tenant_id, fee_percent, trial_end")
    .lte("trial_end", today);

  if (subError) {
    throw new Error(`Gagal mengambil daftar subscription: ${subError.message}`);
  }

  let generated = 0;

  for (const subscription of subscriptions ?? []) {
    const { data: lastInvoice } = await supabase
      .from("invoices")
      .select("period_end")
      .eq("tenant_id", subscription.tenant_id)
      .order("period_end", { ascending: false })
      .limit(1)
      .maybeSingle();

    const periodStart = lastInvoice?.period_end ?? subscription.trial_end;
    const periodEndDate = addDays(periodStart, BILLING_PERIOD_DAYS);
    const periodEnd = toDateString(periodEndDate);

    if (periodEnd > today) continue;

    const netRevenue = await calculateNetRevenue({
      supabase,
      tenantId: subscription.tenant_id,
      periodStart,
      periodEnd,
    });

    const feePercent = Number(subscription.fee_percent);
    const amountDue = Math.round((netRevenue * feePercent) / 100);
    const dueDate = toDateString(addDays(periodEnd, INVOICE_DUE_DAYS));
    const graceEnd = toDateString(addDays(periodEnd, INVOICE_DUE_DAYS + INVOICE_GRACE_DAYS));

    // Tenant dengan fee 0% (mis. pilot/beta) tetap dapat catatan invoice untuk riwayat,
    // tapi otomatis lunas — tidak ada yang perlu dibayar sehingga tidak boleh memblokir akses.
    const isFeeExempt = feePercent === 0;

    const { error: insertError } = await supabase.from("invoices").insert({
      tenant_id: subscription.tenant_id,
      period_start: periodStart,
      period_end: periodEnd,
      net_revenue: netRevenue,
      fee_percent_snapshot: feePercent,
      amount_due: amountDue,
      due_date: dueDate,
      grace_end: graceEnd,
      status: isFeeExempt ? "paid" : "unpaid",
      paid_at: isFeeExempt ? new Date().toISOString() : null,
    });

    if (insertError) {
      throw new Error(`Gagal membuat invoice tenant ${subscription.tenant_id}: ${insertError.message}`);
    }

    generated += 1;
    await syncSubscriptionStatus({ supabase, tenantId: subscription.tenant_id });
  }

  return { generated, markedOverdue: overdueRows?.length ?? 0 };
}
