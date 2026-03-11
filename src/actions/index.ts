import { defineAction } from "astro:actions";
import { z } from "astro:schema";
import { getDb, schema } from "../db";
import { createId } from "../lib/id";
import { eq } from "drizzle-orm";

export const server = {
  createNeed: defineAction({
    accept: "form",
    input: z.object({
      orgId: z.string(),
      categoryTag: z.enum(["shoes", "apparel", "accessories", "other"]),
      title: z.string().min(5).max(200),
      body: z.string().min(10).max(5000),
      extrasWelcome: z.boolean().default(false),
      expiresInDays: z.number().min(7).max(180).default(90),
      continuedFromId: z.string().optional(),
    }),
    handler: async (input) => {
      const db = getDb();
      const org = await db.query.organizations.findFirst({
        where: eq(schema.organizations.id, input.orgId),
      });

      if (!org) throw new Error("Organization not found");

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + input.expiresInDays);

      const need = {
        id: createId(),
        orgId: input.orgId,
        categoryTag: input.categoryTag,
        title: input.title,
        body: input.body,
        extrasWelcome: input.extrasWelcome,
        location: org.location,
        latitude: org.latitude,
        longitude: org.longitude,
        status: "active" as const,
        continuedFromId: input.continuedFromId,
        expiresAt,
      };

      await db.insert(schema.needs).values(need);
      return { id: need.id };
    },
  }),

  createPledge: defineAction({
    accept: "form",
    input: z.object({
      needId: z.string(),
      donorEmail: z.string().email(),
      donorName: z.string().optional(),
      description: z.string().min(5).max(2000),
    }),
    handler: async (input) => {
      const db = getDb();
      const need = await db.query.needs.findFirst({
        where: eq(schema.needs.id, input.needId),
      });

      if (!need) throw new Error("Need not found");
      if (need.status !== "active")
        throw new Error("This need is no longer accepting pledges");

      const pledge = {
        id: createId(),
        needId: input.needId,
        donorEmail: input.donorEmail,
        donorName: input.donorName,
        description: input.description,
        status: "collecting" as const,
      };

      await db.insert(schema.pledges).values(pledge);
      return { id: pledge.id };
    },
  }),

  updatePledgeStatus: defineAction({
    accept: "form",
    input: z.object({
      pledgeId: z.string(),
      status: z.enum([
        "collecting",
        "ready_to_deliver",
        "delivered",
        "withdrawn",
      ]),
    }),
    handler: async (input) => {
      const db = getDb();
      await db
        .update(schema.pledges)
        .set({ status: input.status, updatedAt: new Date() })
        .where(eq(schema.pledges.id, input.pledgeId));
      return { success: true };
    },
  }),

  submitOrganizerRequest: defineAction({
    accept: "form",
    input: z.object({
      userId: z.string(),
      orgName: z.string().min(2).max(200),
      orgDescription: z.string().min(10).max(2000),
      orgUrl: z.string().url().optional(),
    }),
    handler: async (input) => {
      const db = getDb();
      const request = {
        id: createId(),
        userId: input.userId,
        orgName: input.orgName,
        orgDescription: input.orgDescription,
        orgUrl: input.orgUrl,
        status: "pending" as const,
      };

      await db.insert(schema.organizerRequests).values(request);
      return { id: request.id };
    },
  }),
};
