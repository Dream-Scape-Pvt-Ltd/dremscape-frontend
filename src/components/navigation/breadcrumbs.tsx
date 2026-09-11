import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import type { BreadcrumbItem } from "@/types/common";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs text-stone-500 py-3">
      <Link
        href="/"
        className="flex items-center text-stone-400 hover:text-stone-700 transition-colors"
        aria-label="Home"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRight className="h-3.5 w-3.5 text-stone-300 shrink-0" />
            {isLast || !item.href ? (
              <span className="font-semibold text-stone-800" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link href={item.href} className="hover:text-stone-900 transition-colors">
                {item.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
