import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Permanent (301) redirects for retired URLs — preserves SEO link equity
// and keeps any external bookmarks landing on a useful page.
const PERMANENT_REDIRECTS: Record<string, string> = {
  "/services/corporate-leasing": "/services/leasing",
  "/commercial/mega-malls": "/commercial/mega-mall",
  "/commercial/strip-malls": "/commercial/strip-mall",
  "/admin-offices": "/admin",
  "/admin-offices/business-park": "/admin/business-park",
  "/admin-offices/business-building": "/admin/business-building",
  "/admin-offices/mixed-use": "/admin/mixed-use",
  "/admin-offices/mixed-use-mall": "/admin/mixed-use",
};

// Prefix redirects for path roots that have moved. Anything matching the
// `from` prefix is rewritten to the `to` prefix, preserving the rest of the
// path and the query string. Order matters: longer prefixes first.
const PREFIX_REDIRECTS: { from: string; to: string }[] = [
  { from: "/resources/blog", to: "/blog" },
  { from: "/resources/faqs", to: "/faqs" },
  { from: "/resources/glossary", to: "/glossary" },
];

app.use((req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD") {
    const target = PERMANENT_REDIRECTS[req.path];
    if (target) {
      const query = req.url.slice(req.path.length);
      res.redirect(301, target + query);
      return;
    }
    for (const { from, to } of PREFIX_REDIRECTS) {
      if (req.path === from || req.path.startsWith(`${from}/`)) {
        const rest = req.path.slice(from.length);
        const query = req.url.slice(req.path.length);
        res.redirect(301, to + rest + query);
        return;
      }
    }
  }
  next();
});

// Trailing-slash 301 redirect — canonicalize every URL to the no-slash form so
// search engines see one URL per page and link equity stays consolidated.
// Skips the root path "/" which must keep its slash. Preserves the query string.
// Applies to GET and HEAD only (HEAD is used by crawlers and link checkers).
app.use((req, res, next) => {
  if (
    (req.method === "GET" || req.method === "HEAD") &&
    req.path.length > 1 &&
    req.path.endsWith("/")
  ) {
    const trimmed = req.path.replace(/\/+$/, "");
    const query = req.url.slice(req.path.length);
    res.redirect(301, trimmed + query);
    return;
  }
  next();
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "3001", 10);
  httpServer.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();

