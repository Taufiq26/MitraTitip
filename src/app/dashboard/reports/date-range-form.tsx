"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      className="flex flex-wrap items-center gap-3"
    >
      <div className="flex items-center rounded-lg border bg-background px-2 shadow-sm">
        <Input
          id="from"
          type="date"
          value={start}
          onChange={(e) => setStart(e.target.value)}
          className="h-11 w-36 border-0 bg-transparent px-2 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-sm font-medium"
          aria-label="Dari tanggal"
        />
        <span className="text-muted-foreground/40 font-medium px-1">&rarr;</span>
        <Input
          id="to"
          type="date"
          value={end}
          onChange={(e) => setEnd(e.target.value)}
          className="h-11 w-36 border-0 bg-transparent px-2 focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none text-sm font-medium"
          aria-label="Sampai tanggal"
        />
      </div>
      <Button type="submit" className="h-11 px-5 font-medium rounded-lg">
        Terapkan
      </Button>
    </form>
  );
}
