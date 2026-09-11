import { cn } from "@/lib/utils/cn";

export function LoadingSpinner({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-stone-200 border-t-emerald-600",
        sizes[size],
        className
      )}
      role="status"
      aria-label="Loading"
    />
  );
}
