import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Download, ArrowRight, Calendar, MapPin, ShieldCheck } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";

interface ConfirmationPageProps {
  params: Promise<{ bookingReference: string }>;
}

export const metadata: Metadata = {
  title: "Booking Confirmed | Dreamscape Treks",
  robots: { index: false, follow: false },
};

export default async function BookingConfirmationPage({ params }: ConfirmationPageProps) {
  const { bookingReference } = await params;

  return (
    <Container className="max-w-3xl">
      <div className="rounded-3xl border border-stone-200 bg-white p-8 sm:p-12 shadow-sm text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 mb-6">
          <CheckCircle2 className="h-10 w-10" />
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
          Booking Reserved Successfully
        </span>

        <h1 className="mt-4 text-3xl font-black font-serif text-stone-900">
          Namaste! Your Himalayan Journey Begins.
        </h1>

        <p className="mt-2 text-xs text-stone-500">
          Booking Reference: <span className="font-mono font-bold text-stone-900">{bookingReference}</span>
        </p>

        <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-6 text-left text-xs space-y-3">
          <h3 className="font-bold text-stone-900 text-sm border-b border-stone-200 pb-2">
            What Happens Next?
          </h3>

          <div className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-[10px]">
              1
            </span>
            <p className="text-stone-600">
              <strong className="text-stone-900">Official Confirmation Email:</strong> We have sent your
              booking voucher, payment receipt, and invoice to your registered email.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-[10px]">
              2
            </span>
            <p className="text-stone-600">
              <strong className="text-stone-900">Sherpa Guide Introduction:</strong> Your lead expedition
              manager in Kathmandu will contact you on WhatsApp to review flight arrivals and gear.
            </p>
          </div>

          <div className="flex items-start gap-3">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white font-bold text-[10px]">
              3
            </span>
            <p className="text-stone-600">
              <strong className="text-stone-900">Permit Issuance:</strong> We will process your Sagarmatha /
              ACAP permits and lodge reservations with the local authorities.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 font-bold">
            <Link href="/">
              Return to Homepage <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/blog/ultimate-himalayan-packing-list">
              <Download className="mr-2 h-4 w-4" /> Download Gear Checklist
            </Link>
          </Button>
        </div>
      </div>
    </Container>
  );
}
