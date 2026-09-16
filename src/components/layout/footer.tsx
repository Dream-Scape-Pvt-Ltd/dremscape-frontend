import Link from "next/link";
import { Mountain, ShieldCheck, Mail, MapPin, Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { navigationConfig } from "@/config/navigation";
import { NewsletterForm } from "@/components/forms/newsletter-form";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-stone-200 bg-stone-900 text-stone-300">
      {/* Newsletter Bar */}
      <div className="border-b border-stone-800 bg-stone-950/60 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white">Join the Himalayan Expedition Dispatch</h3>
              <p className="text-xs text-stone-400 mt-1">
                Receive seasonal trail condition updates, permit advisory alerts, and early departure slots.
              </p>
            </div>
            <NewsletterForm />
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Accreditations */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                <Mountain className="h-6 w-6" />
              </div>
              <span className="text-2xl font-black font-serif text-white tracking-tight">
                {siteConfig.name}
              </span>
            </div>
            <p className="text-xs leading-relaxed text-stone-400 max-w-sm">
              {siteConfig.description}
            </p>

            {/* Certifications Badges */}
            <div className="pt-2">
              <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                Licensed & Accredited By
              </span>
              <ul className="mt-2 space-y-1 text-xs text-stone-400">
                {siteConfig.accreditations.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column: Destinations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Destinations</h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              {navigationConfig.footerNav.destinations.map((link) => (
                <li key={link.title}>
                  <Link href={link.href} className="hover:text-emerald-400 transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column: Popular Treks */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Top Expeditions</h4>
            <ul className="mt-4 space-y-2.5 text-xs">
              {navigationConfig.footerNav.popularTreks.map((link) => (
                <li key={link.title}>
                  <Link href={link.href} className="hover:text-emerald-400 transition-colors">
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column: Contact & HQ */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white">Expedition Base</h4>
            <ul className="mt-4 space-y-3 text-xs text-stone-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  {siteConfig.contact.address.street}, {siteConfig.contact.address.city},{" "}
                  {siteConfig.contact.address.country}
                </span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{siteConfig.contact.phone}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-emerald-500 shrink-0" />
                <span>{siteConfig.contact.email}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-stone-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>© {new Date().getFullYear()} {siteConfig.legalName}. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy-policy" className="hover:text-stone-400">
              Privacy Policy
            </Link>
            <Link href="/terms-conditions" className="hover:text-stone-400">
              Terms & Conditions
            </Link>
            <Link href="/terms-conditions#safety" className="hover:text-stone-400">
              Helicopter Evacuation Protocol
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
