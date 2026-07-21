import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { UserDialog } from "./user-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function UsersPage() {
  const profile = await getCurrentProfile();
  if (profile.role !== "admin") {
    redirect("/dashboard");
  }

  const supabase = await createClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("id, full_name, role, phone, address, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Pengguna</h1>
          <p className="text-muted-foreground font-medium mt-1">
            Kelola akses staf dan kasir Anda.
          </p>
        </div>
        <UserDialog />
      </div>

      <div className="rounded-2xl border border-foreground/5 bg-background shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[300px] text-xs font-bold uppercase tracking-widest text-muted-foreground h-12">
                Nama Staf
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-widest text-muted-foreground h-12">
                Peran
              </TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-widest text-muted-foreground h-12">
                Kontak
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(users || []).length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground font-medium">
                  Belum ada pengguna.
                </TableCell>
              </TableRow>
            ) : (
              (users || []).map((user) => (
                <TableRow key={user.id} className="group transition-colors hover:bg-muted/30">
                  <TableCell className="font-semibold py-4">
                    <div className="flex flex-col">
                      <span className="text-foreground">{user.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge variant={user.role === "admin" ? "default" : "outline"} className="uppercase font-bold tracking-widest text-[10px]">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <div className="flex flex-col text-sm text-muted-foreground font-medium">
                      <span>{user.phone || "-"}</span>
                      {user.address && <span className="text-xs text-muted-foreground/70 mt-1">{user.address}</span>}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
