import Image from "next/image";
import Link from "next/link";
import { Mountain, Compass, Shield, Award, Users, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/layout/container";
import { treksApi } from "@/features/treks/api/treks";
import { TrekCard } from "@/features/treks/components/trek-card";
import { destinationsApi } from "@/features/destinations/api/destinations";
import { DestinationCard } from "@/features/destinations/components/destination-card";
import { reviewsApi } from "@/features/reviews/api/reviews";
import { ReviewCard } from "@/features/reviews/components/review-card";
import { SearchBar } from "@/features/search/components/search-bar";
import { siteConfig } from "@/config/site";

export default async function HomePage() {
  const treksData = await treksApi.list();
  const destinations = await destinationsApi.list();
  const reviews = await reviewsApi.list();

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative min-h-[640px] lg:h-[86vh] w-full overflow-hidden bg-stone-950">
        <Image
          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=85"
          alt="Himalayan Mountain Range Vista"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/40 to-transparent" />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-16 sm:px-6 lg:px-8 lg:pb-24">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-950/60 px-4 py-1.5 text-xs font-bold tracking-wider uppercase text-emerald-300 backdrop-blur-md">
              <Mountain className="h-3.5 w-3.5 text-emerald-400" />
              Nepal • Tibet • Bhutan • India
            </span>

            <h1 className="text-4xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl font-serif leading-[1.1]">
              Unrivaled Himalayan Expeditions.
            </h1>

            <p className="text-base sm:text-lg text-stone-200 max-w-2xl leading-relaxed">
              Ascend legendary peaks, cross glaciated passes, and traverse sacred kingdoms with
              certified native Sherpa guides committed to safety and ethical tourism.
            </p>

            {/* Instant Multi-Entity Search Bar */}
            <div className="pt-4 max-w-xl">
              <SearchBar />
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-semibold text-stone-300">
              <span className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-emerald-400" /> Wilderness First-Aid Certified
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-emerald-400" /> Ethical Porter Fair Wage Ratio
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Award className="h-4 w-4 text-emerald-400" /> 100% Financial Protection
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust & Accreditations Ribbon */}
      <div className="border-y border-stone-200 bg-white py-6">
        <Container>
          <div className="flex flex-wrap items-center justify-around gap-6 text-xs font-bold text-stone-500 uppercase tracking-widest text-center">
            <span>Nepal Tourism Board (NTB)</span>
            <span>Trekking Agencies Association of Nepal (TAAN)</span>
            <span>Nepal Mountaineering Association (NMA)</span>
            <span>Himalayan Rescue Association (HRA)</span>
          </div>
        </Container>
      </div>

      {/* Featured Treks Section */}
      <Section className="bg-stone-50">
        <Container>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
                Iconic Circuits & Sacred Lakes
              </span>
              <h2 className="mt-1 text-3xl sm:text-4xl font-black font-serif text-stone-900">
                Featured Himalayan Expeditions
              </h2>
              <p className="mt-2 text-sm text-stone-600 max-w-xl">
                Meticulously designed itineraries with built-in acclimatization profiles, high pass
                contingencies, and local community teahouse stays.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/treks">
                View All {treksData.count} Treks <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {treksData.results.map((trek) => (
              <TrekCard key={trek.id} trek={trek} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Destinations Showcase Section */}
      <Section className="bg-white">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              The Greater Himalayan Arc
            </span>
            <h2 className="mt-1 text-3xl sm:text-4xl font-black font-serif text-stone-900">
              Explore Our Destinations
            </h2>
            <p className="mt-2 text-sm text-stone-600">
              From the highest peaks on Earth in Nepal to the monastic cloisters of Bhutan and the
              frozen desert canyons of Ladakh.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.map((dest) => (
              <DestinationCard key={dest.id} destination={dest} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Value Pillars Section */}
      <Section className="bg-stone-900 text-white">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-stone-800 bg-stone-950 p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white mb-6">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-serif">Comprehensive High-Altitude Safety</h3>
              <p className="mt-3 text-xs leading-relaxed text-stone-400">
                Twice-daily pulse oximeter saturation tracking, altitude sickness emergency protocols,
                supplementary medical oxygen, and direct 24/7 helicopter evacuation dispatch.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-800 bg-stone-950 p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-serif">100% Native Sherpa Leadership</h3>
              <p className="mt-3 text-xs leading-relaxed text-stone-400">
                Led by government-licensed, English-speaking Sherpa mountaineering guides born and
                raised in the high valleys, with deep Buddhist cultural understanding.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-800 bg-stone-950 p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white mb-6">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold font-serif">Porter Welfare & Fair Trade</h3>
              <p className="mt-3 text-xs leading-relaxed text-stone-400">
                Proud signatories to the International Porter Protection Group (IPPG). Strict 20kg
                maximum pack weights, provided alpine gear, living wages, and comprehensive medical
                coverage.
              </p>
            </div>
          </div>
        </Container>
      </Section>

      {/* Verified Reviews Section */}
      <Section className="bg-stone-50">
        <Container>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">
              Traveler Stories & Feedback
            </span>
            <h2 className="mt-1 text-3xl sm:text-4xl font-black font-serif text-stone-900">
              Voices from the Mountain Trails
            </h2>
            <div className="mt-3 flex items-center justify-center gap-1 text-sm font-bold text-amber-500">
              <Star className="h-4 w-4 fill-amber-400" />
              <span className="text-stone-900">4.96 out of 5</span>
              <span className="text-stone-400 font-normal">
                (based on 500+ verified customer reviews)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Bottom Tailor-Made CTA */}
      <section className="relative py-20 bg-stone-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#059669_1px,transparent_1px)] [background-size:24px_24px]" />
        <Container className="relative z-10 text-center max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Tailor-Made Expeditions
          </span>
          <h2 className="mt-3 text-3xl sm:text-5xl font-black font-serif">
            Ready to Plan Your Himalayan Odyssey?
          </h2>
          <p className="mt-4 text-sm text-stone-300 leading-relaxed">
            Whether you want a challenging high pass crossing, helicopter return from Everest Base
            Camp, or a spiritual pilgrimage across Bhutan, our Kathmandu specialists will build your
            dream itinerary.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 font-bold">
              <Link href="/inquire">Plan a Custom Expedition</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-stone-900 bg-white">
              <Link href="/contact">Talk with a Sherpa Expert</Link>
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}
