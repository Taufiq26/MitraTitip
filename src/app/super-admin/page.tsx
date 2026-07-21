import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { TenantTable, TenantWithUsers, TenantUser } from "./tenant-table";
import { Store, Users, Package, ReceiptText } from "lucide-react";

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

export default async function SuperAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string; q?: string }>;
}) {
  const supabase = await createClient();
  const supabaseAdmin = createAdminClient();

  const { page, limit, q } = await searchParams;
  const currentPage = parseInt(page || "1", 10);
  const PAGE_SIZE = parseInt(limit || "20", 10);
  const searchQuery = q || "";

  const [{ count: totalTenants }, { count: totalUsers }, { count: totalProducts }, { count: totalSales }] = await Promise.all([
    supabase.from("tenants").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("sales").select("*", { count: "exact", head: true })
  ]);

  let tenantQuery = supabase
    .from("tenants")
    .select("id, name, created_at", { count: "exact" });
    
  if (searchQuery) {
    tenantQuery = tenantQuery.ilike("name", `%${searchQuery}%`);
  }

  const { data: tenants, count: tenantCount } = await tenantQuery
    .order("created_at", { ascending: false })
    .range((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE - 1)
    .returns<TenantRow[]>();

  const totalPages = tenantCount ? Math.ceil(tenantCount / PAGE_SIZE) : 1;

  const tenantIds = tenants?.map(t => t.id) || [];
  
  let profiles: ProfileRow[] = [];
  if (tenantIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, tenant_id, full_name, role")
      .in("tenant_id", tenantIds)
      .returns<ProfileRow[]>();
    profiles = data || [];
  }

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
  for (const profile of profiles) {
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

  const kpis = [
    { label: "Total Toko", value: totalTenants || 0, icon: Store, color: "text-blue-500" },
    { label: "Total Pengguna", value: totalUsers || 0, icon: Users, color: "text-emerald-500" },
    { label: "Total Produk", value: totalProducts || 0, icon: Package, color: "text-amber-500" },
    { label: "Total Transaksi", value: totalSales || 0, icon: ReceiptText, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-8 pb-12">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi, i) => (
          <div key={i} className="flex flex-col gap-2 rounded-3xl bg-background p-6 shadow-sm ring-1 ring-foreground/5 hover:ring-primary/20 hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/[0.03] ${kpi.color}`}>
                <kpi.icon className="h-5 w-5" />
              </div>
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">{kpi.label}</p>
            </div>
            <p className="mt-2 text-4xl font-black tracking-tighter text-foreground">{kpi.value.toLocaleString('id-ID')}</p>
          </div>
        ))}
      </div>
      
      <TenantTable 
        tenants={tenantsWithUsers}
        currentPage={currentPage}
        totalPages={totalPages}
        currentLimit={PAGE_SIZE}
      />
    </div>
  );
}
