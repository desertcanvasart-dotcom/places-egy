import express, { type Express } from "express";
import fs from "fs";
import path from "path";

const comingSoonHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>PLACES</title>
  <style>
    body {
      margin: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      background-color: #000000;
      color: #ffffff;
      font-family: Arial, sans-serif;
      text-align: center;
    }
    h1 { font-size: 48px; margin-bottom: 16px; }
    p { font-size: 18px; opacity: 0.6; }
  </style>
</head>
<body>
  <h1>PLACES</h1>
  <p>Something new is coming. Stay tuned.</p>
</body>
</html>`;

export function serveStatic(app: Express) {
  const distPath = path.resolve(__dirname, "public");

  // If the build directory exists, serve it normally
  if (fs.existsSync(distPath)) {
    app.use(
      express.static(distPath, {
        setHeaders: (res, filePath) => {
          // Vite-hashed assets (`/assets/index-abc123.js`, etc.) are immutable
          // — the filename changes when the content changes — so cache forever.
          if (filePath.includes(`${path.sep}assets${path.sep}`)) {
            res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
            return;
          }
          // Images aren't fingerprinted but rarely change. 30-day cache with
          // must-revalidate so updated files propagate within a month at most.
          if (filePath.includes(`${path.sep}images${path.sep}`)) {
            res.setHeader("Cache-Control", "public, max-age=2592000, must-revalidate");
            return;
          }
          // Favicons + sitemap + robots: 1-day cache.
          if (/\.(svg|png|ico|xml|txt)$/.test(filePath)) {
            res.setHeader("Cache-Control", "public, max-age=86400");
            return;
          }
          // index.html: never cache (so users get latest deploy immediately).
          if (filePath.endsWith("index.html")) {
            res.setHeader("Cache-Control", "no-cache");
          }
        },
      })
    );
    app.use("/{*path}", (_req, res) => {
      res.setHeader("Cache-Control", "no-cache");
      res.sendFile(path.resolve(distPath, "index.html"));
    });
  } else {
    // Fallback: serve coming soon page directly
    app.use("/{*path}", (_req, res) => {
      res.setHeader("Content-Type", "text/html");
      res.send(comingSoonHtml);
    });
  }
}
