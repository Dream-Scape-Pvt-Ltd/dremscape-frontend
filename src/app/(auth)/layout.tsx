import Image from "next/image";
import Link from "next/link";
import { Mountain } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-stone-50">
      {/* Left Form Container */}
      <div className="flex flex-col justify-between p-8 sm:p-12 lg:p-16">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-white transition-transform group-hover:scale-105">
              <Mountain className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="font-serif font-black text-stone-950 text-lg">
              Dreamscape Treks
            </span>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm py-12">{children}</div>

        <div className="text-xs text-stone-400">
          © {new Date().getFullYear()} Dreamscape Treks & Expeditions Pvt. Ltd.
        </div>
      </div>

      {/* Right Mountain Graphic Side */}
      <div className="relative hidden lg:block overflow-hidden bg-stone-950">
        <Image
          src="https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=80"
          alt="Everest Himalayan Range"
          fill
          priority
          sizes="50vw"
          className="object-cover opacity-75"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <blockquote className="font-serif text-xl italic leading-snug">
            &ldquo;The mountains are calling and I must go.&rdquo;
          </blockquote>
          <p className="mt-2 text-xs font-semibold text-emerald-400">
            Certified Expeditions Across Nepal, Tibet, Bhutan & India
          </p>
        </div>
      </div>
    </div>
  );
}
