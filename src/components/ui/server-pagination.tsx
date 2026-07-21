"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button, buttonVariants } from "./button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { cn } from "@/lib/utils";

export function ServerPagination({
  currentPage,
  totalPages,
  paramName = "page",
  limitParamName = "limit",
  currentLimit = 20,
}: {
  currentPage: number;
  totalPages: number;
  paramName?: string;
  limitParamName?: string;
  currentLimit?: number;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set(paramName, page.toString());
    return `${pathname}?${params.toString()}`;
  };

  const onLimitChange = (value: string | null) => {
    if (!value) return;
    const params = new URLSearchParams(searchParams);
    params.set(limitParamName, value);
    params.set(paramName, "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 mt-2 gap-4">
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full sm:w-auto">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium text-muted-foreground">Baris per halaman</p>
          <Select
            value={currentLimit.toString()}
            onValueChange={onLimitChange}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={currentLimit.toString()} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={pageSize.toString()}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto justify-end flex-wrap gap-y-2">
        {currentPage > 1 ? (
          <Link href={createPageUrl(1)} scroll={false} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden sm:flex")}>
            Awal
          </Link>
        ) : (
          <Button variant="outline" size="sm" className="hidden sm:flex" disabled>
            Awal
          </Button>
        )}
        
        {currentPage > 1 ? (
          <Link href={createPageUrl(currentPage - 1)} scroll={false} className={cn(buttonVariants({ variant: "outline", size: "icon" }), "w-8 h-8 sm:w-9 sm:h-9")}>
            &lsaquo;
          </Link>
        ) : (
          <Button variant="outline" size="icon" className="w-8 h-8 sm:w-9 sm:h-9" disabled>
            &lsaquo;
          </Button>
        )}

        {getPageNumbers().map((p, i) => {
          if (p === "...") {
            return (
              <span key={i} className="px-2 text-muted-foreground">
                ...
              </span>
            );
          }
          return currentPage !== p ? (
            <Link key={i} href={createPageUrl(p as number)} scroll={false} className={cn(buttonVariants({ variant: "outline", size: "icon" }), "w-8 h-8 sm:w-9 sm:h-9")}>
              {p}
            </Link>
          ) : (
            <Button key={i} variant="default" size="icon" className="w-8 h-8 sm:w-9 sm:h-9 font-bold" disabled>
              {p}
            </Button>
          );
        })}

        {currentPage < totalPages ? (
          <Link href={createPageUrl(currentPage + 1)} scroll={false} className={cn(buttonVariants({ variant: "outline", size: "icon" }), "w-8 h-8 sm:w-9 sm:h-9")}>
            &rsaquo;
          </Link>
        ) : (
          <Button variant="outline" size="icon" className="w-8 h-8 sm:w-9 sm:h-9" disabled>
            &rsaquo;
          </Button>
        )}
        
        {currentPage < totalPages ? (
          <Link href={createPageUrl(totalPages)} scroll={false} className={cn(buttonVariants({ variant: "outline", size: "sm" }), "hidden sm:flex")}>
            Akhir
          </Link>
        ) : (
          <Button variant="outline" size="sm" className="hidden sm:flex" disabled>
            Akhir
          </Button>
        )}
      </div>
    </div>
  );
}
