export const prerender = false;
import type { APIRoute } from "astro";
import { getDb, schema } from "../../../db";
import { eq } from "drizzle-orm";
import { sanitize } from "../../../lib/html";
import { jsonError, requireAuth } from "../../../lib/api";

export const POST: APIRoute = async ({ request, locals }) => {
  const session = requireAuth(locals);
  if (!session) return jsonError("Unauthorized", 401);

  const form = await request.formData();
  const name = (form.get("name") as string)?.trim();

  if (!name || name.length < 1 || name.length > 100) {
    return jsonError("Name must be 1-100 characters", 400);
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
