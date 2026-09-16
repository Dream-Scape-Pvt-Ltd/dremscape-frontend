import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { Container, Section } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { siteConfig } from "@/config/site";
import { ContactMessageForm } from "@/components/forms/contact-message-form";

export const metadata: Metadata = {
  title: "Contact Headquarters | Kathmandu, Nepal | Dreamscape Treks",
  description:
    "Get in touch with Dreamscape Treks & Expeditions headquarters in Thamel, Kathmandu. Call, WhatsApp, or send an inquiry for custom Himalayan trip planning.",
};

export default function ContactPage() {
  return (
    <div className="bg-stone-50 min-h-screen">
      <div className="border-b border-stone-200 bg-stone-900 py-12 text-white">
        <Container>
          <Breadcrumbs items={[{ label: "Contact Us", active: true }]} />
          <h1 className="mt-4 text-3xl sm:text-5xl font-black font-serif">
            Contact Expedition Headquarters
          </h1>
          <p className="mt-2 text-sm text-stone-300 max-w-2xl">
            Our Kathmandu headquarters is located in the heart of Thamel. We are available 7 days a
            week to answer expedition questions, check permit dates, or arrange airport welcomes.
          </p>
        </Container>
      </div>

      <Section>
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Contact Details Cards */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4 text-xs">
                <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-3">
                  Kathmandu Office
                </h3>

                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900 block">Address</span>
                    <span className="text-stone-500">
                      {siteConfig.contact.address.street}, {siteConfig.contact.address.city},{" "}
                      {siteConfig.contact.address.country}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900 block">Phone & WhatsApp</span>
                    <span className="text-stone-500">{siteConfig.contact.phone}</span>
                    <p className="text-stone-500">WhatsApp: {siteConfig.contact.whatsapp}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900 block">Email Dispatch</span>
                    <span className="text-stone-500">{siteConfig.contact.email}</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-stone-900 block">Office Hours</span>
                    <span className="text-stone-500">Sunday – Friday: 9:00 AM – 6:00 PM (NPT)</span>
                    <p className="text-emerald-700 font-semibold">24/7 Emergency Support for Active Treks</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Message Form */}
            <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white p-6 sm:p-8 shadow-sm">
              <h3 className="text-xl font-bold font-serif text-stone-900 mb-2">Send a Direct Message</h3>
              <p className="text-xs text-stone-500 mb-6">
                Have a quick question about trail seasons, gear, or permits? Send us a message and a
                senior expedition coordinator will respond promptly.
              </p>

              <ContactMessageForm />
            </div>
          </div>
        </Container>
      </Section>
    </div>
  );
}
