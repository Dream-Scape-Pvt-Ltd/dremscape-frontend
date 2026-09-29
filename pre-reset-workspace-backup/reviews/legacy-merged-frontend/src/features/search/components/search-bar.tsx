"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Compass, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { searchApi } from "../api/search";
import type { SearchResultItem } from "../types";

export function SearchBar({ className }: { className?: string }) {
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  const debouncedQuery = useDebounce(query, 250);

  React.useEffect(() => {
    async function fetchResults() {
      if (debouncedQuery.trim().length >= 2) {
        setIsLoading(true);
        const data = await searchApi.query(debouncedQuery);
        setResults(data);
        setIsLoading(false);
        setIsOpen(true);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }
    fetchResults();
  }, [debouncedQuery]);

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by mountain, region, pass (e.g. Everest, Gokyo, Cho La)..."
          className="pl-10 pr-10 h-12 rounded-xl text-sm border-stone-300 shadow-sm"
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
        />
        <Search className="absolute left-3.5 top-3.5 h-5 w-5 text-stone-400" />
        {isLoading && (
          <Loader2 className="absolute right-3.5 top-3.5 h-5 w-5 animate-spin text-emerald-600" />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute left-0 top-full z-50 mt-2 w-full rounded-2xl border border-stone-200 bg-white p-2 shadow-2xl animate-in fade-in-50 duration-150">
          <div className="max-h-80 overflow-y-auto divide-y divide-stone-100">
            {results.map((item) => (
              <Link
                key={item.id}
                href={item.url}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 transition-colors"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Compass className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-stone-900">{item.title}</p>
                  <p className="truncate text-[11px] text-stone-500">{item.subtitle}</p>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                  {item.type}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
