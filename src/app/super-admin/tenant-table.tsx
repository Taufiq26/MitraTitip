"use client";

import { useState, Fragment, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronUp, Search, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ServerPagination } from "@/components/ui/server-pagination";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type TenantUser = {
  id: string;
  full_name: string;
  role: string;
  email: string;
};

export type TenantWithUsers = {
  id: string;
  name: string;
  created_at: string;
  users: TenantUser[];
};

interface TenantTableProps {
  tenants: TenantWithUsers[];
  currentPage: number;
  totalPages: number;
  currentLimit: number;
}

export function TenantTable({ tenants, currentPage, totalPages, currentLimit }: TenantTableProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (id: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-foreground">Daftar Tenant</h2>
          <p className="text-sm font-medium text-muted-foreground mt-1">Kelola toko yang terdaftar di MitraTitip.</p>
        </div>
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Cari nama toko..."
            className="h-12 w-full rounded-2xl bg-background border-none px-12 text-[15px] font-bold shadow-sm ring-1 ring-foreground/5 transition-all focus-visible:bg-primary/[0.02] focus-visible:ring-primary/30"
            value={search}
            onChange={onSearchChange}
          />
        </div>
      </div>
      
      <div className="overflow-hidden rounded-[2rem] bg-background shadow-sm ring-1 ring-foreground/5">
        <Table>
          <TableHeader>
            <TableRow className="border-none hover:bg-transparent">
              <TableHead className="w-16 h-14"></TableHead>
              <TableHead className="h-14 text-xs font-bold uppercase tracking-widest text-muted-foreground">Nama Toko</TableHead>
              <TableHead className="h-14 text-xs font-bold uppercase tracking-widest text-muted-foreground">Tanggal Daftar</TableHead>
              <TableHead className="h-14 text-right pr-8 text-xs font-bold uppercase tracking-widest text-muted-foreground">Jumlah Pengguna</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="py-16 text-center">
                  <p className="text-lg font-bold text-muted-foreground">
                    {search ? "Tidak ada tenant yang cocok dengan pencarian." : "Belum ada tenant yang mendaftar."}
                  </p>
                </TableCell>
              </TableRow>
            )}
            {tenants.map((tenant) => (
              <Fragment key={tenant.id}>
                <TableRow 
                  className={`cursor-pointer transition-colors border-b-foreground/5 ${expandedRows.has(tenant.id) ? "bg-primary/[0.02]" : "hover:bg-primary/[0.02]"}`}
                  onClick={() => toggleRow(tenant.id)}
                >
                  <TableCell className="py-5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/5 text-muted-foreground ml-2 transition-transform duration-200">
                      {expandedRows.has(tenant.id) ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="text-[15px] font-bold text-foreground">{tenant.name}</span>
                  </TableCell>
                  <TableCell className="py-5">
                    <span className="text-[14px] font-medium text-muted-foreground">
                      {new Date(tenant.created_at).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </span>
                  </TableCell>
                  <TableCell className="py-5 text-right pr-8">
                    <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                      <Users className="h-4 w-4" />
                      {tenant.users.length}
                    </div>
                  </TableCell>
                </TableRow>
                
                {expandedRows.has(tenant.id) && (
                  <TableRow className="bg-primary/[0.01] hover:bg-primary/[0.01] border-b-foreground/5">
                    <TableCell colSpan={4} className="p-0">
                      <div className="px-8 py-6 pl-20">
                        <h4 className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-4">Pengguna Terdaftar</h4>
                        
                        {tenant.users.length > 0 ? (
                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {tenant.users.map(user => (
                              <div key={user.id} className="flex flex-col gap-1 rounded-2xl bg-background p-4 shadow-sm ring-1 ring-foreground/5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[14px] font-bold text-foreground truncate">{user.full_name}</span>
                                  <Badge 
                                    variant="outline" 
                                    className={`shrink-0 text-[10px] font-black uppercase tracking-wider ${
                                      user.role === 'admin' 
                                        ? 'border-primary/30 bg-primary/10 text-primary' 
                                        : 'border-muted-foreground/20 text-muted-foreground'
                                    }`}
                                  >
                                    {user.role}
                                  </Badge>
                                </div>
                                <span className="text-xs font-medium text-muted-foreground truncate">{user.email}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="rounded-2xl border border-dashed border-foreground/10 bg-background/50 p-6 text-center">
                            <p className="text-sm font-medium text-muted-foreground">Belum ada pengguna terdaftar.</p>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
        <ServerPagination currentPage={currentPage} totalPages={totalPages} currentLimit={currentLimit} />
      </div>
    </div>
  );
}
