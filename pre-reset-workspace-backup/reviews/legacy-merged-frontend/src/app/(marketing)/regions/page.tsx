import type { Metadata } from "next";
import Link from "next/link";
import { Mountain, Compass } from "lucide-react";
import { Container, Section } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Himalayan Trekking Regions | Everest, Annapurna, Manaslu & Beyond",
  description:
    "Explore the distinct trekking regions of Nepal: Everest/Khumbu, Annapurna, Langtang, Manaslu, Mustang, Dolpo, Kanchenjunga, Makalu, and Rolwaling.",
};

const REGION_DATA = [
  { name: "Everest / Khumbu", slug: "everest", desc: "Highest mountain amphitheater on Earth, home to the Sherpa heartland." },
  { name: "Annapurna", slug: "annapurna", desc: "Pristine glacial lakes, Thorong La pass, and rich cultural diversity." },
  { name: "Langtang", slug: "langtang", desc: "The Valley of Glaciers closest to Kathmandu, with sacred Gosainkunda lakes." },
  { name: "Manaslu", slug: "manaslu", desc: "Untamed restricted wilderness sanctuary circling Mount Manaslu (8,163m)." },
  { name: "Mustang", slug: "mustang", desc: "Walled medieval Tibetan kingdom situated in the arid Himalayan rainshadow." },
  { name: "Dolpo", slug: "dolpo", desc: "Remote trans-Himalayan wilderness of crystal blue Phoksundo Lake and Shey Gompa." },
  { name: "Kanchenjunga", slug: "kanchenjunga", desc: "Wild eastern frontier beneath the world's third-highest peak." },
  { name: "Makalu", slug: "makalu", desc: "Unspoiled nature sanctuary of steep granite cliffs, hanging glaciers, and rare flora." },
  { name: "Rolwaling", slug: "rolwaling", desc: "The hidden secret valley of Tsho Rolpa glacial lake and high alpine passes." },
];

export default function RegionsPage() {
  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="border-b border-stone-200 bg-stone-900 py-12 text-white">
        <Container>
          <Breadcrumbs items={[{ label: "Regions", active: true }]} />
          <h1 className="mt-4 text-3xl sm:text-5xl font-black font-serif">
            Himalayan Trekking Regions
          </h1>
          <p className="mt-2 text-sm text-stone-300 max-w-2xl">
            From the popular Khumbu trails to untouched remote restricted sanctuaries. Choose your
            mountain playground.
          </p>
        </Container>
      </div>

      <Section>
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {REGION_DATA.map((reg) => (
              <Link
                key={reg.slug}
                href={`/regions/${reg.slug}`}
                className="group rounded-2xl border border-stone-200 bg-white p-6 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 mb-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Mountain className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-bold text-stone-900 group-hover:text-emerald-700 transition-colors font-serif">
                  {reg.name}
                </h3>
                <p className="mt-2 text-xs text-stone-600 leading-relaxed">{reg.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-600">
                  Explore Region Treks →
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </div>
  );
}
