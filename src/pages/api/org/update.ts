export const prerender = false;
import type { APIRoute } from "astro";
import { getDb, schema } from "../../../db";
import { eq } from "drizzle-orm";
import { geocode } from "../../../lib/geocode";
import { sanitize } from "../../../lib/html";

export const POST: APIRoute = async ({ request, locals }) => {
  const session = (locals as any).session;
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
  const name = form.get("name") as string;
  const location = form.get("location") as string;
  const description = form.get("description") as string;

  if (orgId !== user.orgId) {
    return new Response("Cannot update another organization", { status: 403 });
  }

  if (!name || name.length < 2 || name.length > 200) {
    return new Response("Name must be 2-200 characters", { status: 400 });
  }

  if (!location) {
    return new Response("Location is required", { status: 400 });
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
