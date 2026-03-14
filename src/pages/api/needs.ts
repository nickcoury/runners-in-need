export const prerender = false;
import type { APIRoute } from "astro";
import { getDb, schema } from "../../db";
import { eq } from "drizzle-orm";
import { createId } from "../../lib/id";
import { sanitize } from "../../lib/html";

const VALID_CATEGORIES = ["shoes", "apparel", "accessories", "other"] as const;

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const session = (locals as any).session;
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const db = getDb();

  // Verify user is an organizer with an org
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, session.user.id),
  });
  if (!user || user.role !== "organizer" || !user.orgId) {
    return new Response("Only organizers can post needs", { status: 403 });
  }

  const form = await request.formData();
  const orgId = form.get("orgId") as string;
  const categoryTag = form.get("categoryTag") as string;
  const title = form.get("title") as string;
  const body = form.get("body") as string;
  const extrasWelcome = form.get("extrasWelcome") === "on";
  const expiresInDays = parseInt(form.get("expiresInDays") as string, 10) || 90;
  const continuedFromId = form.get("continuedFromId") as string | null;

  // Validate
  if (!orgId || !title || !body) {
    return new Response("Missing required fields", { status: 400 });
  }
  if (orgId !== user.orgId) {
    return new Response("Cannot post for another organization", { status: 403 });
  }
  if (!VALID_CATEGORIES.includes(categoryTag as any)) {
    return new Response("Invalid category", { status: 400 });
  }
  if (title.length < 5 || title.length > 200) {
    return new Response("Title must be 5-200 characters", { status: 400 });
  }
  if (body.length < 10 || body.length > 5000) {
    return new Response("Description must be 10-5000 characters", { status: 400 });
  }
  if (expiresInDays < 7 || expiresInDays > 180) {
    return new Response("Invalid expiration", { status: 400 });
  }

  const org = await db.query.organizations.findFirst({
    where: eq(schema.organizations.id, orgId),
  });
  if (!org) {
    return new Response("Organization not found", { status: 404 });
  }

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  const needId = createId();
  await db.insert(schema.needs).values({
    id: needId,
    orgId,
    categoryTag,
    title: sanitize(title),
    body: sanitize(body),
    extrasWelcome,
    location: org.location,
    latitude: org.latitude,
    longitude: org.longitude,
    status: "active",
    continuedFromId: continuedFromId || undefined,
    expiresAt,
  });

  return redirect(`/needs/${needId}`);
};
