export const prerender = false;
import type { APIRoute } from "astro";
import { getDb, schema } from "../../db";
import { eq, and } from "drizzle-orm";
import { createId } from "../../lib/id";
import { sendMessageNotificationEmail } from "../../lib/email";
import { sanitize } from "../../lib/html";
import { jsonError, requireAuth } from "../../lib/api";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const session = requireAuth(locals);
  if (!session) return jsonError("Unauthorized", 401);

  const form = await request.formData();
  const pledgeId = form.get("pledgeId") as string;
  const body = (form.get("body") as string)?.trim();

  if (!pledgeId || !body || body.length < 1 || body.length > 5000) {
    return jsonError("Invalid input", 400);
  }

  try {
    const db = getDb();

    // Verify pledge exists
    const pledge = await db.query.pledges.findFirst({
      where: eq(schema.pledges.id, pledgeId),
      with: { need: true },
    });
    if (!pledge) {
      return jsonError("Pledge not found", 404);
    }

    // Verify sender is either the donor or an org member
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, session.user.id),
    });
    if (!user) {
      return jsonError("User not found", 404);
    }

    const isDonor = pledge.donorId === user.id;
    const isOrgMember = user.orgId === pledge.need.orgId;
    if (!isDonor && !isOrgMember) {
      return jsonError("Forbidden", 403);
    }

    const sanitized = sanitize(body);

    await db.insert(schema.messages).values({
      id: createId(),
      pledgeId,
      senderId: user.id,
      body: sanitized,
    });

    // Notify the other party about the new message (fire-and-forget)
    if (isDonor) {
      // Donor sent a message — notify org members
      const orgMembers = await db.query.users.findMany({
        where: and(
          eq(schema.users.orgId, pledge.need.orgId),
          eq(schema.users.role, "organizer")
        ),
      });
      for (const member of orgMembers) {
        sendMessageNotificationEmail(
          member.email,
          pledge.need.title,
          pledge.need.id,
          user.name,
          sanitized
        ).catch((err) => console.error("[email] message notification failed:", err));
      }
    } else {
      // Org member sent a message — notify the donor
      if (pledge.donorEmail) {
        sendMessageNotificationEmail(
          pledge.donorEmail,
          pledge.need.title,
          pledge.need.id,
          user.name,
          sanitized
        ).catch((err) => console.error("[email] message notification failed:", err));
      }
    }

    // If form submission (has Referer), redirect back to need page
    const referer = request.headers.get("Referer");
    if (referer) {
      return redirect(new URL(referer).pathname);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Message creation failed:", e);
    return jsonError("Internal server error", 500);
  }
};
