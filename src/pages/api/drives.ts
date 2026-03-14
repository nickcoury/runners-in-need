export const prerender = false;
import type { APIRoute } from "astro";
import { getDb, schema } from "../../db";
import { eq } from "drizzle-orm";
import { createId } from "../../lib/id";
import { sanitize } from "../../lib/html";

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const session = (locals as any).session;
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

  const form = await request.formData();
  const organizerName = form.get("organizerName") as string;
  const organizerEmail = form.get("organizerEmail") as string;
  const groupName = form.get("groupName") as string;
  const eventName = form.get("eventName") as string;
  const eventDateStr = form.get("eventDate") as string;
  const eventLocation = form.get("eventLocation") as string;
  const estimatedAttendeesStr = form.get("estimatedAttendees") as string;
  const description = form.get("description") as string;

  // Validate required fields
  if (!organizerName || !organizerEmail || !groupName || !eventName || !eventDateStr || !eventLocation || !description) {
    return new Response("Missing required fields", { status: 400 });
  }

  if (organizerName.length < 2 || organizerName.length > 200) {
    return new Response("Organizer name must be 2-200 characters", { status: 400 });
  }
  if (groupName.length < 2 || groupName.length > 200) {
    return new Response("Group name must be 2-200 characters", { status: 400 });
  }
  if (eventName.length < 2 || eventName.length > 200) {
    return new Response("Event name must be 2-200 characters", { status: 400 });
  }
  if (description.length < 10 || description.length > 2000) {
    return new Response("Description must be 10-2000 characters", { status: 400 });
  }

  const eventDate = new Date(eventDateStr);
  if (isNaN(eventDate.getTime())) {
    return new Response("Invalid event date", { status: 400 });
  }

  const estimatedAttendees = estimatedAttendeesStr ? parseInt(estimatedAttendeesStr, 10) : null;
  if (estimatedAttendees !== null && (isNaN(estimatedAttendees) || estimatedAttendees < 1)) {
    return new Response("Invalid estimated attendees", { status: 400 });
  }

  const db = getDb();
  const driveId = createId();

  await db.insert(schema.pledgeDrives).values({
    id: driveId,
    organizerUserId: session.user.id,
    organizerName: sanitize(organizerName),
    organizerEmail: sanitize(organizerEmail),
    groupName: sanitize(groupName),
    eventName: sanitize(eventName),
    eventDate,
    eventLocation: sanitize(eventLocation),
    estimatedAttendees,
    description: sanitize(description),
    status: "planned",
  });

  return redirect("/drives?success=true");
};
