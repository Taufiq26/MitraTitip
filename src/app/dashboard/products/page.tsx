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
    <div className="relative space-y-8">
      <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Katalog Barang</h1>
          <p className="text-base font-medium text-muted-foreground">Kelola daftar harga dan lacak stok barang toko.</p>
        </div>
        <ProductDialog />
      </div>

      <div className="relative z-10 overflow-hidden rounded-3xl bg-background/95 backdrop-blur-xl shadow-sm ring-1 ring-foreground/5">
        <div className="border-b border-foreground/5 p-6 md:px-8 md:py-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-primary/[0.02]">
          <Suspense fallback={<div className="w-full max-w-sm h-10 bg-muted rounded-xl animate-pulse" />}>
            <DataTableSearch placeholder="Cari nama atau barcode..." />
          </Suspense>
        </div>
        
        <div className="overflow-x-auto p-2">
          <Table>
            <TableHeader>
              <TableRow className="border-none hover:bg-transparent">
                <TableHead className="h-12 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Barang</TableHead>
                <TableHead className="h-12 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Harga Modal</TableHead>
                <TableHead className="h-12 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Harga Jual</TableHead>
                <TableHead className="h-12 px-6 text-xs font-bold uppercase tracking-widest text-muted-foreground">Stok</TableHead>
                <TableHead className="h-12 px-6 text-right text-xs font-bold uppercase tracking-widest text-muted-foreground">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center">
                    <p className="text-lg font-bold text-muted-foreground">Katalog kosong.</p>
                    <p className="text-sm font-medium text-muted-foreground/70">Tambahkan barang pertama Anda ke dalam sistem.</p>
                  </TableCell>
                </TableRow>
              )}
              {products.map((product) => {
                const isLowStock =
                  product.trackStock &&
                  product.lowStockThreshold !== null &&
                  product.stockQty <= product.lowStockThreshold;

                return (
                  <TableRow key={product.id} className="group border-b-foreground/5 hover:bg-primary/[0.03] transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="flex flex-col gap-1.5">
                        <span className="text-[15px] font-bold leading-none text-foreground">{product.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] font-medium text-muted-foreground/70">{product.barcode || "Tanpa Barcode"}</span>
                          {product.isConsignment && (
                            <span className="rounded-full bg-secondary px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-secondary-foreground">Titipan</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-[15px] font-medium text-muted-foreground">
                      {currencyFormatter.format(product.costPrice)}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-base font-black text-foreground">
                      {currencyFormatter.format(product.sellPrice)}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      {product.trackStock ? (
                        <div className="flex flex-col gap-1">
                          <span className={`text-[15px] font-bold ${isLowStock ? "text-destructive" : "text-foreground"}`}>
                            {product.stockQty} <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Unit</span>
                          </span>
                          {isLowStock && (
                            <span className="text-[9px] font-black uppercase tracking-widest text-destructive">Kritis</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/40">Tanpa Lacak</span>
                      )}
                    </TableCell>
                    <TableCell className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
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
    </div>
  );
}
