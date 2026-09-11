"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryViewProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
}

export function ErrorBoundaryView({
  error,
  reset,
  title = "Something went wrong on the mountain trail",
}: ErrorBoundaryViewProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600 mb-4">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <h2 className="text-xl font-bold text-stone-900">{title}</h2>
      <p className="mt-2 max-w-md text-sm text-stone-500">
        {error.message || "An unexpected error occurred while loading expedition details."}
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={() => reset()} variant="primary" size="sm">
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
        <Button onClick={() => (window.location.href = "/")} variant="outline" size="sm">
          Return Home
        </Button>
      </div>
    </div>
  );
}
