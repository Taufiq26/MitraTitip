import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { mapProductRow, type ProductRow } from "@/lib/types/product";
import { computeSalesReport } from "@/lib/reports/sales-report";
import { ProductDialog } from "./products/product-dialog";

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
    <div className="relative space-y-8">
      <div className="space-y-2 relative z-10">
        <h1 className="text-4xl font-extrabold tracking-tight">
          Selamat datang, {profile.fullName.split(" ")[0]}
        </h1>
        <p className="text-base font-medium text-muted-foreground">
          Berikut adalah ringkasan operasional MitraTitip hari ini.
        </p>
      </div>

      {profile.role === "admin" && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 relative z-10">
          
          {/* Sales Bento */}
          <div className="flex flex-col justify-between space-y-12 rounded-3xl bg-gradient-to-br from-background to-primary/[0.05] p-8 shadow-sm ring-1 ring-foreground/5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Penjualan Hari Ini</p>
              <p className="mt-1 text-sm font-medium text-muted-foreground/80">{todaySales?.transactionCount ?? 0} transaksi diselesaikan</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-5xl font-black tracking-tighter sm:text-6xl text-foreground">
                {currencyFormatter.format(todaySales?.totalRevenue ?? 0)}
              </p>
              <div className="inline-flex items-center rounded-full bg-primary/20 px-4 py-1.5 ring-1 ring-primary/30">
                <p className="text-sm font-bold text-foreground/90">
                  Laba bersih: {currencyFormatter.format(todaySales?.netProfit ?? 0)}
                </p>
              </div>
            </div>
            
            <div>
              <Link
                href="/dashboard/reports"
                className="inline-flex items-center text-xs font-bold uppercase tracking-widest text-foreground transition-colors hover:text-primary"
              >
                Lihat Laporan Lengkap &rarr;
              </Link>
            </div>
          </div>

          {/* Stock Bento */}
          <div className={`flex flex-col rounded-3xl p-8 shadow-sm ring-1 ring-foreground/5 transition-colors ${lowStockProducts.length > 0 ? "bg-gradient-to-br from-background to-destructive/[0.08]" : "bg-background"}`}>
            <div className="mb-6 flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Status Stok Barang</p>
              {lowStockProducts.length > 0 && (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-sm font-bold text-destructive-foreground shadow-sm">
                  {lowStockProducts.length}
                </span>
              )}
            </div>
            
            {lowStockProducts.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center space-y-2 py-12 text-center">
                 <p className="text-2xl font-bold tracking-tight text-muted-foreground">Semua stok aman.</p>
                 <p className="text-sm font-medium text-muted-foreground/70">Tidak ada barang yang perlu diisi ulang saat ini.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {lowStockProducts.map((product) => (
                  <li key={product.id} className="flex items-center justify-between rounded-2xl bg-background/60 p-4 backdrop-blur-sm">
                    <div>
                      <span className="block font-bold">{product.name}</span>
                      <span className="mt-1 block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                        Sisa: {product.stockQty} &middot; Batas: {product.lowStockThreshold}
                      </span>
                    </div>
                    <ProductDialog product={product} triggerText="Isi Stok" triggerVariant="outline" />
                  </li>
                ))}
              </ul>
            )}
          </div>
          
        </div>
      )}

      {profile.role === "kasir" && (
        <div className="mx-auto flex max-w-xl flex-col items-center space-y-8 rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-12 text-center text-primary-foreground shadow-2xl shadow-primary/30 ring-1 ring-primary-foreground/20 relative overflow-hidden z-10">
          {/* Internal Glow */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/20 blur-3xl" />
          
          <div className="space-y-4 relative z-10">
            <h2 className="text-5xl font-extrabold tracking-tighter">Buka Kasir</h2>
            <p className="text-lg font-medium leading-relaxed opacity-90">
              Mesin kasir siap digunakan. Silakan masuk untuk mulai melayani pelanggan hari ini.
            </p>
          </div>
          <Link href="/dashboard/pos" className="inline-flex h-14 items-center justify-center rounded-full bg-background px-8 text-base font-bold text-foreground transition-all hover:scale-105 hover:bg-background/90 shadow-lg">
            Mulai Transaksi &rarr;
          </Link>
        </div>
      )}
    </div>
  );
}
