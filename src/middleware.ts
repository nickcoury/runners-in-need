import { defineMiddleware } from "astro:middleware";
import { Auth } from "@auth/core";
import type { Session } from "@auth/core/types";
import { getEnv } from "./lib/env";

const protectedRoutes = ["/post", "/dashboard"];
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
        return new Response("CSRF check failed", { status: 403 });
      }
    } else {
      const requestHost = context.url.host;
      const originHost = new URL(origin).host;
      if (originHost !== requestHost) {
        return new Response("CSRF check failed", { status: 403 });
      }
    }
  }

  // Skip auth routes and public API endpoints
  if (pathname.startsWith("/api/auth") || pathname.startsWith("/auth/") || pathname === "/api/health") {
    return next();
  }

  if (!isProtected(pathname)) {
    return next();
  }

  const session = await getSession(context.request);

  if (!session?.user) {
    const callbackUrl = encodeURIComponent(context.url.pathname);
    return context.redirect(`/auth/signin?callbackUrl=${callbackUrl}`);
  }

  if (isAdminRoute(pathname)) {
    const role = (session.user as any).role;
    if (role !== "admin") {
      return new Response("Forbidden", { status: 403 });
    }
  }

  // Store session on locals for downstream use
  (context.locals as any).session = session;

  return next();
});
