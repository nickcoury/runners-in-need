import { getDb, schema } from "../db";
import { eq } from "drizzle-orm";

export type AuthSession = NonNullable<App.Locals["session"]> & {
  user: AppSessionUser;
};
type OrganizerUser = typeof schema.users.$inferSelect;
type RequireOrganizerResult =
  | { error: Response }
  | { session: AuthSession; user: OrganizerUser; db: ReturnType<typeof getDb> };

export function jsonError(message: string, status: number): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export function requireAuth(locals: App.Locals): AuthSession | null {
  const session = locals.session;
  if (!session?.user?.id) {
    return null;
  }
  return session as AuthSession;
}

export async function requireOrganizer(
  locals: App.Locals
): Promise<RequireOrganizerResult> {
  const session = requireAuth(locals);
  if (!session) return { error: jsonError("Unauthorized", 401) } as const;
  const db = getDb();
  const user = await db.query.users.findFirst({
    where: eq(schema.users.id, session.user.id),
  });
  if (!user || user.role !== "organizer" || !user.orgId) {
    return { error: jsonError("Only organizers can perform this action", 403) } as const;
  }
  return { session, user, db } as const;
}
