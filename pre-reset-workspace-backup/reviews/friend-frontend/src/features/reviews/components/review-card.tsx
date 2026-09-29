import { Star, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/formatters/date";
import type { ReviewItem } from "../types";

export function ReviewCard({ review }: { review: ReviewItem }) {
  return (
    <Card className="flex flex-col p-6 rounded-2xl border border-stone-200 bg-white shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < review.rating ? "fill-amber-400 text-amber-400" : "text-stone-300"
              }`}
            />
          ))}
        </div>
        <span className="text-[11px] text-stone-400">{formatDate(review.date)}</span>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-stone-700 italic">
        &ldquo;{review.content}&rdquo;
      </p>

      <div className="mt-6 border-t border-stone-100 pt-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-stone-900">{review.authorName}</span>
            {review.verified && (
              <span title="Verified Trekker">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              </span>
            )}
          </div>
          <p className="text-[10px] text-stone-500">
            {review.authorCountry} • {review.trekTitle}
          </p>
        </div>

        {review.guideName && (
          <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-semibold text-stone-600">
            Guide: {review.guideName}
          </span>
        )}
      </div>
    </Card>
  );
}
