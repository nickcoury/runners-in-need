export const prerender = false;

import type { APIRoute } from "astro";
import { getDb, schema } from "../../../../db";
import { eq } from "drizzle-orm";
import { verifyActionToken } from "../../../../lib/tokens";

const EXTEND_DAYS = 90;

export const GET: APIRoute = async ({ params, url }) => {
  const needId = params.id!;
  const token = url.searchParams.get("token");

  if (!token) {
    return htmlPage("Invalid Request", "The link you followed is missing a token.");
  }

  const valid = await verifyActionToken(needId, token);
  if (!valid) {
    return htmlPage(
      "Invalid Token",
      "This link has expired or is invalid. Please log in to your dashboard to manage the need."
    );
  }

  const db = getDb();
  const need = await db.query.needs.findFirst({
    where: eq(schema.needs.id, needId),
  });

  if (!need) {
    return htmlPage("Not Found", "This need no longer exists.");
  }

  // Extend from the later of: current expiresAt or now
  const base = need.expiresAt > new Date() ? need.expiresAt : new Date();
  const newExpiry = new Date(base);
  newExpiry.setDate(newExpiry.getDate() + EXTEND_DAYS);

  // If the need was expired, reactivate it
  const newStatus =
    need.status === "expired" ? "active" : need.status;

  await db
    .update(schema.needs)
    .set({
      expiresAt: newExpiry,
      status: newStatus,
      updatedAt: new Date(),
    })
    .where(eq(schema.needs.id, needId));

  const formattedDate = newExpiry.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return htmlPage(
    "Need Extended",
    `<strong>"${need.title}"</strong> has been extended and now expires on <strong>${formattedDate}</strong>.`
  );
};

function htmlPage(title: string, message: string): Response {
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${title} — Runners In Need</title>
<style>body{margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f4f4f4;display:flex;align-items:center;justify-content:center;min-height:100vh;}
.card{max-width:480px;background:#fff;border-radius:8px;overflow:hidden;text-align:center;}
.header{background:#2D4A2D;padding:24px 32px;}
.header h1{margin:0;color:#fff;font-size:20px;}
.body{padding:32px;color:#333;font-size:15px;line-height:1.6;}
a.btn{display:inline-block;background:#2D4A2D;color:#fff;padding:10px 20px;border-radius:4px;text-decoration:none;font-weight:600;margin-top:16px;}</style>
</head>
<body><div class="card"><div class="header"><h1>${title}</h1></div><div class="body"><p>${message}</p><a class="btn" href="/dashboard">Go to Dashboard</a></div></div></body>
</html>`;

  return new Response(html, {
    status: title === "Need Extended" ? 200 : 400,
    headers: { "Content-Type": "text/html" },
  });
}
