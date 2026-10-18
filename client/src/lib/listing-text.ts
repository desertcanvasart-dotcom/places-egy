// Shared by the listing page, the build-time listing prerender, and the admin
// save path. Keep free of "@/" imports: scripts and the server import it directly.

// Titles get pasted from WhatsApp, where *text* means bold.
export function cleanListingTitle(title: string): string {
  return title.replace(/\*+/g, "").replace(/\s+/g, " ").trim();
}

// Descriptions are markdown; search snippets need plain text of ~155 chars.
export function listingSnippet(markdown: string, max = 155): string {
  const text = markdown
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}(#{1,6}|[-*+]|\d+[.)])\s+/gm, "")
    .replace(/[*_`~>#|]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,;:–—-]+$/, "") + "…";
}
