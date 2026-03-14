import { defineMiddleware } from "astro:middleware";
import { Auth } from "@auth/core";
import type { Session } from "@auth/core/types";
import { getEnv } from "./lib/env";

const protectedRoutes = ["/post", "/dashboard", "/profile"];
const adminRoutes = ["/admin"];

// Simple in-memory rate limiting for API mutation endpoints.
// NOTE: Cloudflare Workers are stateless — this map resets on each deploy or
// cold start. For production-grade rate limiting, use Cloudflare Rate Limiting
// rules (https://developers.cloudflare.com/waf/rate-limiting-rules/).
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 30; // max requests per window
const rateLimitMap = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) ?? [];

  // Evict entries outside the window
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (recent.length >= RATE_LIMIT_MAX) {
    rateLimitMap.set(ip, recent);
    return true;
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  return false;
}

// Periodically prune stale IPs to prevent unbounded memory growth
let lastPrune = Date.now();
function pruneIfNeeded() {
  const now = Date.now();
  if (now - lastPrune < RATE_LIMIT_WINDOW_MS) return;
  lastPrune = now;
  for (const [ip, timestamps] of rateLimitMap) {
    const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
    if (recent.length === 0) {
      rateLimitMap.delete(ip);
    } else {
      rateLimitMap.set(ip, recent);
    }
  }
}

function isProtected(pathname: string): boolean {
  return (
    protectedRoutes.some((r) => pathname === r || pathname.startsWith(r + "/")) ||
    pathname.startsWith("/api/") ||
    adminRoutes.some((r) => pathname === r || pathname.startsWith(r + "/"))
  );
}

function isAdminRoute(pathname: string): boolean {
  return adminRoutes.some((r) => pathname === r || pathname.startsWith(r + "/")) ||
    pathname.startsWith("/api/admin/");
}

async function getSession(req: Request): Promise<Session | null> {
  const { default: authConfig } = await import("./lib/auth");
  const config = { ...authConfig };
  // @ts-ignore
  config.secret ??= getEnv("AUTH_SECRET");
  config.trustHost ??= true;

  const prefix = "/api/auth";
  const url = new URL(`${prefix}/session`, req.url);
  const response = await Auth(new Request(url, { headers: req.headers }), config);

  if (response.status !== 200) return null;
  const data = await response.json();
  if (!data || !Object.keys(data).length) return null;
  return data as Session;
}

function addSecurityHeaders(response: Response): Response {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  // CSP only in production — Vite dev server uses inline scripts
  if (import.meta.env.PROD) {
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' https://challenges.cloudflare.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self' https://challenges.cloudflare.com https://nominatim.openstreetmap.org https://*.tile.openstreetmap.org",
        "frame-src https://challenges.cloudflare.com",
      ].join("; ")
    );
  }
  return response;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  const method = context.request.method;

  // CSRF: Reject state-changing requests without a valid Origin header
  if (method !== "GET" && method !== "HEAD") {
    const origin = context.request.headers.get("Origin");
    if (!origin) {
      // Missing Origin on non-GET — block unless it's a same-origin navigation
      // (browsers always send Origin on cross-origin requests and fetch())
      const secFetchSite = context.request.headers.get("Sec-Fetch-Site");
      if (secFetchSite && secFetchSite !== "same-origin" && secFetchSite !== "none") {
        return addSecurityHeaders(new Response("CSRF check failed", { status: 403 }));
      }
    } else {
      const requestHost = context.url.host;
      const originHost = new URL(origin).host;
      if (originHost !== requestHost) {
        return addSecurityHeaders(new Response("CSRF check failed", { status: 403 }));
      }
    }
  }

  // Rate limit API mutation requests (POST/PUT/DELETE), excluding auth endpoints
  if (
    pathname.startsWith("/api/") &&
    !pathname.startsWith("/api/auth") &&
    method !== "GET" &&
    method !== "HEAD"
  ) {
    const ip =
      context.request.headers.get("CF-Connecting-IP") ??
      context.request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ??
      "unknown";
    pruneIfNeeded();
    if (isRateLimited(ip)) {
      return addSecurityHeaders(new Response(JSON.stringify({ error: "Too many requests. Please try again later." }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "60",
        },
      }));
    }
  }

  // Skip auth routes and public API endpoints
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/auth/") ||
    pathname === "/api/health" ||
    pathname.startsWith("/api/cron/")
  ) {
    return addSecurityHeaders(await next());
  }

  // Public endpoints/pages that benefit from session but don't require it
  if (pathname === "/api/pledges" || pathname === "/drives") {
    const session = await getSession(context.request);
    if (session?.user) {
      context.locals.session = session;
    }
    return addSecurityHeaders(await next());
  }

  if (!isProtected(pathname)) {
    return addSecurityHeaders(await next());
  }

  const session = await getSession(context.request);

  if (!session?.user) {
    const callbackUrl = encodeURIComponent(context.url.pathname);
    return addSecurityHeaders(context.redirect(`/auth/signin?callbackUrl=${callbackUrl}`));
  }

  if (isAdminRoute(pathname)) {
    const role = session.user.role;
    if (role !== "admin") {
      return addSecurityHeaders(new Response("Forbidden", { status: 403 }));
    }
  }

  // Store session on locals for downstream use
  context.locals.session = session;

  return addSecurityHeaders(await next());
});
