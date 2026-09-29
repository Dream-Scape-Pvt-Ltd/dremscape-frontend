"use client";

import { useEffect } from "react";
import { ErrorBoundaryView } from "@/components/feedback/error-boundary-view";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Route Segment Error:", error);
  }, [error]);

  return <ErrorBoundaryView error={error} reset={reset} />;
}
