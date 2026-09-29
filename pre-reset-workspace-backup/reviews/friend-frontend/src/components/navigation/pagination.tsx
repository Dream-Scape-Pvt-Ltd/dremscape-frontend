"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  createPageUrl: (page: number) => string;
}

export function Pagination({ currentPage, totalPages, createPageUrl }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav aria-label="Pagination Navigation" className="flex items-center justify-center gap-2 py-8">
      <Link
        href={createPageUrl(Math.max(1, currentPage - 1))}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors",
          currentPage === 1 && "pointer-events-none opacity-40"
        )}
        aria-label="Previous Page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>

      {pages.map((p) => {
        const isCurrent = p === currentPage;
        return (
          <Link
            key={p}
            href={createPageUrl(p)}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-lg text-sm font-semibold transition-colors",
              isCurrent
                ? "bg-emerald-600 text-white"
                : "border border-stone-200 text-stone-700 hover:bg-stone-50"
            )}
            aria-current={isCurrent ? "page" : undefined}
          >
            {p}
          </Link>
        );
      })}

      <Link
        href={createPageUrl(Math.min(totalPages, currentPage + 1))}
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors",
          currentPage === totalPages && "pointer-events-none opacity-40"
        )}
        aria-label="Next Page"
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
