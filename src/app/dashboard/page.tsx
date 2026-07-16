import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { mapProductRow, type ProductRow } from "@/lib/types/product";
import { computeSalesReport } from "@/lib/reports/sales-report";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  let lowStockProducts: ReturnType<typeof mapProductRow>[] = [];
  let todaySales: Awaited<ReturnType<typeof computeSalesReport>> | null = null;

  if (profile.role === "admin") {
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("*")
      .eq("track_stock", true)
      .not("low_stock_threshold", "is", null)
      .order("stock_qty")
      .returns<ProductRow[]>();

    lowStockProducts = (data ?? [])
      .map(mapProductRow)
      .filter((p) => p.lowStockThreshold !== null && p.stockQty <= p.lowStockThreshold);

    const today = new Date().toISOString().slice(0, 10);
    todaySales = await computeSalesReport(supabase, today, today);
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">
        Selamat datang, {profile.fullName.split(" ")[0]}
      </h1>

      {profile.role === "admin" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Penjualan hari ini</CardTitle>
              <CardDescription>{todaySales?.transactionCount ?? 0} transaksi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>{currencyFormatter.format(todaySales?.totalRevenue ?? 0)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Laba bersih</span>
                <span>{currencyFormatter.format(todaySales?.netProfit ?? 0)}</span>
              </div>
              <Link
                href="/dashboard/reports"
                className="text-sm text-primary hover:underline"
              >
                Lihat laporan lengkap &rarr;
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Stok rendah
                {lowStockProducts.length > 0 && (
                  <Badge variant="destructive">{lowStockProducts.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>
                {lowStockProducts.length === 0
                  ? "Semua stok barang masih aman."
                  : "Barang berikut perlu segera diisi ulang."}
              </CardDescription>
            </CardHeader>
            {lowStockProducts.length > 0 && (
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {lowStockProducts.map((product) => (
                    <li key={product.id} className="flex justify-between">
                      <span>{product.name}</span>
                      <span className="text-muted-foreground">
                        sisa {product.stockQty}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            )}
          </Card>
        </div>
      )}

      {profile.role === "kasir" && (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Mulai transaksi</CardTitle>
            <CardDescription>
              Buka halaman Kasir untuk mulai melayani pelanggan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/pos" className="text-sm text-primary hover:underline">
              Buka Kasir &rarr;
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
