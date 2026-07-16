import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { mapProductRow, type ProductRow } from "@/lib/types/product";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  let lowStockProducts: ReturnType<typeof mapProductRow>[] = [];
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
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">
        Selamat datang, {profile.fullName.split(" ")[0]}
      </h1>

      {profile.role === "admin" && (
        <Card className="max-w-md">
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
      )}

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>
            Fitur transaksi kasir, titipan, dan laporan akan tersedia di fase
            pengembangan berikutnya.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
