import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { logout } from "@/app/logout/actions";
import { Button } from "@/components/ui/button";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getCurrentProfile();

  if (profile.role !== "super_admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Global Ambient Glows (Fixed to prevent scrollbars, aligned to content center) */}
      <div className="pointer-events-none fixed inset-0 z-0 flex justify-center overflow-hidden">
        <div className="relative w-full max-w-7xl">
          <div className="absolute -top-20 -left-10 h-[50rem] w-[50rem] rounded-full bg-primary/20 blur-[120px]" />
          <div className="absolute -bottom-20 right-0 h-[40rem] w-[40rem] rounded-full bg-primary/10 blur-[120px]" />
        </div>
      </div>

      <header className="relative z-10 flex items-center px-8 py-6 bg-background/80 backdrop-blur-md border-b border-foreground/5">
        {/* Brand (Left) */}
        <div className="flex flex-1 items-center justify-start">
          <div>
            <p className="text-xl font-extrabold tracking-tighter">MitraTitip.</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              {profile.fullName} &middot; Super Admin
            </p>
          </div>
        </div>
        
        {/* Navigation (Center) */}
        <nav className="hidden items-center justify-center gap-8 lg:flex">
          {/* Tambahkan link menu super-admin di sini jika ada */}
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
      <main className="relative z-10 flex-1 p-8 sm:p-12 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  );
}
