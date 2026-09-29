"use client";

import * as React from "react";
import Link from "next/link";
import { Mountain, Search, Menu, ChevronDown, Globe } from "lucide-react";
import { navigationConfig } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import { usePreferencesStore, type SupportedCurrency } from "@/features/preferences/store";

interface NavbarProps {
  onOpenMobileNav: () => void;
}

export function Navbar({ onOpenMobileNav }: NavbarProps) {
  const { currency, setCurrency } = usePreferencesStore();
  const [destinationsOpen, setDestinationsOpen] = React.useState(false);

  const currencies: SupportedCurrency[] = ["USD", "EUR", "GBP", "AUD", "NPR"];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-stone-900 text-white shadow-sm transition-transform group-hover:scale-105">
            <Mountain className="h-6 w-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-stone-950 font-serif">
              Dreamscape
            </span>
            <span className="block text-[10px] uppercase font-bold tracking-widest text-emerald-700">
              Treks & Expeditions
            </span>
          </div>
        </Link>

        {/* Desktop Main Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-stone-700">
          {/* Destinations Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setDestinationsOpen(true)}
            onMouseLeave={() => setDestinationsOpen(false)}
          >
            <Link
              href="/destinations"
              className="flex items-center gap-1 hover:text-emerald-700 transition-colors py-2"
            >
              Destinations
              <ChevronDown className="h-3.5 w-3.5 text-stone-400" />
            </Link>

            {destinationsOpen && (
              <div className="absolute left-0 top-full w-72 rounded-2xl border border-stone-200 bg-white p-3 shadow-xl animate-in fade-in-50 slide-in-from-top-2 duration-150">
                <div className="space-y-1">
                  {navigationConfig.mainNav[0]?.megaMenu?.map((item) => (
                    <Link
                      key={item.title}
                      href={item.href}
                      className="block rounded-xl p-2.5 hover:bg-stone-50 transition-colors"
                    >
                      <p className="font-bold text-stone-900 text-sm">{item.title}</p>
                      <p className="text-xs text-stone-500 line-clamp-1">{item.description}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link href="/treks" className="hover:text-emerald-700 transition-colors">
            Treks
          </Link>
          <Link href="/regions" className="hover:text-emerald-700 transition-colors">
            Regions
          </Link>
          <Link href="/activities" className="hover:text-emerald-700 transition-colors">
            Activities
          </Link>
          <Link href="/blog" className="hover:text-emerald-700 transition-colors">
            Guides & Blog
          </Link>
          <Link href="/about" className="hover:text-emerald-700 transition-colors">
            About Us
          </Link>
        </nav>

        {/* Right Action Tools: Currency Switcher, Search, CTA */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Currency Selector */}
          <div className="flex items-center gap-1.5 text-xs text-stone-600 bg-stone-100 rounded-lg px-2.5 py-1.5 border border-stone-200">
            <Globe className="h-3.5 w-3.5 text-stone-400" />
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as SupportedCurrency)}
              className="bg-transparent font-bold text-stone-800 focus:outline-none cursor-pointer"
              aria-label="Select Currency"
            >
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <Link
            href="/search"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 hover:text-stone-900 transition-colors"
            aria-label="Search Treks"
          >
            <Search className="h-4 w-4" />
          </Link>

          <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 font-bold">
            <Link href="/inquire">Plan My Trek</Link>
          </Button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="flex md:hidden h-10 w-10 items-center justify-center rounded-lg border border-stone-200 text-stone-700 hover:bg-stone-50"
          aria-label="Open Mobile Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
