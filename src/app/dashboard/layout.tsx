import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { logout } from "@/app/logout/actions";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between border-b px-6 py-3">
        <div>
          <p className="font-semibold">MitraTitip</p>
          <p className="text-sm text-muted-foreground">
            {profile.fullName} &middot; {profile.role === "admin" ? "Admin" : "Kasir"}
          </p>
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
