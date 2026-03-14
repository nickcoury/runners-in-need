export const prerender = false;
import type { APIRoute } from "astro";
import { getDb, schema } from "../../../db";
import { eq } from "drizzle-orm";
import { geocode } from "../../../lib/geocode";
import { sanitize } from "../../../lib/html";
import { jsonError } from "../../../lib/api";

export const POST: APIRoute = async ({ request, locals }) => {
  const session = locals.session;
  if (!session?.user?.id) {
    return jsonError("Unauthorized", 401);
  }

  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, session.user.id),
  });

  if (!user || user.role !== "organizer" || !user.orgId) {
    return jsonError("Only organizers can update their organization", 403);
  }

  const form = await request.formData();
  const orgId = form.get("orgId") as string;
  const name = form.get("name") as string;
  const location = form.get("location") as string;
  const description = form.get("description") as string;

  if (orgId !== user.orgId) {
    return jsonError("Cannot update another organization", 403);
  }

  if (!name || name.length < 2 || name.length > 200) {
    return jsonError("Name must be 2-200 characters", 400);
  }

  if (!location) {
    return jsonError("Location is required", 400);
  }

  const sanitizedLocation = sanitize(location);
  const coords = await geocode(sanitizedLocation);

  await db
    .update(schema.organizations)
    .set({
      name: sanitize(name),
      location: sanitizedLocation,
      description: description ? sanitize(description) : null,
      ...(coords && { latitude: coords.latitude, longitude: coords.longitude }),
    })
    .where(eq(schema.organizations.id, orgId));

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
