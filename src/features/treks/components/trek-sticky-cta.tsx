"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface TrekStickyCtaProps {
  trekSlug: string;
  priceUSD: number;
  durationDays: number;
}

export function TrekStickyCTA({ trekSlug, priceUSD, durationDays }: TrekStickyCtaProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Trigger bar appearance after user scrolls past the hero (450px)
      setIsVisible(window.scrollY > 450);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Booking actions"
      className="fixed bottom-0 left-0 z-40 w-full border-t border-stone-200 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur-md transition-all duration-300 md:hidden"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div>
          <span className="text-[11px] text-stone-500 block">{durationDays} Days Expedition</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-black text-stone-900">${priceUSD}</span>
            <span className="text-[10px] text-stone-400">/ person</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/inquire?trek=${trekSlug}`}>Inquire</Link>
          </Button>
          <Button size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700 font-bold" asChild>
            <Link href={`/booking/${trekSlug}`}>Book Now</Link>
          </Button>
        </div>
      </div>
    </aside>
  );
}
