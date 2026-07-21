import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { mapProductRow, type ProductRow } from "@/lib/types/product";
import { PosClient } from "./pos-client";

export default async function PosPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .or("is_consignment.eq.false,and(is_consignment.eq.true,stock_qty.gt.0)")
    .order("name")
    .returns<ProductRow[]>();

  const products = (data ?? []).map(mapProductRow);

  return <PosClient initialProducts={products} cashierName={profile.fullName} />;
}
