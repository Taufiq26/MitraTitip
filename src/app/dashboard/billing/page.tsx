import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { computeSubscriptionStatus } from "@/lib/billing/subscription-status";

const STATUS_LABEL: Record<string, string> = {
  trial: "Masa Trial",
  active: "Aktif",
  grace: "Menunggak (Masa Tenggang)",
  suspended: "Akses Kasir Dibatasi",
};

export default async function BillingPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const status = profile.tenantId
    ? await computeSubscriptionStatus({ supabase, tenantId: profile.tenantId })
    : "trial";

  const { data: currentInvoice } = profile.tenantId
    ? await supabase
        .from("invoices")
        .select("id, period_start, period_end, amount_due, due_date, grace_end, status")
        .eq("tenant_id", profile.tenantId)
        .order("period_end", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

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
            Akses Kasir dibatasi karena tagihan belum dibayar. Silakan lunasi tagihan di bawah untuk mengaktifkan kembali.
          </p>
        )}

        {currentInvoice ? (
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <p>Periode: {currentInvoice.period_start} s/d {currentInvoice.period_end}</p>
            <p>Tagihan: Rp{Number(currentInvoice.amount_due).toLocaleString("id-ID")}</p>
            <p>Jatuh tempo: {currentInvoice.due_date} (batas akses: {currentInvoice.grace_end})</p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Belum ada tagihan — Anda masih dalam masa trial.</p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        Pembayaran online via Midtrans dan riwayat tagihan akan tersedia di sini pada pembaruan berikutnya.
      </p>
    </div>
  );
}
