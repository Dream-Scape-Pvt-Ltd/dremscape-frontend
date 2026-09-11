import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Compass } from "lucide-react";
import type { DestinationSummary } from "../types";

export function DestinationCard({ destination }: { destination: DestinationSummary }) {
  return (
    <Link
      href={`/destinations/${destination.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border border-stone-200 bg-stone-900 shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
    >
      <div className="relative aspect-4/3 w-full overflow-hidden">
        <Image
          src={destination.heroImageUrl}
          alt={destination.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-transparent" />
      </div>

      <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/80 px-3 py-1 text-xs font-bold backdrop-blur-md">
            <Compass className="h-3 w-3" /> {destination.trekCount} Expeditions
          </span>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
            <ArrowUpRight className="h-5 w-5" />
          </div>
        </div>

        <h3 className="mt-3 text-2xl font-black tracking-tight font-serif">{destination.name}</h3>
        <p className="mt-1 text-xs text-stone-300 line-clamp-2">{destination.tagline}</p>
      </div>
    </Link>
  );
}
