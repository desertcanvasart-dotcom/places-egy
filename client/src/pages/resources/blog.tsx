import { useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarDays,
  Clock,
} from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema, blogIndexSchema } from "@/lib/schema";
import {
  fetchPosts,
  fetchCategories,
  formatPostDate,
  stripHtml,
  type BlogPost,
} from "@/lib/blog";

const POSTS_PER_PAGE = 9;

function readPageFromQuery(search: string): number {
  const params = new URLSearchParams(search);
  const page = Number(params.get("page") ?? "1");
  return Number.isInteger(page) && page > 0 ? page : 1;
}

function readCategoryFromQuery(search: string): string | undefined {
  const params = new URLSearchParams(search);
  return params.get("category") ?? undefined;
}

export default function BlogIndexPage() {
  const [, setLocation] = useLocation();
  const search = typeof window !== "undefined" ? window.location.search : "";
  const page = readPageFromQuery(search);
  const category = readCategoryFromQuery(search);

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["blog-posts", page, category],
    queryFn: () => fetchPosts({ page, perPage: POSTS_PER_PAGE, category }),
  });

  const { data: categories } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: fetchCategories,
  });

  // Static head meta — index page describes the whole blog, individual posts
  // override these on the detail page.
  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Insights — PLACES";
    return () => {
      document.title = previousTitle;
    };
  }, []);

  const posts = postsData?.posts ?? [];
  const totalPages = postsData?.totalPages ?? 1;

  const featured = posts[0];
  const rest = posts.slice(1);

  // Pagination URLs preserve current category filter.
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (p > 1) params.set("page", String(p));
    if (category) params.set("category", category);
    const q = params.toString();
    return `/blog${q ? `?${q}` : ""}`;
  };

  const buildCategoryUrl = (slug?: string) => {
    if (!slug) return "/blog";
    return `/blog?category=${slug}`;
  };

  // For the schema's blogPost array we want all posts on this page (not just
  // the featured one), with their excerpts as descriptions.
  const schemaPosts = useMemo(
    () =>
      posts.map((p) => ({
        title: p.title,
        slug: p.slug,
        date: p.date,
        excerpt: stripHtml(p.excerpt),
      })),
    [posts],
  );

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
        ])}
      />
      <SchemaMarkup schema={blogIndexSchema({ posts: schemaPosts })} />
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-6">
        <div className="container mx-auto px-6 md:px-10">
          <nav className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground mb-6">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary">Blog</span>
          </nav>
          <h1 className="text-3xl md:text-[3.25rem] font-serif font-bold text-primary mb-4 leading-tight">
            PLACES Insights
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">
            Market insights, investor guides, and location analysis for commercial and administrative real estate in Egypt — from the team that lives this market every day.
          </p>
        </div>
      </section>

      {/* Category filter */}
      {categories && categories.length > 0 && (
        <div className="border-b border-border/40">
          <div className="container mx-auto px-6 md:px-10 py-4 flex flex-wrap gap-2">
            <button
              onClick={() => setLocation(buildCategoryUrl())}
              className={`text-xs font-bold uppercase tracking-widest px-3.5 py-2 rounded-full border transition-colors ${
                !category
                  ? "bg-primary text-white border-primary"
                  : "border-border/60 text-primary/70 hover:border-primary hover:text-primary"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => setLocation(buildCategoryUrl(c.slug))}
                className={`text-xs font-bold uppercase tracking-widest px-3.5 py-2 rounded-full border transition-colors ${
                  category === c.slug
                    ? "bg-primary text-white border-primary"
                    : "border-border/60 text-primary/70 hover:border-primary hover:text-primary"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="container mx-auto px-6 md:px-10 py-8 md:py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground">No posts in this category yet — check back soon.</p>
            <Link href="/blog">
              <Button variant="outline" className="mt-6">
                Browse all posts
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Featured post (only on first page, no category filter) */}
            {page === 1 && !category && featured && <FeaturedCard post={featured} />}

            {/* Grid of remaining posts */}
            {(page === 1 && !category ? rest : posts).length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                {(page === 1 && !category ? rest : posts).map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="flex items-center justify-between mt-14 pt-8 border-t border-border/40">
                {page > 1 ? (
                  <Link
                    href={buildPageUrl(page - 1)}
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-accent transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Newer posts
                  </Link>
                ) : (
                  <span />
                )}
                <span className="text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages ? (
                  <Link
                    href={buildPageUrl(page + 1)}
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-accent transition-colors"
                  >
                    Older posts <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </>
        )}

        {/* Final CTA */}
        <section className="mt-20">
          <div className="bg-primary rounded-3xl p-10 md:p-14 text-center">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-white mb-3">
              Want our take on your specific situation?
            </h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">
              Book a free 15-minute consultation with a PLACES advisor — we'll walk you through your options directly.
            </p>
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white px-8 h-12 text-base font-medium shadow-lg shadow-accent/30 transition-all hover:scale-105"
              >
                Talk to an advisor <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

function FeaturedCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group grid md:grid-cols-2 gap-8 items-center bg-white rounded-3xl border border-border/40 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] md:aspect-auto md:h-full overflow-hidden bg-muted">
        {post.featuredImage && (
          <img
            src={post.featuredImage.url}
            alt={post.featuredImage.alt}
            loading="eager"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="p-8 md:p-10">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
            {post.categories[0]?.name ?? "Insights"}
          </span>
          <span className="text-muted-foreground/50">·</span>
          <span className="text-xs text-muted-foreground">Featured</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-3 leading-tight group-hover:text-accent transition-colors">
          {post.title}
        </h2>
        <p className="text-muted-foreground leading-relaxed mb-5 line-clamp-3">
          {stripHtml(post.excerpt)}
        </p>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            {formatPostDate(post.date)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            {post.readingTimeMinutes} min read
          </span>
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group flex flex-col bg-white rounded-2xl border border-border/40 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        {post.featuredImage && (
          <img
            src={post.featuredImage.url}
            alt={post.featuredImage.alt}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="p-6 flex flex-col flex-1">
        <span className="text-[11px] font-bold uppercase tracking-widest text-accent mb-2">
          {post.categories[0]?.name ?? "Insights"}
        </span>
        <h3 className="text-lg font-serif font-bold text-primary mb-2 leading-snug group-hover:text-accent transition-colors line-clamp-2">
          {post.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1 line-clamp-3">
          {stripHtml(post.excerpt)}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground pt-3 border-t border-border/40">
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-3 h-3" />
            {formatPostDate(post.date)}
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {post.readingTimeMinutes} min
          </span>
        </div>
      </div>
    </Link>
  );
}
