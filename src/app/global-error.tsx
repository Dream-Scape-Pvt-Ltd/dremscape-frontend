"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Catastrophic Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center bg-stone-900 px-4 text-center text-white">
        <div className="rounded-2xl border border-stone-800 bg-stone-950 p-8 max-w-md shadow-2xl">
          <h1 className="text-2xl font-black text-rose-500 font-serif">Critical Expedition Error</h1>
          <p className="mt-3 text-xs text-stone-400">
            A critical system error prevented this page from rendering.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={() => reset()} className="bg-emerald-600 hover:bg-emerald-700">
              Reload Application
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
