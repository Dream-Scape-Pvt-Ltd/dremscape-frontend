"use client";

import Link from "next/link";
import { X, Mountain, Compass, MapPin, Calendar, BookOpen, Users, Phone } from "lucide-react";
import { navigationConfig } from "@/config/navigation";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-xs bg-white p-6 shadow-2xl flex flex-col justify-between">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Mountain className="h-6 w-6 text-emerald-600" />
              <span className="font-serif font-black text-stone-900">Dreamscape</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-stone-400 hover:bg-stone-100"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="mt-6 space-y-4">
            <Link
              href="/destinations"
              onClick={onClose}
              className="flex items-center gap-3 text-base font-bold text-stone-800 hover:text-emerald-600"
            >
              <MapPin className="h-5 w-5 text-emerald-600" /> Destinations
            </Link>
            <Link
              href="/treks"
              onClick={onClose}
              className="flex items-center gap-3 text-base font-bold text-stone-800 hover:text-emerald-600"
            >
              <Compass className="h-5 w-5 text-emerald-600" /> All Treks & Routes
            </Link>
            <Link
              href="/regions"
              onClick={onClose}
              className="flex items-center gap-3 text-base font-bold text-stone-800 hover:text-emerald-600"
            >
              <Mountain className="h-5 w-5 text-emerald-600" /> Himalayan Regions
            </Link>
            <Link
              href="/activities"
              onClick={onClose}
              className="flex items-center gap-3 text-base font-bold text-stone-800 hover:text-emerald-600"
            >
              <Calendar className="h-5 w-5 text-emerald-600" /> Activities
            </Link>
            <Link
              href="/blog"
              onClick={onClose}
              className="flex items-center gap-3 text-base font-bold text-stone-800 hover:text-emerald-600"
            >
              <BookOpen className="h-5 w-5 text-emerald-600" /> Travel Guides
            </Link>
            <Link
              href="/about"
              onClick={onClose}
              className="flex items-center gap-3 text-base font-bold text-stone-800 hover:text-emerald-600"
            >
              <Users className="h-5 w-5 text-emerald-600" /> Sherpa Team & Story
            </Link>
            <Link
              href="/contact"
              onClick={onClose}
              className="flex items-center gap-3 text-base font-bold text-stone-800 hover:text-emerald-600"
            >
              <Phone className="h-5 w-5 text-emerald-600" /> Contact HQ
            </Link>
          </nav>
        </div>

        {/* Footer CTAs */}
        <div className="space-y-3 pt-6 border-t border-stone-100">
          <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
            <Link href="/inquire" onClick={onClose}>
              Tailor-Made Inquiry
            </Link>
          </Button>
          <p className="text-center text-xs text-stone-400">
            Kathmandu HQ: {siteConfig.contact.phone}
          </p>
        </div>
      </div>
    </div>
  );
}
