"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function DataTableSearch({ placeholder = "Cari..." }: { placeholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const defaultQuery = searchParams.get("q") ?? "";

  const [query, setQuery] = useState(defaultQuery);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      const currentQ = params.get("q") ?? "";
      
      // Avoid infinite loops by checking if the value actually changed
      if (query === currentQ) return;

      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, pathname, router, searchParams]);

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-9"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}
