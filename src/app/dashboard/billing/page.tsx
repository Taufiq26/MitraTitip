import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { computeSubscriptionStatus } from "@/lib/billing/subscription-status";
import { PayInvoiceButton } from "./pay-invoice-button";

const STATUS_LABEL: Record<string, string> = {
  trial: "Masa Trial",
  active: "Aktif",
  grace: "Menunggak (Masa Tenggang)",
  suspended: "Akses Kasir Dibatasi",
};

const INVOICE_STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  unpaid: "Belum Dibayar",
  overdue: "Lewat Jatuh Tempo",
  paid: "Lunas",
  manual_paid: "Lunas (Manual)",
};

function formatCurrency(amount: number): string {
  return `Rp${amount.toLocaleString("id-ID")}`;
}

export default async function BillingPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const status = profile.tenantId
    ? await computeSubscriptionStatus({ supabase, tenantId: profile.tenantId })
    : "trial";

  const { data: invoices } = profile.tenantId
    ? await supabase
        .from("invoices")
        .select("id, period_start, period_end, amount_due, due_date, grace_end, status")
        .eq("tenant_id", profile.tenantId)
        .order("period_end", { ascending: false })
    : { data: [] };

  const currentInvoice = invoices?.find((invoice) => invoice.status === "unpaid" || invoice.status === "overdue");
  const clientKey = process.env.MIDTRANS_CLIENT_KEY;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Tagihan</h1>
        <p className="text-muted-foreground">Status langganan dan tagihan MitraTitip untuk toko Anda.</p>
      </div>

      <div className="rounded-2xl border bg-card p-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status</p>
        <p className="mt-1 text-xl font-bold">{STATUS_LABEL[status] ?? status}</p>

        {status === "suspended" && (
          <p className="mt-3 text-sm font-medium text-destructive">
            Akses Kasir dibatasi karena tagihan belum dibayar. Lunasi tagihan di bawah untuk mengaktifkan kembali.
          </p>
        )}

        {currentInvoice ? (
          <div className="mt-4 space-y-3">
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Periode: {currentInvoice.period_start} s/d {currentInvoice.period_end}</p>
              <p>Tagihan: {formatCurrency(Number(currentInvoice.amount_due))}</p>
              <p>Jatuh tempo: {currentInvoice.due_date} (batas akses: {currentInvoice.grace_end})</p>
            </div>
            {clientKey ? (
              <PayInvoiceButton
                invoiceId={currentInvoice.id}
                clientKey={clientKey}
                isProduction={process.env.MIDTRANS_IS_PRODUCTION === "true"}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Pembayaran online belum dikonfigurasi platform.</p>
            )}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Tidak ada tagihan berjalan saat ini.</p>
        )}
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-widest text-muted-foreground">Riwayat Tagihan</h2>
        {invoices && invoices.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Periode</th>
                  <th className="px-4 py-3">Jumlah</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td className="px-4 py-3">{invoice.period_start} — {invoice.period_end}</td>
                    <td className="px-4 py-3">{formatCurrency(Number(invoice.amount_due))}</td>
                    <td className="px-4 py-3">{INVOICE_STATUS_LABEL[invoice.status] ?? invoice.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Belum ada riwayat tagihan — Anda masih dalam masa trial.</p>
        )}
      </div>
    </div>
  );
}
