"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DateRangeForm({
  periodStart,
  periodEnd,
}: {
  periodStart: string;
  periodEnd: string;
}) {
  const router = useRouter();
  const [start, setStart] = useState(periodStart);
  const [end, setEnd] = useState(periodEnd);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push(`/dashboard/reports?from=${start}&to=${end}`);
      }}
      className="mb-6 flex flex-wrap items-end gap-3"
    >
      <div className="space-y-2">
        <Label htmlFor="from">Dari tanggal</Label>
        <Input
          id="from"
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="to">Sampai tanggal</Label>
        <Input
          id="to"
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
        />
      </div>
      <Button type="submit">Terapkan</Button>
    </form>
  );
}
