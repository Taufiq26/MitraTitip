import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { computeSalesReport } from "@/lib/reports/sales-report";
import { DateRangeForm } from "./date-range-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const PAYMENT_LABEL: Record<string, string> = {
  cash: "Tunai",
  qris: "QRIS",
  transfer: "Transfer Bank",
};

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

  return (
    <div>
      <h1 className="mb-2 text-2xl font-semibold">Laporan</h1>
      <p className="mb-4 text-sm text-muted-foreground">
        Periode {periodStart} &ndash; {periodEnd}
      </p>
      <DateRangeForm periodStart={periodStart} periodEnd={periodEnd} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Penjualan</CardTitle>
            <CardDescription>{report.transactionCount} transaksi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between font-semibold">
              <span>Total penjualan</span>
              <span>{currencyFormatter.format(report.totalRevenue)}</span>
            </div>
            {(["cash", "qris", "transfer"] as const).map((method) => (
              <div key={method} className="flex justify-between text-muted-foreground">
                <span>{PAYMENT_LABEL[method]}</span>
                <span>{currencyFormatter.format(report.byPaymentMethod[method])}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Laba</CardTitle>
            <CardDescription>Harga modal & fee titipan diperhitungkan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Laba kotor</span>
              <span>{currencyFormatter.format(report.grossProfit)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Dibayar ke penitip</span>
              <span>{currencyFormatter.format(report.consignmentPayout)}</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>Laba bersih</span>
              <span>{currencyFormatter.format(report.netProfit)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Produk Terlaris</CardTitle>
          </CardHeader>
          <CardContent>
            {report.topProducts.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Belum ada penjualan di periode ini.
              </p>
            )}
            <ol className="space-y-1 text-sm">
              {report.topProducts.map((product, index) => (
                <li key={product.productId} className="flex justify-between">
                  <span>
                    {index + 1}. {product.name}
                  </span>
                  <span className="text-muted-foreground">{product.qtySold} terjual</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
