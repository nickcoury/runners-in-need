export const prerender = false;
import type { APIRoute } from "astro";
import { getDb, schema } from "../../../db";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async ({ request, locals }) => {
  const session = locals.session;
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, session.user.id),
  });

  if (!user || user.role !== "organizer" || !user.orgId) {
    return new Response("Only organizers can update their organization", { status: 403 });
  }

  const form = await request.formData();
  const orgId = form.get("orgId") as string;
  const pledgeDriveInterest = form.get("pledgeDriveInterest") === "on";

  if (orgId !== user.orgId) {
    return new Response("Cannot update another organization", { status: 403 });
  }

  await db
    .update(schema.organizations)
    .set({ pledgeDriveInterest })
    .where(eq(schema.organizations.id, orgId));

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
