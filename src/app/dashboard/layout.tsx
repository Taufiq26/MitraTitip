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
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-6">
          <div>
            <p className="font-semibold">MitraTitip</p>
            <p className="text-sm text-muted-foreground">
              {profile.fullName} &middot; {profile.role === "admin" ? "Admin" : "Kasir"}
            </p>
          </div>
          <nav className="flex items-center gap-4">
            {[...BASE_NAV, ...(profile.role === "admin" ? ADMIN_NAV : [])].map(
              (item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm">
            Keluar
          </Button>
        </form>
      </header>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
