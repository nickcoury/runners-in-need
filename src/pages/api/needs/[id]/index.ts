export const prerender = false;

import type { APIRoute } from "astro";
import { getDb, schema } from "../../../../db";
import { eq } from "drizzle-orm";

const VALID_CATEGORIES = ["shoes", "apparel", "accessories", "other"] as const;

function sanitize(s: string): string {
  return s.trim().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Also handle POST (HTML forms can't send PUT)
export const POST: APIRoute = async (context) => {
  return PUT(context);
};

export const PUT: APIRoute = async ({ params, request, locals, redirect }) => {
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
    return new Response("Only organizers can update needs", { status: 403 });
  }

  // Load the need
  const need = await db.query.needs.findFirst({
    where: eq(schema.needs.id, params.id!),
  });
  if (!need) {
    return new Response("Need not found", { status: 404 });
  }
  if (need.orgId !== user.orgId) {
    return new Response("Cannot update another organization's need", { status: 403 });
  }

  const form = await request.formData();
  const title = form.get("title") as string;
  const body = form.get("body") as string;
  const categoryTag = form.get("categoryTag") as string;
  const extrasWelcome = form.get("extrasWelcome") === "on";
  const expiresInDays = parseInt(form.get("expiresInDays") as string, 10) || 90;

  // Validate
  if (!title || !body) {
    return new Response("Missing required fields", { status: 400 });
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

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  await db
    .update(schema.needs)
    .set({
      title: sanitize(title),
      body: sanitize(body),
      categoryTag,
      extrasWelcome,
      expiresAt,
      updatedAt: new Date(),
    })
    .where(eq(schema.needs.id, params.id!));

  return redirect(`/needs/${params.id}`);
};

export const DELETE: APIRoute = async ({ params, locals, redirect }) => {
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
    return new Response("Only organizers can delete needs", { status: 403 });
  }

  // Load the need
  const need = await db.query.needs.findFirst({
    where: eq(schema.needs.id, params.id!),
  });
  if (!need) {
    return new Response("Need not found", { status: 404 });
  }
  if (need.orgId !== user.orgId) {
    return new Response("Cannot delete another organization's need", { status: 403 });
  }

  // Soft-delete by setting status to expired
  await db
    .update(schema.needs)
    .set({
      status: "expired",
      updatedAt: new Date(),
    })
    .where(eq(schema.needs.id, params.id!));

  return redirect("/dashboard");
};
