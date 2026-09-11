import Image from "next/image";
import { Star, MapPin, Compass } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getDifficultyBadgeConfig } from "../utils";
import type { TrekDetail } from "../types";

export function TrekHero({ trek }: { trek: TrekDetail }) {
  const diffConfig = getDifficultyBadgeConfig(trek.difficulty);

  return (
    <header className="relative min-h-[550px] lg:h-[72vh] w-full overflow-hidden">
      {/* LCP Mountain Panoramic Image */}
      <Image
        src={trek.heroImage.url}
        alt={trek.heroImage.alt}
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      {/* Gradient Overlay for Readable Typography */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/40 to-stone-900/20" />

      {/* Hero Content Container */}
      <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className={`border text-xs font-semibold backdrop-blur-md ${diffConfig.badgeClass}`}>
              {diffConfig.label}
            </Badge>
            <span className="flex items-center gap-1 rounded-full bg-stone-900/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/20">
              <MapPin className="h-3 w-3 text-emerald-400" />
              {trek.region.name}, {trek.destination.name}
            </span>
            <div className="flex items-center gap-1 text-xs text-amber-400 font-bold bg-stone-900/70 px-3 py-1 rounded-full border border-white/20 backdrop-blur-md">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              <span>{trek.ratingAverage.toFixed(1)}</span>
              <span className="text-stone-300 font-normal">({trek.reviewCount} reviews)</span>
            </div>
          </div>

          <h1 className="mt-4 max-w-4xl text-3xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl font-serif">
            {trek.title}
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-stone-200 sm:text-base">
            {trek.summary}
          </p>
        </div>
      </div>
    </header>
  );
}
