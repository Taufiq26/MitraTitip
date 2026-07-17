import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CurrentProfile = {
  id: string;
  tenantId: string | null;
  role: "super_admin" | "admin" | "kasir";
  fullName: string;
};

export const getCurrentProfile = cache(async (): Promise<CurrentProfile> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("tenant_id, role, full_name")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  return {
    id: user.id,
    tenantId: profile.tenant_id,
    role: profile.role,
    fullName: profile.full_name,
  };
});
