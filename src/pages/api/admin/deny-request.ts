import type { APIRoute } from "astro";
import { getDb, schema } from "../../../db";
import { eq } from "drizzle-orm";

export const POST: APIRoute = async ({ request, redirect, locals }) => {
  // Defense-in-depth: verify admin role at handler level
  const session = (locals as any).session;
  if (!session?.user || (session.user as any).role !== "admin") {
    return new Response("Forbidden", { status: 403 });
  }

  const form = await request.formData();
  const requestId = form.get("requestId") as string;
  if (!requestId) return new Response("Missing requestId", { status: 400 });

  const db = getDb();
  await db
    .update(schema.organizerRequests)
    .set({ status: "denied", reviewedAt: new Date() })
    .where(eq(schema.organizerRequests.id, requestId));

  return redirect("/admin/requests");
};
