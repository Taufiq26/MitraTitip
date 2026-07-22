import { createAdminClient } from "@/lib/supabase/admin";
import { computeSubscriptionStatus } from "@/lib/billing/subscription-status";
import { BillingAdminTable, type TenantBillingRow } from "./billing-admin-table";

interface InvoiceRow {
  id: string;
  tenant_id: string;
  period_start: string;
  period_end: string;
  net_revenue: number;
  amount_due: number;
  status: string;
  due_date: string;
}

export default async function SuperAdminBillingPage() {
  const supabase = createAdminClient();

  const { data: tenants } = await supabase.from("tenants").select("id, name").order("name");
  const { data: subscriptions } = await supabase
    .from("subscriptions")
    .select("tenant_id, fee_percent, trial_end");
  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, tenant_id, period_start, period_end, net_revenue, amount_due, status, due_date")
    .order("period_end", { ascending: false })
    .returns<InvoiceRow[]>();

  const subscriptionByTenant = new Map((subscriptions ?? []).map((s) => [s.tenant_id, s]));
  const latestInvoiceByTenant = new Map<string, InvoiceRow>();
  for (const invoice of invoices ?? []) {
    if (!latestInvoiceByTenant.has(invoice.tenant_id)) {
      latestInvoiceByTenant.set(invoice.tenant_id, invoice);
    }
  }

  const rows: TenantBillingRow[] = await Promise.all(
    (tenants ?? []).map(async (tenant) => {
      const subscription = subscriptionByTenant.get(tenant.id);
      const latestInvoice = latestInvoiceByTenant.get(tenant.id);
      const status = await computeSubscriptionStatus({ supabase, tenantId: tenant.id });

      return {
        tenantId: tenant.id,
        tenantName: tenant.name,
        status,
        feePercent: Number(subscription?.fee_percent ?? 2),
        currentInvoice: latestInvoice
          ? {
              id: latestInvoice.id,
              period: `${latestInvoice.period_start} — ${latestInvoice.period_end}`,
              netRevenue: Number(latestInvoice.net_revenue),
              amountDue: Number(latestInvoice.amount_due),
              status: latestInvoice.status,
              dueDate: latestInvoice.due_date,
            }
          : null,
      };
    }),
  );

  const totalOutstanding = rows.reduce((sum, row) => {
    if (row.currentInvoice && ["unpaid", "overdue"].includes(row.currentInvoice.status)) {
      return sum + row.currentInvoice.amountDue;
    }
    return sum;
  }, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Laporan Piutang Platform</h1>
        <p className="text-muted-foreground">
          Total piutang belum terbayar saat ini: <strong>Rp{totalOutstanding.toLocaleString("id-ID")}</strong>
        </p>
      </div>

      <BillingAdminTable rows={rows} />
    </div>
  );
}
