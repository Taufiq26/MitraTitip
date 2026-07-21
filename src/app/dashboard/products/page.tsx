import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { mapProductRow, type ProductRow } from "@/lib/types/product";
import { ProductDialog } from "./product-dialog";
import { DeleteProductButton } from "./delete-product-button";
import { Badge } from "@/components/ui/badge";
import { DataTableSearch } from "@/components/ui/data-table-search";
import { Suspense } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const profile = await getCurrentProfile();
  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*")
    .or("is_consignment.eq.false,and(is_consignment.eq.true,stock_qty.gt.0)")
    .order("name");
  
  if (q) {
    query = query.ilike("name", `%${q}%`);
  }

  const { data } = await query.returns<ProductRow[]>();

  const products = (data ?? []).map(mapProductRow);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-semibold">Barang</h1>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <Suspense fallback={<div className="w-full max-w-sm h-9 bg-muted rounded-md animate-pulse" />}>
            <DataTableSearch placeholder="Cari barang..." />
          </Suspense>
          <ProductDialog />
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Barcode</TableHead>
            <TableHead>Harga Modal</TableHead>
            <TableHead>Harga Jual</TableHead>
            <TableHead>Stok</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Belum ada barang. Tambahkan barang pertama Anda.
              </TableCell>
            </TableRow>
          )}
          {products.map((product) => {
            const isLowStock =
              product.trackStock &&
              product.lowStockThreshold !== null &&
              product.stockQty <= product.lowStockThreshold;

            return (
              <TableRow key={product.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {product.name}
                    {product.isConsignment && (
                      <Badge variant="secondary" className="text-xs">Titipan</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>{product.barcode ?? "-"}</TableCell>
                <TableCell>{currencyFormatter.format(product.costPrice)}</TableCell>
                <TableCell>{currencyFormatter.format(product.sellPrice)}</TableCell>
                <TableCell>
                  {product.trackStock ? (
                    <span className="flex items-center gap-2">
                      {product.stockQty}
                      {isLowStock && <Badge variant="destructive">Stok rendah</Badge>}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Tanpa lacak stok</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <ProductDialog product={product} />
                    <DeleteProductButton productId={product.id} />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      </div>
    </div>
  );
}
