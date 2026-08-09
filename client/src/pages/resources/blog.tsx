import { useMemo } from "react";
import { Link, useLocation, useParams } from "wouter";
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
import { useDocumentMeta } from "@/lib/use-document-meta";
import { BlogLangSwitcher } from "@/components/blog/BlogLangSwitcher";
import {
  fetchPosts,
  fetchCategories,
  formatPostDate,
  stripHtml,
  type BlogLang,
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

// UI copy per language. Kept small — this is only the shell, post bodies come
// from WordPress.
const COPY = {
  en: {
    breadcrumbHome: "Home",
    breadcrumbBlog: "Blog",
    heading: "PLACES Insights",
    subheading:
      "Market insights, investor guides, and location analysis for commercial and administrative real estate in Egypt — from the team that lives this market every day.",
    all: "All",
    empty: "No posts in this category yet — check back soon.",
    browseAll: "Browse all posts",
    featured: "Featured",
    defaultCategory: "Insights",
    minRead: "min read",
    min: "min",
    newer: "Newer posts",
    older: "Older posts",
    pageOf: (p: number, t: number) => `Page ${p} of ${t}`,
    ctaHeading: "Want our take on your specific situation?",
    ctaBody:
      "Book a free 15-minute consultation with a PLACES advisor — we'll walk you through your options directly.",
    ctaButton: "Talk to an advisor",
  },
  ar: {
    breadcrumbHome: "الرئيسية",
    breadcrumbBlog: "المدونة",
    heading: "PLACES Insights",
    subheading:
      "تحليلات ونصائح حول سوق العقارات الإدارية والتجارية في مصر — من فريق يعمل داخل السوق كل يوم.",
    all: "الكل",
    empty: "لا توجد مقالات في هذا القسم حتى الآن — تفقد لاحقًا.",
    browseAll: "تصفح جميع المقالات",
    featured: "المميز",
    defaultCategory: "رؤى",
    minRead: "دقيقة قراءة",
    min: "دقيقة",
    newer: "المقالات الأحدث",
    older: "المقالات الأقدم",
    pageOf: (p: number, t: number) => `صفحة ${p} من ${t}`,
    ctaHeading: "تريد رأينا في حالتك بالذات؟",
    ctaBody:
      "احجز استشارة مجانية لمدة 15 دقيقة مع مستشار PLACES — سنشرح لك خياراتك مباشرة.",
    ctaButton: "تحدث مع مستشار",
  },
} as const;

export default function BlogIndexPage({ lang = "en" }: { lang?: BlogLang }) {
  const isAr = lang === "ar";
  const t = COPY[lang];
  const basePath = isAr ? "/ar/blog" : "/blog";

  useDocumentMeta({
    title: isAr
      ? "PLACES Insights — تحليل سوق العقارات الإدارية في مصر"
      : "PLACES Insights — Egyptian Office Real Estate Market Analysis",
    description: t.subheading,
    url: `https://places-egy.com${basePath}`,
  });

  const [, setLocation] = useLocation();
  const params = useParams<{ category?: string }>();
  const search = typeof window !== "undefined" ? window.location.search : "";
  const page = readPageFromQuery(search);
  // Prefer path-based clean URL (/blog/category/foo) over legacy query string.
  // Path slugs are URL-encoded (Arabic slugs are %D8%A7%D9%84...) so decode
  // before passing to WordPress.
  const category = params.category
    ? decodeURIComponent(params.category)
    : readCategoryFromQuery(search);

  const { data: postsData, isLoading } = useQuery({
    queryKey: ["blog-posts", lang, page, category],
    queryFn: () => fetchPosts({ page, perPage: POSTS_PER_PAGE, category, lang }),
  });

  const { data: categoriesRaw } = useQuery({
    queryKey: ["blog-categories"],
    queryFn: fetchCategories,
  });
  // Filter out the WordPress "Uncategorized" default in every Polylang variant
  // (uncategorized, uncategorized-en, uncategorized-ar, uncategorised, or the
  // literal Arabic غير-مصنف). Every post should have a real category; the
  // fallback bucket in the filter UI is noise.
  const categories = categoriesRaw?.filter((c) => {
    const s = c.slug.toLowerCase();
    return (
      s !== "uncategorized" &&
      s !== "uncategorised" &&
      !s.startsWith("uncategorized-") &&
      !s.startsWith("uncategorised-") &&
      s !== "غير-مصنف"
    );
  });

  const posts = postsData?.posts ?? [];
  const totalPages = postsData?.totalPages ?? 1;

  const featured = posts[0];
  const rest = posts.slice(1);

  const buildPageUrl = (p: number) => {
    const catPath = category ? `/category/${encodeURIComponent(category)}` : "";
    const query = p > 1 ? `?page=${p}` : "";
    return `${basePath}${catPath}${query}`;
  };

  const buildCategoryUrl = (slug?: string) => {
    if (!slug) return basePath;
    return `${basePath}/category/${encodeURIComponent(slug)}`;
  };

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
    <div
      className="min-h-screen flex flex-col font-sans bg-background"
      dir={isAr ? "rtl" : "ltr"}
    >
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: t.breadcrumbHome, url: "/" },
          { name: t.breadcrumbBlog, url: basePath },
        ])}
      />
      <SchemaMarkup schema={blogIndexSchema({ posts: schemaPosts })} />
      <Navbar />

      <section className="pt-32 pb-6">
        <div className="container mx-auto px-6 md:px-10">
          <div className="flex items-start justify-between gap-4 mb-6">
            <nav className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">
                {t.breadcrumbHome}
              </Link>
              <ChevronRight className={`w-3.5 h-3.5 ${isAr ? "rotate-180" : ""}`} />
              <span className="text-primary">{t.breadcrumbBlog}</span>
            </nav>
            <BlogLangSwitcher lang={lang} />
          </div>
          <h1
            className={`text-3xl md:text-[3.25rem] font-bold text-primary mb-4 leading-tight ${
              isAr ? "font-serif-ar" : "font-serif"
            }`}
          >
            {t.heading}
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl">{t.subheading}</p>
        </div>
      </section>

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
              {t.all}
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
            <p className="text-muted-foreground">{t.empty}</p>
            <Link href={basePath}>
              <Button variant="outline" className="mt-6">
                {t.browseAll}
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {page === 1 && !category && featured && (
              <FeaturedCard post={featured} basePath={basePath} t={t} isAr={isAr} />
            )}

            {(page === 1 && !category ? rest : posts).length > 0 && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
                {(page === 1 && !category ? rest : posts).map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    basePath={basePath}
                    t={t}
                    isAr={isAr}
                  />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <nav className="flex items-center justify-between mt-14 pt-8 border-t border-border/40">
                {page > 1 ? (
                  <Link
                    href={buildPageUrl(page - 1)}
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-accent transition-colors"
                  >
                    <ChevronLeft className={`w-4 h-4 mr-1 ${isAr ? "rotate-180" : ""}`} />
                    {t.newer}
                  </Link>
                ) : (
                  <span />
                )}
                <span className="text-sm text-muted-foreground">
                  {t.pageOf(page, totalPages)}
                </span>
                {page < totalPages ? (
                  <Link
                    href={buildPageUrl(page + 1)}
                    className="inline-flex items-center text-sm font-medium text-primary hover:text-accent transition-colors"
                  >
                    {t.older}{" "}
                    <ChevronRight className={`w-4 h-4 ml-1 ${isAr ? "rotate-180" : ""}`} />
                  </Link>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </>
        )}

        <section className="mt-20">
          <div className="bg-primary rounded-3xl p-10 md:p-14 text-center">
            <h2
              className={`text-2xl md:text-3xl font-bold text-white mb-3 ${
                isAr ? "font-serif-ar" : "font-serif"
              }`}
            >
              {t.ctaHeading}
            </h2>
            <p className="text-white/70 mb-8 max-w-xl mx-auto">{t.ctaBody}</p>
            <Link href="/contact">
              <Button
                size="lg"
                className="bg-accent hover:bg-accent/90 text-white px-8 h-12 text-base font-medium shadow-lg shadow-accent/30 transition-all hover:scale-105"
              >
                {t.ctaButton}{" "}
                <ArrowRight className={`ml-2 w-4 h-4 ${isAr ? "rotate-180" : ""}`} />
              </Button>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

type Copy = {
  breadcrumbHome: string;
  breadcrumbBlog: string;
  heading: string;
  subheading: string;
  all: string;
  empty: string;
  browseAll: string;
  featured: string;
  defaultCategory: string;
  minRead: string;
  min: string;
  newer: string;
  older: string;
  pageOf: (p: number, t: number) => string;
  ctaHeading: string;
  ctaBody: string;
  ctaButton: string;
};

function FeaturedCard({
  post,
  basePath,
  t,
  isAr,
}: {
  post: BlogPost;
  basePath: string;
  t: Copy;
  isAr: boolean;
}) {
  return (
    <Link
      href={`${basePath}/${post.slug}`}
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
            {post.categories[0]?.name ?? t.defaultCategory}
          </span>
          <span className="text-muted-foreground/50">·</span>
          <span className="text-xs text-muted-foreground">{t.featured}</span>
        </div>
        <h2
          className={`text-2xl md:text-3xl font-bold text-primary mb-3 leading-tight group-hover:text-accent transition-colors ${
            isAr ? "font-serif-ar" : "font-serif"
          }`}
        >
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
            {post.readingTimeMinutes} {t.minRead}
          </span>
        </div>
      </div>
    </Link>
  );
}

function PostCard({
  post,
  basePath,
  t,
  isAr,
}: {
  post: BlogPost;
  basePath: string;
  t: Copy;
  isAr: boolean;
}) {
  return (
    <Link
      href={`${basePath}/${post.slug}`}
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
          {post.categories[0]?.name ?? t.defaultCategory}
        </span>
        <h3
          className={`text-lg font-bold text-primary mb-2 leading-snug group-hover:text-accent transition-colors line-clamp-2 ${
            isAr ? "font-serif-ar" : "font-serif"
          }`}
        >
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
            {post.readingTimeMinutes} {t.min}
          </span>
        </div>
      </div>
    </Link>
  );
}
