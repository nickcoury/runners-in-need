export const prerender = false;
import type { APIRoute } from "astro";
import { getDb, schema } from "../../../db";
import { eq } from "drizzle-orm";
import { sanitize } from "../../../lib/html";

export const POST: APIRoute = async ({ request, locals }) => {
  const session = (locals as any).session;
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const form = await request.formData();
  const name = (form.get("name") as string)?.trim();

  if (!name || name.length < 1 || name.length > 100) {
    return new Response("Name must be 1-100 characters", { status: 400 });
  }

  const db = getDb();
  await db
    .update(schema.users)
    .set({ name: sanitize(name) })
    .where(eq(schema.users.id, session.user.id));

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};
