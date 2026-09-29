import type { Metadata } from "next";
import Link from "next/link";
import { Mountain, Compass, Plane, Shield } from "lucide-react";
import { Container, Section } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";

export const metadata: Metadata = {
  title: "Himalayan Activities | Peak Climbing, Heli-Treks & Cultural Circuits",
  description:
    "Explore diverse ways to experience the Himalayas: High Altitude Trekking, Trekking Peak Climbing (Island Peak, Mera Peak), Heli-Treks, and Buddhist Monastery Valleys.",
};

const ACTIVITIES = [
  {
    title: "High Altitude Teahouse Trekking",
    slug: "teahouse-trekking",
    desc: "Iconic lodge-to-lodge journeys across high mountain passes with hot meals and warm Sherpa hospitality.",
    icon: Compass,
  },
  {
    title: "Trekking Peak Climbing (6,000m+)",
    slug: "peak-climbing",
    desc: "Non-technical alpine ascents of Island Peak (6,189m), Mera Peak (6,476m), and Lobuche East with fixed ropes.",
    icon: Mountain,
  },
  {
    title: "Helicopter Return Treks",
    slug: "heli-treks",
    desc: "Trek up to Everest Base Camp at a healthy acclimatization pace, then soar back to Kathmandu via scenic helicopter.",
    icon: Plane,
  },
  {
    title: "Sacred Cultural & Monastery Circuits",
    slug: "cultural-treks",
    desc: "Spiritual journeys exploring centuries-old Tibetan gompas, prayer wheel corridors, and valley festivals.",
    icon: Shield,
  },
];

export default function ActivitiesPage() {
  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="border-b border-stone-200 bg-stone-900 py-12 text-white">
        <Container>
          <Breadcrumbs items={[{ label: "Activities", active: true }]} />
          <h1 className="mt-4 text-3xl sm:text-5xl font-black font-serif">
            Himalayan Expedition Activities
          </h1>
          <p className="mt-2 text-sm text-stone-300 max-w-2xl">
            From classic teahouse journeys and 6,000-meter alpine peak ascents to luxury helicopter
            flyouts and spiritual circuits.
          </p>
        </Container>
      </div>

      <Section>
        <Container>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {ACTIVITIES.map((act) => {
              const Icon = act.icon;
              return (
                <Link
                  key={act.slug}
                  href={`/activities/${act.slug}`}
                  className="group rounded-3xl border border-stone-200 bg-white p-8 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-2xl font-bold font-serif text-stone-900 group-hover:text-emerald-700 transition-colors">
                    {act.title}
                  </h3>
                  <p className="mt-3 text-xs leading-relaxed text-stone-600">{act.desc}</p>
                  <span className="mt-6 inline-flex items-center text-xs font-bold text-emerald-600">
                    Explore Trips →
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>
    </div>
  );
}
