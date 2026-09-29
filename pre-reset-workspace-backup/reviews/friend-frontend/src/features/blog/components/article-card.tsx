import Image from "next/image";
import Link from "next/link";
import { Clock, BookOpen } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formatters/date";
import type { BlogPost } from "../types";

export function ArticleCard({ post }: { post: BlogPost }) {
  return (
    <Card className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-16/9 w-full overflow-hidden bg-stone-100">
        <Image
          src={post.coverImageUrl}
          alt={post.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-3 left-3">
          <Badge className="bg-stone-900/80 text-white backdrop-blur-md text-[11px] border border-white/20">
            {post.category}
          </Badge>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-center gap-3 text-[11px] text-stone-400">
          <span>{formatDate(post.publishedAt)}</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {post.readingTimeMinutes} min read
          </span>
        </div>

        <h3 className="mt-2 text-base font-bold text-stone-900 transition-colors group-hover:text-emerald-700 leading-snug">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h3>

        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-stone-600">
          {post.excerpt}
        </p>

        <div className="mt-auto border-t border-stone-100 pt-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-stone-700">By {post.author.name}</span>
          <Link
            href={`/blog/${post.slug}`}
            className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            Read Guide <BookOpen className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </Card>
  );
}
