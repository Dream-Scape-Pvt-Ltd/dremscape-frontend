import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Clock, Calendar, ArrowLeft } from "lucide-react";
import { Container } from "@/components/layout/container";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { Badge } from "@/components/ui/badge";
import { blogApi } from "@/features/blog/api/blog";
import { formatDate } from "@/lib/formatters/date";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await blogApi.getBySlug(slug);

  if (!post) return { title: "Article Not Found" };

  return {
    title: `${post.title} | Dreamscape Treks`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImageUrl],
      type: "article",
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await blogApi.getBySlug(slug);

  if (!post) {
    notFound();
  }

  const breadcrumbs = [
    { label: "Guides & Blog", href: "/blog" },
    { label: post.title, active: true },
  ];

  return (
    <article className="min-h-screen bg-stone-50 pb-20">
      <div className="border-b border-stone-200 bg-white">
        <Container>
          <Breadcrumbs items={breadcrumbs} />
        </Container>
      </div>

      <Container className="mt-8 max-w-4xl">
        <header className="space-y-4">
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">
            {post.category}
          </Badge>

          <h1 className="text-3xl sm:text-5xl font-black font-serif text-stone-900 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-xs text-stone-500 border-b border-stone-200 pb-6">
            <span className="font-semibold text-stone-800">By {post.author.name}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-emerald-600" />
              {formatDate(post.publishedAt)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-emerald-600" />
              {post.readingTimeMinutes} min read
            </span>
          </div>
        </header>

        {/* Featured Banner */}
        <div className="relative mt-8 aspect-16/9 w-full overflow-hidden rounded-3xl bg-stone-900 shadow-lg">
          <Image
            src={post.coverImageUrl}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 896px"
            className="object-cover"
          />
        </div>

        {/* Article Body */}
        <div
          className="prose prose-stone prose-emerald mt-10 max-w-none text-sm leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />

        {/* Bottom Author Bio */}
        <div className="mt-12 rounded-2xl border border-stone-200 bg-white p-6 flex items-center justify-between">
          <div>
            <p className="text-xs text-stone-400">Written By</p>
            <p className="text-base font-bold text-stone-900">{post.author.name}</p>
            <p className="text-xs text-stone-500">{post.author.title}</p>
          </div>
          <Link
            href="/blog"
            className="inline-flex items-center text-xs font-bold text-emerald-600 hover:text-emerald-700"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to Guides
          </Link>
        </div>
      </Container>
    </article>
  );
}
