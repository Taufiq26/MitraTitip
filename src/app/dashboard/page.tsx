import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold">
        Selamat datang, {profile.fullName.split(" ")[0]}
      </h1>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>
            Fitur transaksi kasir, produk, titipan, dan laporan akan tersedia
            di fase pengembangan berikutnya.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
