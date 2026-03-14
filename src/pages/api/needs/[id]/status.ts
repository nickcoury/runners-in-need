export const prerender = false;

import type { APIRoute } from "astro";
import { getDb, schema } from "../../../../db";
import { eq } from "drizzle-orm";
import { verifyActionToken } from "../../../../lib/tokens";

const VALID_ACTIONS: Record<string, string> = {
  keep_open: "active",
  partially_fulfilled: "partially_fulfilled",
  fulfilled: "fulfilled",
};

export const GET: APIRoute = async ({ params, url }) => {
  const needId = params.id!;
  const action = url.searchParams.get("action");
  const token = url.searchParams.get("token");

  if (!action || !token || !VALID_ACTIONS[action]) {
    return new Response(page("Invalid Request", "The link you followed is invalid or incomplete."), {
      status: 400,
      headers: { "Content-Type": "text/html" },
    });
  }

  const valid = await verifyActionToken(needId, token);
  if (!valid) {
    return new Response(page("Invalid Token", "This link has expired or is invalid. Please log in to your dashboard to update the need."), {
      status: 403,
      headers: { "Content-Type": "text/html" },
    });
  }

  const db = getDb();
  const need = await db.query.needs.findFirst({
    where: eq(schema.needs.id, needId),
  });

  if (!need) {
    return new Response(page("Not Found", "This need no longer exists."), {
      status: 404,
      headers: { "Content-Type": "text/html" },
    });
  }

  const newStatus = VALID_ACTIONS[action];
  await db
    .update(schema.needs)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(schema.needs.id, needId));

  const labels: Record<string, string> = {
    active: "reopened and accepting pledges",
    partially_fulfilled: "marked as partially fulfilled",
    fulfilled: "confirmed as fulfilled",
  };

  return new Response(
    page("Status Updated", `<strong>"${need.title}"</strong> has been ${labels[newStatus]}.`),
    { status: 200, headers: { "Content-Type": "text/html" } }
  );
};

function page(title: string, message: string): string {
  return `<!DOCTYPE html>
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
}
