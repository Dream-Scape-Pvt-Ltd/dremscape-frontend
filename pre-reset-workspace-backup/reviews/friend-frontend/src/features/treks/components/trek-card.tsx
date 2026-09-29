import Image from "next/image";
import Link from "next/link";
import { Star, Clock, Mountain as MountainIcon, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getDifficultyBadgeConfig } from "../utils";
import type { TrekSummary } from "../types";

export function TrekCard({ trek }: { trek: TrekSummary }) {
  const diffConfig = getDifficultyBadgeConfig(trek.difficulty);

  return (
    <Card className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Trek Featured Image */}
      <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-100">
        <Image
          src={trek.featuredImageUrl}
          alt={trek.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge className={`border text-xs font-semibold backdrop-blur-md ${diffConfig.badgeClass}`}>
            {diffConfig.label}
          </Badge>
          <Badge className="border border-white/20 bg-stone-950/70 text-xs text-white backdrop-blur-md">
            {trek.region.name}
          </Badge>
        </div>
      </div>

      {/* Trek Body */}
      <div className="flex flex-1 flex-col p-5">
        {/* Rating */}
        <div className="flex items-center gap-1.5 text-xs text-amber-500">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold text-stone-800">{trek.ratingAverage.toFixed(1)}</span>
          <span className="text-stone-400">({trek.reviewCount} verified reviews)</span>
        </div>

        {/* Title */}
        <h3 className="mt-2 text-lg font-bold tracking-tight text-stone-900 transition-colors group-hover:text-emerald-700">
          <Link href={`/treks/${trek.slug}`} className="focus:outline-none">
            {trek.title}
          </Link>
        </h3>

        {/* Short Summary */}
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-stone-600">
          {trek.summary}
        </p>

        {/* Quick specs matrix */}
        <div className="mt-4 grid grid-cols-2 gap-3 border-y border-stone-100 py-3 text-xs text-stone-600">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-stone-400 block">Duration</span>
              <span className="font-semibold text-stone-800">{trek.durationDays} Days</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MountainIcon className="h-4 w-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-stone-400 block">Max Altitude</span>
              <span className="font-semibold text-stone-800">{trek.maxAltitudeMeters.toLocaleString()} m</span>
            </div>
          </div>
        </div>

        {/* Footer & CTA */}
        <div className="mt-auto flex items-baseline justify-between pt-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-stone-400 block">From</span>
            <p className="text-xl font-black text-stone-950">${trek.priceFromUSD}</p>
          </div>
          <Link
            href={`/treks/${trek.slug}`}
            className="flex items-center gap-1 rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-600"
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Explore Route</span>
          </Link>
        </div>
      </div>
    </Card>
  );
}
