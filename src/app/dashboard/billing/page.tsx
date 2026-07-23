import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { computeSubscriptionStatus } from "@/lib/billing/subscription-status";
import { PayInvoiceButton } from "./pay-invoice-button";
import { Check } from "lucide-react";

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

  // Diurutkan period_end desc dari query, jadi invoice pertama selalu yang terbaru —
  // tetap ditampilkan walau sudah lunas/gratis, bukan cuma saat masih perlu dibayar.
  const latestInvoice = invoices && invoices.length > 0 ? invoices[0] : null;
  const needsPayment = latestInvoice?.status === "unpaid" || latestInvoice?.status === "overdue";
  const isFeeExempt = latestInvoice !== null && Number(latestInvoice.amount_due) === 0 && !needsPayment;
  const clientKey = process.env.MIDTRANS_CLIENT_KEY;

  return (
    <div className="mx-auto max-w-4xl space-y-12">
      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Tagihan</h1>
        <p className="text-lg font-medium text-muted-foreground max-w-xl">
          Kelola status langganan dan lihat riwayat tagihan MitraTitip untuk toko Anda.
        </p>
      </div>

      {/* Status & Current Invoice Bento */}
      <div className={`overflow-hidden rounded-[2rem] border ring-1 ring-foreground/5 shadow-sm ${
        status === "suspended" ? "bg-destructive/10 border-destructive/20" :
        status === "grace" ? "bg-orange-500/10 border-orange-500/20" :
        "bg-gradient-to-br from-background to-primary/[0.02]"
      }`}>
        <div className="grid grid-cols-1 md:grid-cols-2">
          
          {/* Status Section */}
          <div className="p-8 sm:p-10 border-b md:border-b-0 md:border-r border-foreground/5 flex flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status Langganan</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="relative flex h-4 w-4">
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    status === "suspended" ? "bg-destructive" :
                    status === "grace" ? "bg-orange-500" :
                    status === "active" ? "bg-green-500" : "bg-primary"
                  }`}></span>
                  <span className={`relative inline-flex rounded-full h-4 w-4 ${
                    status === "suspended" ? "bg-destructive" :
                    status === "grace" ? "bg-orange-500" :
                    status === "active" ? "bg-green-500" : "bg-primary"
                  }`}></span>
                </span>
                <p className="text-3xl font-extrabold tracking-tight">{STATUS_LABEL[status] ?? status}</p>
              </div>
            </div>
            
            {status === "suspended" && (
              <div className="mt-6 rounded-xl bg-destructive/10 p-5 border border-destructive/20 shadow-sm">
                <p className="text-sm font-bold leading-relaxed text-destructive">
                  Akses Kasir dibatasi karena tagihan belum dibayar. Lunasi tagihan berjalan untuk mengaktifkan kembali.
                </p>
              </div>
            )}
          </div>

          {/* Current Invoice Section */}
          <div className="p-8 sm:p-10 bg-background/50 flex flex-col justify-between">
            {latestInvoice ? (
              <>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {needsPayment ? "Tagihan Berjalan" : "Tagihan Terakhir"}
                  </p>
                  <p className="mt-4 text-5xl font-black tracking-tighter text-foreground">
                    {isFeeExempt ? "Gratis" : formatCurrency(Number(latestInvoice.amount_due))}
                  </p>
                  <div className="mt-6 space-y-2 text-sm font-medium text-muted-foreground">
                    <p className="flex justify-between items-center"><span>Periode</span> <span className="text-foreground font-bold">{latestInvoice.period_start} &mdash; {latestInvoice.period_end}</span></p>
                    {needsPayment && (
                      <>
                        <p className="flex justify-between items-center"><span>Jatuh Tempo</span> <span className="text-foreground font-bold">{latestInvoice.due_date}</span></p>
                        <p className="flex justify-between items-center"><span>Batas Akses</span> <span className="text-foreground font-bold">{latestInvoice.grace_end}</span></p>
                      </>
                    )}
                  </div>
                </div>
                <div className="mt-8">
                  {needsPayment ? (
                    clientKey ? (
                      <PayInvoiceButton
                        invoiceId={latestInvoice.id}
                        clientKey={clientKey}
                        isProduction={process.env.MIDTRANS_IS_PRODUCTION === "true"}
                      />
                    ) : (
                      <div className="rounded-xl border border-dashed p-4 text-center">
                        <p className="text-sm font-bold text-muted-foreground">Pembayaran online belum dikonfigurasi.</p>
                      </div>
                    )
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl bg-green-500/10 p-4 border border-green-500/20">
                      <Check className="h-5 w-5 shrink-0 text-green-600" />
                      <p className="text-sm font-bold text-green-700">
                        {isFeeExempt ? "Tidak dikenakan biaya untuk periode ini." : "Sudah lunas."}
                      </p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center space-y-4 py-8">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold tracking-tight text-foreground">Semua Lunas</p>
                  <p className="mt-1.5 text-sm font-medium text-muted-foreground/80">Tidak ada tagihan berjalan saat ini.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-4">
        <h2 className="mb-6 text-sm font-bold uppercase tracking-widest text-muted-foreground">Riwayat Tagihan</h2>
        {invoices && invoices.length > 0 ? (
          <div className="overflow-hidden rounded-3xl border bg-background shadow-sm ring-1 ring-foreground/5">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/30 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-6 py-5 font-bold">Periode</th>
                  <th className="px-6 py-5 font-bold">Jumlah</th>
                  <th className="px-6 py-5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foreground/5">
                {invoices.map((invoice) => (
                  <tr key={invoice.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-6 py-5 font-medium whitespace-nowrap">
                      {invoice.period_start} <span className="text-muted-foreground mx-2">&rarr;</span> {invoice.period_end}
                    </td>
                    <td className="px-6 py-5 font-bold tabular-nums">
                      {Number(invoice.amount_due) === 0 ? "Gratis" : formatCurrency(Number(invoice.amount_due))}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                        invoice.status === "paid" || invoice.status === "manual_paid" ? "bg-green-500/10 text-green-600" :
                        invoice.status === "overdue" ? "bg-destructive/10 text-destructive" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {INVOICE_STATUS_LABEL[invoice.status] ?? invoice.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed bg-muted/10 py-16 text-center">
            <p className="text-lg font-bold text-foreground">Belum ada riwayat tagihan</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Anda masih dalam masa trial atau belum ada tagihan yang diterbitkan.</p>
          </div>
        )}
      </div>
    </div>
  );
}
