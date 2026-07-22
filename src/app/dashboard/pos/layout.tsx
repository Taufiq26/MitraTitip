import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { computeSubscriptionStatus } from "@/lib/billing/subscription-status";

/**
 * Guard khusus rute Kasir/POS. Sengaja tidak ditaruh di middleware/proxy global
 * agar navigasi rute dashboard lain tidak kena query tambahan per halaman (lihat
 * catatan performa navigasi di architecture.md).
 */
export default async function PosLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  if (profile.tenantId) {
    const supabase = await createClient();
    const status = await computeSubscriptionStatus({ supabase, tenantId: profile.tenantId });

    if (status === "suspended") {
      redirect("/dashboard/billing");
    }
  }

  return <>{children}</>;
}
