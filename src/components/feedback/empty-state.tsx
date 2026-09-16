import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-200 p-12 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-500 mb-4">
        {icon || <Compass className="h-7 w-7" />}
      </div>
      <h3 className="text-lg font-bold text-stone-900">{title}</h3>
      <p className="mt-1 max-w-sm text-sm text-stone-500">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" size="sm" className="mt-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
