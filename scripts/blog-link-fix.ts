// Rewrites known-wrong internal links inside WordPress post content.
// Dry run by default; pass --apply to write (needs WP_USER + WP_APP_PASSWORD,
// a WordPress application password for an editor account).
//
//   npx tsx --env-file=.env scripts/blog-link-fix.ts            # show changes
//   npx tsx --env-file=.env scripts/blog-link-fix.ts --apply    # write them

const WP = "https://cms.places-egy.com/wp-json/wp/v2";
const APPLY = process.argv.includes("--apply");

// Same targets as the 301s in server/redirects.ts.
const FIXES: Record<string, string> = {
  "/blog/business-park-vs-business-building": "/blog/business-building-vs-business-park",
  "/blog/common-types-admin-offices-egypt": "/blog/types-of-admin-offices-egypt",
  "/blog/ready-to-move-vs-core-and-shell-offices-egypt": "/blog/core-and-shell-offices",
  "/ar/blog/core-and-shell-offices": "/ar/blog/ما-هو-الكور-اند-شل",
  "/ar/blog/office-finishing-types-egypt": "/ar/blog/أنواع-تشطيب-المكاتب-مصر",
  "/ar/blog/office-ac-systems-egypt": "/ar/blog/أنواع-تكييف-المكاتب-مصر",
  "/ar/blog/ready-to-move-vs-core-and-shell-offices-egypt":
    "/ar/blog/ready-to-move-vs-core-and-shell-offices-in-egypt-تختار-مكتب-جاهز-ولا-تجهزه-بنف",
  "/ar/blog/business-park-mixed-use": "/ar/blog/بيزنس-بارك-و-المشروع-متعدد-الاستخداما",
};

const auth = () => {
  const user = process.env.WP_USER;
  const pass = process.env.WP_APP_PASSWORD;
  if (!user || !pass) throw new Error("Set WP_USER and WP_APP_PASSWORD to use --apply");
  return `Basic ${Buffer.from(`${user}:${pass}`).toString("base64")}`;
};

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const encodedPath = (p: string) => encodeURI(p).replace(/%[0-9A-F]{2}/g, (m) => m.toLowerCase());

// Matches the wrong path as written in an href: relative or absolute, optional trailing slash.
const pattern = (from: string) =>
  new RegExp(`(href=["'])(?:https?://(?:www\\.)?places-egy\\.com)?${escapeRe(from)}/?(["'#?])`, "g");

async function main() {
  const headers: Record<string, string> = APPLY ? { Authorization: auth() } : {};
  const context = APPLY ? "&context=edit" : "";
  let changedPosts = 0;
  for (const lang of ["en", "ar"]) {
    const res = await fetch(`${WP}/posts?lang=${lang}&per_page=100&_fields=id,slug,content${context}`, { headers });
    const posts = (await res.json()) as Array<{ id: number; slug: string; content: { raw?: string; rendered: string } }>;
    for (const post of posts) {
      let html = post.content.raw ?? post.content.rendered;
      const changes: string[] = [];
      const self = `${lang === "ar" ? "/ar/blog" : "/blog"}/${decodeURIComponent(post.slug)}`;
      for (const [from, to] of Object.entries(FIXES)) {
        if (to === self) {
          // Target is this article itself: drop the link, keep its text.
          const anchor = new RegExp(`<a\\b[^>]*href=["'](?:https?://(?:www\\.)?places-egy\\.com)?${escapeRe(from)}/?["'][^>]*>([\\s\\S]*?)</a>`, "g");
          const n = (html.match(anchor) ?? []).length;
          if (n) {
            html = html.replace(anchor, "$1");
            changes.push(`${n}x ${from} -> link removed (would point to itself)`);
          }
          continue;
        }
        const re = pattern(from);
        const n = (html.match(re) ?? []).length;
        if (n) {
          html = html.replace(re, (_m, open, close) => `${open}${encodedPath(to)}${close}`);
          changes.push(`${n}x ${from} -> ${to}`);
        }
      }
      if (!changes.length) continue;
      changedPosts++;
      console.log(`${lang}:${post.id} ${decodeURIComponent(post.slug)}`);
      for (const c of changes) console.log(`   ${c}`);
      if (APPLY) {
        const put = await fetch(`${WP}/posts/${post.id}`, {
          method: "POST",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ content: html }),
        });
        console.log(put.ok ? "   updated" : `   FAILED ${put.status} ${await put.text()}`);
      }
    }
  }
  console.log(`${changedPosts} post(s) ${APPLY ? "updated" : "would change (dry run; pass --apply to write)"}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
