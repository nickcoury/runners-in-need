import type { APIRoute } from "astro";
import { getDb, schema } from "../db";
import { inArray } from "drizzle-orm";

export const GET: APIRoute = async () => {
  const db = getDb();
  const needs = await db.query.needs.findMany({
    where: inArray(schema.needs.status, ["active", "partially_fulfilled"]),
    columns: { id: true, updatedAt: true },
  });

  const baseUrl = "https://runnersinneed.com";
  const staticPages = [
    { loc: "/", priority: "1.0", changefreq: "daily" },
    { loc: "/about", priority: "0.7", changefreq: "monthly" },
    { loc: "/why", priority: "0.7", changefreq: "monthly" },
    { loc: "/contact", priority: "0.5", changefreq: "monthly" },
    { loc: "/privacy", priority: "0.3", changefreq: "yearly" },
    { loc: "/terms", priority: "0.3", changefreq: "yearly" },
    { loc: "/become-organizer", priority: "0.6", changefreq: "monthly" },
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (p) => `  <url>
    <loc>${baseUrl}${p.loc}</loc>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join("\n")}
${needs
  .map(
    (n) => `  <url>
    <loc>${baseUrl}/needs/${n.id}</loc>
    <lastmod>${n.updatedAt.toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
