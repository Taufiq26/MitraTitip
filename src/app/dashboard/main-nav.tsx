"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const BASE_NAV = [
  { href: "/dashboard", label: "Ringkasan" },
  { href: "/dashboard/pos", label: "Kasir" },
];

const ADMIN_NAV = [
  { href: "/dashboard/products", label: "Barang" },
  { href: "/dashboard/consignors", label: "Penitip" },
  { href: "/dashboard/settlements", label: "Settlement" },
  { href: "/dashboard/reports", label: "Laporan" },
];

export function MainNav({ role }: { role: string }) {
  const pathname = usePathname();
  const items = [...BASE_NAV, ...(role === "admin" ? ADMIN_NAV : [])];

  return (
    <nav className="hidden items-center justify-center gap-2 lg:flex">
      {items.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-4 py-2 text-[11px] font-black uppercase tracking-widest transition-all",
              isActive 
                ? "bg-foreground text-background shadow-md" 
                : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
