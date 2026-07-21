import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { computeSalesReport } from "@/lib/reports/sales-report";
import { DateRangeForm } from "./date-range-form";
import { TransactionHistory } from "./transaction-history";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function firstDayOfMonthIso() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const profile = await getCurrentProfile();
  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  const { from, to } = await searchParams;
  const periodStart = from ?? firstDayOfMonthIso();
  const periodEnd = to ?? todayIso();

  const supabase = await createClient();
  const report = await computeSalesReport(supabase, periodStart, periodEnd);

  const { data: transactionsData } = await supabase
    .from("transactions")
    .select(`
      id,
      local_id,
      total_amount,
      payment_method,
      created_at,
      profiles ( full_name ),
      transaction_items (
        product_id,
        qty,
        subtotal,
        products ( name )
      )
    `)
    .gte("created_at", `${periodStart}T00:00:00.000Z`)
    .lte("created_at", `${periodEnd}T23:59:59.999Z`)
    .order("created_at", { ascending: false });

  const transactions = (transactionsData ?? []).map((t) => ({
    id: t.id,
    localId: t.local_id,
    totalAmount: t.total_amount,
    paymentMethod: t.payment_method,
    createdAt: t.created_at,
    cashierName: Array.isArray(t.profiles) ? t.profiles[0]?.full_name : (t.profiles as { full_name: string } | null)?.full_name,
    items: (t.transaction_items ?? []).map((ti: unknown) => {
      const item = ti as { product_id: string; qty: number; subtotal: number; products: { name: string } | { name: string }[] | null };
      return {
        productId: item.product_id,
        productName: (Array.isArray(item.products) ? item.products[0]?.name : item.products?.name) || "Unknown",
        qty: item.qty,
        subtotal: item.subtotal,
      };
    })
  }));

  return (
    <div className="pb-16 max-w-7xl mx-auto space-y-16">
      {/* Header Section */}
      <header className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground">Laporan Penjualan</h1>
          <p className="text-muted-foreground mt-3 font-medium text-lg">
            Periode {new Date(periodStart).toLocaleDateString("id-ID", { dateStyle: "long" })} &ndash; {new Date(periodEnd).toLocaleDateString("id-ID", { dateStyle: "long" })}
          </p>
        </div>
        <DateRangeForm periodStart={periodStart} periodEnd={periodEnd} />
      </header>

      {/* Ringkasan Keuangan - Breaking the card grid monotony for main numbers */}
      <section>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">
          {/* Penjualan */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Total Penjualan</h3>
            <div className="text-6xl font-bold tracking-tighter text-foreground mb-8">
              {currencyFormatter.format(report.totalRevenue)}
            </div>
            <div className="grid grid-cols-3 gap-6 border-t border-border pt-6">
              <div>
                <div className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Tunai</div>
                <div className="font-semibold text-base">{currencyFormatter.format(report.byPaymentMethod.cash)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">QRIS</div>
                <div className="font-semibold text-base">{currencyFormatter.format(report.byPaymentMethod.qris)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Transfer</div>
                <div className="font-semibold text-base">{currencyFormatter.format(report.byPaymentMethod.transfer)}</div>
              </div>
            </div>
          </div>

          {/* Laba */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Laba Bersih</h3>
            <div className="text-6xl font-bold tracking-tighter text-foreground mb-8">
              {currencyFormatter.format(report.netProfit)}
            </div>
            <div className="grid grid-cols-2 gap-6 border-t border-border pt-6">
              <div>
                <div className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Laba Kotor</div>
                <div className="font-semibold text-base">{currencyFormatter.format(report.grossProfit)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-2 font-semibold uppercase tracking-wider">Porsi Titipan</div>
                <div className="font-semibold text-base text-muted-foreground">-{currencyFormatter.format(report.consignmentPayout)}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Produk Terlaris - List view with space rhythm */}
      <section>
        <h3 className="text-2xl font-bold tracking-tight mb-8">Produk Terlaris</h3>
        {report.topProducts.length === 0 ? (
          <p className="text-muted-foreground text-lg">Belum ada penjualan di periode ini.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {report.topProducts.slice(0, 6).map((product, idx) => (
              <div key={product.productId} className="flex items-center gap-5 p-5 rounded-2xl border bg-background shadow-sm transition-colors hover:bg-muted/30">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-lg">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate text-base mb-1">{product.name}</div>
                  <div className="text-muted-foreground text-sm font-medium">{product.qtySold} terjual</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      
      <TransactionHistory transactions={transactions} />
    </div>
  );
}

