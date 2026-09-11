import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormLabel } from "@/components/forms/form-field";

export const metadata: Metadata = {
  title: "Reset Password | Dreamscape Treks",
  robots: { index: false, follow: false },
};

export default function ForgotPasswordPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black font-serif text-stone-900">Reset Password</h1>
        <p className="mt-1 text-xs text-stone-500">
          Enter your registered email address and we will send you a password recovery link.
        </p>
      </div>

      <form className="space-y-4">
        <FormField>
          <FormLabel required>Email Address</FormLabel>
          <Input type="email" placeholder="trekker@example.com" required />
        </FormField>

        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold">
          Send Recovery Link
        </Button>
      </form>

      <div className="text-center">
        <Link
          href="/login"
          className="inline-flex items-center text-xs font-bold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Sign In
        </Link>
      </div>
    </div>
  );
}
