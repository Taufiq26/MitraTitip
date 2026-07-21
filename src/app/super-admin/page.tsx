import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TenantTable, TenantWithUsers, TenantUser } from "./tenant-table";

interface TenantRow {
  id: string;
  name: string;
  created_at: string;
}

interface ProfileRow {
  id: string;
  tenant_id: string | null;
  full_name: string;
  role: string;
}

export default async function SuperAdminPage() {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, name, created_at")
    .order("created_at", { ascending: false })
    .returns<TenantRow[]>();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, tenant_id, full_name, role")
    .returns<ProfileRow[]>();

  const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers({
    perPage: 1000,
  });

  const emailById = new Map<string, string>();
  if (authUsers?.users) {
    for (const user of authUsers.users) {
      if (user.email) {
        emailById.set(user.id, user.email);
      }
    }
  }

  const usersByTenant = new Map<string, TenantUser[]>();
  for (const profile of profiles ?? []) {
    if (!profile.tenant_id) continue;
    
    if (!usersByTenant.has(profile.tenant_id)) {
      usersByTenant.set(profile.tenant_id, []);
    }
    
    usersByTenant.get(profile.tenant_id)!.push({
      id: profile.id,
      full_name: profile.full_name,
      role: profile.role,
      email: emailById.get(profile.id) ?? "Tidak ada email",
    });
  }

  const tenantList = tenants ?? [];
  const tenantsWithUsers: TenantWithUsers[] = tenantList.map((tenant) => ({
    id: tenant.id,
    name: tenant.name,
    created_at: tenant.created_at,
    users: usersByTenant.get(tenant.id) ?? [],
  }));

  return (
    <div>
      <TenantTable tenants={tenantsWithUsers} />
    </div>
  );
}
