import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = {
  title: "Trekker Portal Login | Dreamscape Treks",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black font-serif text-stone-900">Welcome Back</h1>
        <p className="mt-1 text-xs text-stone-500">
          Access your expedition itinerary, permits, and payment schedules.
        </p>
      </div>

      <LoginForm />

      <div className="text-center text-xs text-stone-500">
        Don&apos;t have an account yet?{" "}
        <Link href="/register" className="font-bold text-emerald-700 hover:text-emerald-800">
          Create Account
        </Link>
      </div>
    </div>
  );
}
