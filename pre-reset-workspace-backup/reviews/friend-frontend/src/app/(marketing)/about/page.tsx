import type { Metadata } from "next";
import { Mountain, Users, ShieldCheck, Heart } from "lucide-react";
import { Container, Section } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "About Dreamscape Treks | Sherpa Heritage, Ethics & Safety",
  description:
    "Learn about Dreamscape Treks & Expeditions: founded in Kathmandu by veteran Sherpa mountaineers committed to sustainable tourism, fair porter wages, and high altitude safety.",
};

export default function AboutPage() {
  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="border-b border-stone-200 bg-stone-900 py-12 text-white">
        <Container>
          <Breadcrumbs items={[{ label: "About Us", active: true }]} />
          <h1 className="mt-4 text-3xl sm:text-5xl font-black font-serif">
            Rooted in the High Himalayas
          </h1>
          <p className="mt-2 text-sm text-stone-300 max-w-2xl">
            Dreamscape Treks was established in Kathmandu by indigenous Sherpa mountaineering guides
            who believe true exploration must honor both the mountain spirits and the local people.
          </p>
        </Container>
      </div>

      <Section>
        <Container className="max-w-4xl space-y-12">
          {/* Mission */}
          <div className="rounded-3xl border border-stone-200 bg-white p-8 sm:p-12 shadow-sm space-y-4">
            <h2 className="text-2xl font-bold font-serif text-stone-900">Our Guiding Philosophy</h2>
            <p className="text-sm leading-relaxed text-stone-600">
              For generations, the high mountain passes of the Khumbu, Rolwaling, and Manaslu were
              our ancestors&apos; trade routes. When you trek with Dreamscape, you are not merely a client;
              you are welcomed as an honored guest into our homes, monasteries, and sacred peaks.
            </p>
            <p className="text-sm leading-relaxed text-stone-600">
              We operate with strict environmental stewardship: zero single-use plastics on our camping
              expeditions, leave-no-trace ethics on the trails, and fair trade economic benefits that
              flow directly into rural Himalayan teahouse communities.
            </p>
          </div>

          {/* Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <ShieldCheck className="h-8 w-8 text-emerald-600 mb-3" />
              <h3 className="font-bold text-stone-900 text-base">HRA Certified Safety</h3>
              <p className="mt-2 text-xs text-stone-500 leading-relaxed">
                All lead guides undergo wilderness trauma protocols, pulse oximetry monitoring, and
                emergency rescue coordination.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <Users className="h-8 w-8 text-emerald-600 mb-3" />
              <h3 className="font-bold text-stone-900 text-base">Native Sherpa Guides</h3>
              <p className="mt-2 text-xs text-stone-500 leading-relaxed">
                Guaranteed local bilingual mountain experts with intimate knowledge of changing snow
                conditions, pass weather, and culture.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <Heart className="h-8 w-8 text-emerald-600 mb-3" />
              <h3 className="font-bold text-stone-900 text-base">Porter Welfare (IPPG)</h3>
              <p className="mt-2 text-xs text-stone-500 leading-relaxed">
                Full cold-weather mountaineering gear, medical evacuation insurance, and strict 20kg
                weight caps for all porters.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
