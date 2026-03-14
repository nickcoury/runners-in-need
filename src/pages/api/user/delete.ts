export const prerender = false;
import type { APIRoute } from "astro";
import { getDb, schema } from "../../../db";
import { eq, inArray } from "drizzle-orm";
import { jsonError, requireAuth } from "../../../lib/api";

export const POST: APIRoute = async ({ locals }) => {
  const session = requireAuth(locals);
  if (!session) return jsonError("Unauthorized", 401);

  const db = getDb();
  const userId = session.user.id;

  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, userId),
  });
  if (!user) {
    return jsonError("User not found", 404);
  }

  // Withdraw active pledges in a single batch update
  const userPledges = await db.query.pledges.findMany({
    where: eq(schema.pledges.donorId, userId),
  });
  const activePledgeIds = userPledges
    .filter((p) => p.status === "collecting" || p.status === "ready_to_deliver")
    .map((p) => p.id);
  if (activePledgeIds.length > 0) {
    await db
      .update(schema.pledges)
      .set({ status: "withdrawn", updatedAt: new Date() })
      .where(inArray(schema.pledges.id, activePledgeIds));
  }

  // Expire organizer's active needs
  if (user.role === "organizer" && user.orgId) {
    await db
      .update(schema.needs)
      .set({ status: "expired", updatedAt: new Date() })
      .where(eq(schema.needs.orgId, user.orgId));
  }

  // Delete messages (senderId is NOT NULL, so we must delete rather than orphan)
  await db.delete(schema.messages).where(eq(schema.messages.senderId, userId));
  await db
    .update(schema.pledges)
    .set({ donorId: null, donorName: "Deleted User" })
    .where(eq(schema.pledges.donorId, userId));

  // Delete organizer requests
  await db
    .delete(schema.organizerRequests)
    .where(eq(schema.organizerRequests.userId, userId));

  // Auth.js sessions and accounts cascade on user delete
  // Delete the user
  await db.delete(schema.users).where(eq(schema.users.id, userId));

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
