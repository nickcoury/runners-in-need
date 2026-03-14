export const prerender = false;

import type { APIRoute } from "astro";
import { getDb, schema } from "../../../../db";
import { eq, inArray } from "drizzle-orm";
import { verifyActionToken } from "../../../../lib/tokens";
import { createId } from "../../../../lib/id";
import { escapeHtml } from "../../../../lib/html";

const VALID_ACTIONS = new Set([
  "keep_open",
  "partially_fulfilled",
  "fulfilled",
  "not_fulfilled",
]);

export const GET: APIRoute = async ({ params, url }) => {
  const needId = params.id!;
  const action = url.searchParams.get("action");
  const token = url.searchParams.get("token");

  if (!action || !token || !VALID_ACTIONS.has(action)) {
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

  // Handle each action
  if (action === "fulfilled" || action === "keep_open") {
    const newStatus = action === "fulfilled" ? "fulfilled" : "active";
    await db
      .update(schema.needs)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(schema.needs.id, needId));

    const label =
      newStatus === "fulfilled"
        ? "confirmed as fulfilled"
        : "reopened and accepting pledges";

    return new Response(
      page("Status Updated", `<strong>"${escapeHtml(need.title)}"</strong> has been ${label}.`),
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  }

  if (action === "partially_fulfilled") {
    // Close the original need as fulfilled
    await db
      .update(schema.needs)
      .set({ status: "fulfilled", updatedAt: new Date() })
      .where(eq(schema.needs.id, needId));

    // Create a new need copying the original, linked via continuedFromId
    const newNeedId = createId();
    const newExpiry = new Date();
    newExpiry.setDate(newExpiry.getDate() + 90);

    await db.insert(schema.needs).values({
      id: newNeedId,
      orgId: need.orgId,
      categoryTag: need.categoryTag,
      title: need.title,
      body: need.body,
      extrasWelcome: need.extrasWelcome,
      location: need.location,
      latitude: need.latitude,
      longitude: need.longitude,
      status: "active",
      continuedFromId: needId,
      deliveryMethods: need.deliveryMethods,
      deliveryInstructions: need.deliveryInstructions,
      expiresAt: newExpiry,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Redirect to the new need's edit page
    return new Response(null, {
      status: 302,
      headers: { Location: `/needs/${newNeedId}/edit` },
    });
  }

  if (action === "not_fulfilled") {
    // Set all delivered pledges back to withdrawn
    const deliveredPledges = await db.query.pledges.findMany({
      where: eq(schema.pledges.needId, needId),
    });
    const deliveredIds = deliveredPledges
      .filter((p) => p.status === "delivered")
      .map((p) => p.id);

    if (deliveredIds.length > 0) {
      await db
        .update(schema.pledges)
        .set({ status: "withdrawn", updatedAt: new Date() })
        .where(inArray(schema.pledges.id, deliveredIds));
    }

    // Keep need active, clear allDeliveredAt
    await db
      .update(schema.needs)
      .set({ status: "active", allDeliveredAt: null, updatedAt: new Date() })
      .where(eq(schema.needs.id, needId));

    return new Response(
      page(
        "Need Kept Open",
        `<strong>"${escapeHtml(need.title)}"</strong> remains active. ${deliveredIds.length} delivered pledge(s) have been withdrawn.`
      ),
      { status: 200, headers: { "Content-Type": "text/html" } }
    );
  }

  return new Response(page("Invalid Request", "Unknown action."), {
    status: 400,
    headers: { "Content-Type": "text/html" },
  });
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
