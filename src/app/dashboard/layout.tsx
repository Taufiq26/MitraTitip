import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { logout } from "@/app/logout/actions";
import { Button } from "@/components/ui/button";

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

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="flex items-center px-8 py-6 bg-background">
        {/* Brand (Left) */}
        <div className="flex flex-1 items-center justify-start">
          <div>
            <p className="text-xl font-extrabold tracking-tighter">MitraTitip.</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {profile.fullName} &middot; {profile.role === "admin" ? "Admin" : "Kasir"}
            </p>
          </div>
        </div>
        
        {/* Navigation (Center) */}
        <nav className="hidden items-center justify-center gap-8 lg:flex">
          {[...BASE_NAV, ...(profile.role === "admin" ? ADMIN_NAV : [])].map(
            (item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        {/* Actions (Right) */}
        <div className="flex flex-1 items-center justify-end">
          <form action={logout}>
            <Button 
              type="submit" 
              variant="ghost" 
              size="sm" 
              className="text-xs font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
            >
              Keluar
            </Button>
          </form>
        </div>
      </header>
      <main className="flex-1 p-8 sm:p-12 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
}
