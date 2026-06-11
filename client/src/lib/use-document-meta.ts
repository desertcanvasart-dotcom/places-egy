import { useEffect } from "react";

// Imperatively sets <title>, meta description, Open Graph / Twitter tags, and a
// canonical link for the current page, restoring the previous values on unmount.
//
// This is the same approach already used in listings/detail.tsx and
// resources/blog-post.tsx (document.title + a setMetaTag helper) — extracted
// here so any page can get per-page meta with a single hook call. Pages that
// previously had only the generic index.html title (e.g. every /developers/*
// page) were being served identical <title>/description, which is a primary
// reason Google reports them "Discovered – currently not indexed."

function setMetaTag(key: string, value: string, attr: "name" | "property" = "name") {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export interface DocumentMeta {
  title: string;
  description: string;
  /** Absolute canonical URL, e.g. https://places-egy.com/developers/akoya */
  url?: string;
  /** Absolute image URL for social cards */
  image?: string;
  /** og:type — defaults to "website" */
  type?: string;
}

export function useDocumentMeta({ title, description, url, image, type = "website" }: DocumentMeta) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    setMetaTag("description", description);
    setMetaTag("og:title", title, "property");
    setMetaTag("og:description", description, "property");
    setMetaTag("og:type", type, "property");
    if (url) {
      setMetaTag("og:url", url, "property");
      setCanonical(url);
    }
    if (image) setMetaTag("og:image", image, "property");
    setMetaTag("twitter:card", image ? "summary_large_image" : "summary");
    setMetaTag("twitter:title", title);
    setMetaTag("twitter:description", description);
    if (image) setMetaTag("twitter:image", image);

    return () => {
      document.title = previousTitle;
    };
  }, [title, description, url, image, type]);
}
