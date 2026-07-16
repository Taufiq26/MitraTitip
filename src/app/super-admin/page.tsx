import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SuperAdminPage() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Panel Super Admin</CardTitle>
        <CardDescription>
          Monitoring daftar tenant akan diimplementasikan di Phase 6.
        </CardDescription>
      </CardHeader>
    </Card>
  );
}
