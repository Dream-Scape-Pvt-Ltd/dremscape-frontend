import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormLabel } from "@/components/forms/form-field";

export const metadata: Metadata = {
  title: "Create Account | Dreamscape Treks",
  robots: { index: false, follow: false },
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black font-serif text-stone-900">Create Trekker Account</h1>
        <p className="mt-1 text-xs text-stone-500">
          Save your passport details, track upcoming departures, and download trip packs.
        </p>
      </div>

      <form className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField>
            <FormLabel required>First Name</FormLabel>
            <Input placeholder="Tenzing" required />
          </FormField>
          <FormField>
            <FormLabel required>Last Name</FormLabel>
            <Input placeholder="Norgay" required />
          </FormField>
        </div>

        <FormField>
          <FormLabel required>Email Address</FormLabel>
          <Input type="email" placeholder="tenzing@example.com" required />
        </FormField>

        <FormField>
          <FormLabel required>Password</FormLabel>
          <Input type="password" placeholder="••••••••" required />
        </FormField>

        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold">
          Register Account
        </Button>
      </form>

      <div className="text-center text-xs text-stone-500">
        Already registered?{" "}
        <Link href="/login" className="font-bold text-emerald-700 hover:text-emerald-800">
          Sign In
        </Link>
      </div>
    </div>
  );
}
