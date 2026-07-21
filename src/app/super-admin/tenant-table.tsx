"use client";

import { useState, Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Search, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
}

export function TenantTable({ tenants }: TenantTableProps) {
  const [search, setSearch] = useState("");
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

  const filteredTenants = tenants.filter((tenant) =>
    tenant.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div>
          <CardTitle>Daftar Tenant</CardTitle>
          <CardDescription>
            {tenants.length} toko/kantin terdaftar di MitraTitip
          </CardDescription>
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama toko..."
            className="pl-9 max-w-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Nama Toko</TableHead>
              <TableHead>Tanggal Daftar</TableHead>
              <TableHead>Jumlah User</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTenants.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  {tenants.length === 0 ? "Belum ada tenant yang mendaftar." : "Tidak ada tenant yang cocok dengan pencarian."}
                </TableCell>
              </TableRow>
            )}
            {filteredTenants.map((tenant) => (
              <Fragment key={tenant.id}>
                <TableRow 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => toggleRow(tenant.id)}
                >
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 pointer-events-none">
                      {expandedRows.has(tenant.id) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell className="font-medium">{tenant.name}</TableCell>
                  <TableCell>
                    {new Date(tenant.created_at).toLocaleDateString("id-ID")}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      {tenant.users.length}
                    </div>
                  </TableCell>
                </TableRow>
                {expandedRows.has(tenant.id) && (
                  <TableRow>
                    <TableCell colSpan={4} className="p-0 bg-muted/20 border-b">
                      <div className="p-4 pl-[4.5rem]">
                        <h4 className="text-sm font-semibold mb-3 text-muted-foreground uppercase tracking-wider">Daftar Pengguna</h4>
                        {tenant.users.length > 0 ? (
                          <div className="space-y-3">
                            {tenant.users.map(user => (
                              <div key={user.id} className="flex items-center justify-between bg-background p-3 rounded-md border text-sm max-w-md shadow-sm">
                                <div>
                                  <div className="font-medium">{user.full_name}</div>
                                  <div className="text-xs text-muted-foreground">{user.email}</div>
                                </div>
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                  {user.role}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">Belum ada pengguna di toko ini.</div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
