import { defineMiddleware } from "astro:middleware";
import { Auth } from "@auth/core";
import type { Session } from "@auth/core/types";
import { getEnv } from "./lib/env";

const protectedRoutes = ["/post", "/dashboard", "/profile"];
const adminRoutes = ["/admin"];

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
  // CSP and HSTS only in production
  // Note: 'unsafe-inline' is needed because Astro inlines scripts for prerendered
  // static pages (/about, /terms, etc.). This is safe because Astro/React escape
  // all user content by default. Future improvement: nonce-based CSP or disable
  // prerendering for pages with interactive scripts.
  if (import.meta.env.PROD) {
    response.headers.set(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://static.cloudflareinsights.com",
        "style-src 'self' 'unsafe-inline' https://unpkg.com",
        "img-src 'self' data: https:",
        "font-src 'self'",
        "connect-src 'self' https://challenges.cloudflare.com https://nominatim.openstreetmap.org https://*.tile.openstreetmap.org",
        "frame-src https://challenges.cloudflare.com",
      ].join("; ")
    );
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
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

  // Skip auth routes and public API endpoints
  if (
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/auth/") ||
    pathname === "/api/health" ||
    pathname.startsWith("/api/cron/")
  ) {
    return addSecurityHeaders(await next());
  }

  // Public GET-only endpoints
  if (pathname === "/api/needs" && method === "GET") {
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
    // API routes get a 401 JSON response instead of a redirect
    if (pathname.startsWith("/api/")) {
      return addSecurityHeaders(new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }));
    }
    const callbackUrl = encodeURIComponent(context.url.pathname);
    return addSecurityHeaders(context.redirect(`/auth/signin?callbackUrl=${callbackUrl}`));
  }

  if (isAdminRoute(pathname)) {
    const role = session.user.role;
    if (role !== "admin") {
      if (pathname.startsWith("/api/")) {
        return addSecurityHeaders(new Response(JSON.stringify({ error: "Forbidden" }), {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }));
      }
      return addSecurityHeaders(context.redirect("/?error=forbidden"));
    }
  }

  // Store session on locals for downstream use
  context.locals.session = session;

  return addSecurityHeaders(await next());
});
