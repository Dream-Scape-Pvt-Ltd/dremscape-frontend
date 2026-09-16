"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterForm() {
  const [email, setEmail] = React.useState("");
  const [subscribed, setSubscribed] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  if (subscribed) {
    return (
      <p className="text-xs font-bold text-emerald-400">
        ✓ Subscribed to Himalayan Expedition Dispatch!
      </p>
    );
  }

  return (
    <form className="flex w-full max-w-md gap-2" onSubmit={handleSubmit}>
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address..."
        className="border-stone-700 bg-stone-800 text-white placeholder:text-stone-500"
        required
      />
      <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 font-bold shrink-0">
        Subscribe
      </Button>
    </form>
  );
}
