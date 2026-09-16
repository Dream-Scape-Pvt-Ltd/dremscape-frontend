import Link from "next/link";
import { Mountain, Lock, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-stone-100/70 text-stone-900">
      {/* Secure Checkout Header */}
      <header className="border-b border-stone-200 bg-white py-4 shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-stone-900 text-white">
              <Mountain className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="text-lg font-black font-serif text-stone-950">
              Dreamscape Treks
            </span>
          </Link>

          <div className="flex items-center gap-4 text-xs font-semibold text-stone-600">
            <span className="hidden sm:flex items-center gap-1 text-emerald-700">
              <ShieldCheck className="h-4 w-4" /> 256-Bit Encrypted
            </span>
            <span className="flex items-center gap-1 bg-stone-100 px-2.5 py-1 rounded-full border border-stone-200">
              <Lock className="h-3 w-3 text-stone-500" /> Secure Checkout
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 py-10">{children}</main>

      <footer className="border-t border-stone-200 bg-white py-6 text-center text-xs text-stone-500">
        <p>© {new Date().getFullYear()} {siteConfig.legalName}. All expedition deposits held in client trust accounts.</p>
      </footer>
    </div>
  );
}
