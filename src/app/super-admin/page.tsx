import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TenantRow {
  id: string;
  name: string;
  created_at: string;
}

interface ProfileTenantRow {
  tenant_id: string | null;
}

export default async function SuperAdminPage() {
  const supabase = await createClient();

  const { data: tenants } = await supabase
    .from("tenants")
    .select("id, name, created_at")
    .order("created_at", { ascending: false })
    .returns<TenantRow[]>();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("tenant_id")
    .returns<ProfileTenantRow[]>();

  const userCountByTenant = new Map<string, number>();
  for (const profile of profiles ?? []) {
    if (!profile.tenant_id) continue;
    userCountByTenant.set(
      profile.tenant_id,
      (userCountByTenant.get(profile.tenant_id) ?? 0) + 1,
    );
  }

  const tenantList = tenants ?? [];

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Daftar Tenant</CardTitle>
          <CardDescription>
            {tenantList.length} toko/kantin terdaftar di MitraTitip
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Toko</TableHead>
                <TableHead>Tanggal Daftar</TableHead>
                <TableHead>Jumlah User</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenantList.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    Belum ada tenant yang mendaftar.
                  </TableCell>
                </TableRow>
              )}
              {tenantList.map((tenant) => (
                <TableRow key={tenant.id}>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell>
                    {new Date(tenant.created_at).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell>{userCountByTenant.get(tenant.id) ?? 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
