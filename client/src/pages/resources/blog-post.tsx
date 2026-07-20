import { useEffect } from "react";
import { Link, useLocation, useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
} from "lucide-react";
import DOMPurify from "dompurify";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema, blogPostingSchema } from "@/lib/schema";
import {
  fetchPost,
  fetchRelatedPosts,
  formatPostDate,
  stripHtml,
  type BlogPost,
} from "@/lib/blog";
import { trackEvent } from "@/lib/analytics";
import { useScrollDepth } from "@/lib/use-scroll-depth";

const BASE_URL = "https://places-egy.com";

function setMetaTag(key: string, value: string, attr: "name" | "property" = "name") {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();

  useScrollDepth(`/blog/${slug}`);

  const { data: post, isLoading, isError } = useQuery<BlogPost | null>({
    queryKey: ["blog-post", slug],
    queryFn: () => fetchPost(slug ?? ""),
    enabled: Boolean(slug),
  });

  const { data: related = [] } = useQuery<BlogPost[]>({
    queryKey: ["blog-related", post?.id],
    queryFn: () => (post ? fetchRelatedPosts(post, 3) : Promise.resolve([])),
    enabled: Boolean(post),
  });

  // Soft redirect to /blog if the slug doesn't exist (vs hard 404).
  useEffect(() => {
    if (!isLoading && !isError && post === null) {
      setLocation("/blog", { replace: true });
    }
  }, [isLoading, isError, post, setLocation]);

  // Per-post meta tags + GA4 read event. WP's SEO plugin (Rank Math/Yoast)
  // populates post.seo when the data layer is wired to the live API.
  useEffect(() => {
    if (!post) return;

    const title = post.seo.title || `${post.title} — PLACES`;
    const description = post.seo.description || stripHtml(post.excerpt);
    const url = `${BASE_URL}/blog/${post.slug}`;
    const image = post.featuredImage?.url
      ? post.featuredImage.url.startsWith("http")
        ? post.featuredImage.url
        : `${BASE_URL}${post.featuredImage.url}`
      : undefined;

    const previousTitle = document.title;
    document.title = title;
    setMetaTag("description", description);
    setMetaTag("og:title", title, "property");
    setMetaTag("og:description", description, "property");
    setMetaTag("og:url", url, "property");
    setMetaTag("og:type", "article", "property");
    if (image) {
      setMetaTag("og:image", image, "property");
      // Drop the static og:image:width/height/type/alt/secure_url from
      // index.html — those describe the site-level opengraph.jpg, not this
      // post's featured image. Leaving them in place causes social scrapers
      // to render the wrong aspect ratio.
      document.head.querySelector('meta[property="og:image:width"]')?.remove();
      document.head.querySelector('meta[property="og:image:height"]')?.remove();
      document.head.querySelector('meta[property="og:image:type"]')?.remove();
      document.head.querySelector('meta[property="og:image:alt"]')?.remove();
      document.head.querySelector('meta[property="og:image:secure_url"]')?.remove();
      document.head.querySelector('meta[name="twitter:image:alt"]')?.remove();
    }
    setMetaTag("twitter:card", image ? "summary_large_image" : "summary");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    if (image) setMetaTag("twitter:image", image);

    trackEvent("blog_post_view", {
      post_id: post.id,
      post_slug: post.slug,
      post_title: post.title,
      post_category: post.categories[0]?.slug,
    });

    return () => {
      document.title = previousTitle;
    };
  }, [post]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col font-sans bg-background">
        <Navbar />
        <div className="flex-1 flex items-center justify-center pt-32">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
          { name: post.title, url: `/blog/${post.slug}` },
        ])}
      />
      <SchemaMarkup schema={blogPostingSchema(post)} />
      <Navbar />

      {/* Header */}
      <section className="pt-32 pb-8">
        <div className="container mx-auto px-6 md:px-10 max-w-3xl">
          <nav className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground mb-6 flex-wrap">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/blog" className="hover:text-primary transition-colors">Blog</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary line-clamp-1">{post.title}</span>
          </nav>

          <div className="flex items-center gap-2 mb-4">
            {post.categories.map((c) => (
              <span
                key={c.slug}
                className="text-[11px] font-bold uppercase tracking-widest text-accent bg-accent/10 px-3 py-1 rounded-full"
              >
                {c.name}
              </span>
            ))}
          </div>

          <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary leading-tight mb-6">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground border-t border-b border-border/40 py-4">
            <span className="font-medium text-primary">{post.author.name}</span>
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
      </section>

      {/* Featured image */}
      {post.featuredImage && (
        <section className="pb-10">
          <div className="container mx-auto px-6 md:px-10 max-w-4xl">
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-muted">
              <img
                src={post.featuredImage.url}
                alt={post.featuredImage.alt}
                fetchPriority="high"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
      )}

      {/* Body — WP REST returns rendered HTML. We sanitize client-side with
          DOMPurify because WP's own sanitization only restricts low-privilege
          authors; admin/editor roles can publish raw <script>. */}
      <article className="pb-12">
        <div className="container mx-auto px-6 md:px-10 max-w-3xl">
          <div
            className="blog-content"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-10 pt-6 border-t border-border/40 flex flex-wrap gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-2 self-center">
                Tags
              </span>
              {post.tags.map((t) => (
                <span
                  key={t.slug}
                  className="text-xs font-medium text-primary/70 bg-primary/5 border border-primary/10 px-3 py-1 rounded-full"
                >
                  {t.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>

      {/* Author byline */}
      <section className="pb-12">
        <div className="container mx-auto px-6 md:px-10 max-w-3xl">
          <div className="bg-secondary/40 border border-border/40 rounded-2xl p-6 md:p-8">
            <p className="text-xs font-bold uppercase tracking-widest text-accent mb-2">
              Written by
            </p>
            <h3 className="text-lg font-serif font-bold text-primary mb-1">
              {post.author.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              Part of the PLACES advisory team — specialists in Egypt's commercial and administrative real estate market.
            </p>
          </div>
        </div>
      </section>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="pb-16 border-t border-border/40 pt-12">
          <div className="container mx-auto px-6 md:px-10">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-2">
              Read next
            </h2>
            <p className="text-muted-foreground mb-8">
              More from the PLACES team.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link
                  key={p.id}
                  href={`/blog/${p.slug}`}
                  className="group flex flex-col bg-white rounded-2xl border border-border/40 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                    {p.featuredImage && (
                      <img
                        src={p.featuredImage.url}
                        alt={p.featuredImage.alt}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
                      {p.categories[0]?.name ?? "Insights"}
                    </span>
                    <h3 className="text-base font-serif font-bold text-primary mt-2 leading-snug group-hover:text-accent transition-colors line-clamp-2">
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Bottom CTA */}
      <section className="pb-16">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 py-10 border-t border-border/40">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-primary mb-1">
                Want our take on your specific situation?
              </h2>
              <p className="text-muted-foreground">
                Free 15-minute consultation with a PLACES advisor.
              </p>
            </div>
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white px-8 h-12 text-base font-medium shadow-lg shadow-accent/30 transition-all hover:scale-105 shrink-0"
              >
                Talk to an advisor <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
          <Link
            href="/blog"
            className="mt-6 inline-flex items-center text-sm font-medium text-primary hover:text-accent transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Back to all posts
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
