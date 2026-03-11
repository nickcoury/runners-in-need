import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ============================================================
// Users
// ============================================================

export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // nanoid
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  role: text("role", { enum: ["donor", "organizer", "admin"] })
    .notNull()
    .default("donor"),
  orgId: text("org_id").references(() => organizations.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [users.orgId],
    references: [organizations.id],
  }),
  pledges: many(pledges),
  messages: many(messages),
}));

// ============================================================
// Organizations
// ============================================================

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location").notNull(), // City, State (public)
  latitude: real("latitude"),
  longitude: real("longitude"),
  shippingAddress: text("shipping_address"), // Full address (opt-in, private)
  shippingAttn: text("shipping_attn"), // "Attn: Coach Smith"
  showShippingAddress: integer("show_shipping_address", { mode: "boolean" })
    .notNull()
    .default(false),
  verified: integer("verified", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
  members: many(users),
  needs: many(needs),
}));

// ============================================================
// Organizer Requests (approval queue)
// ============================================================

export const organizerRequests = sqliteTable("organizer_requests", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  orgName: text("org_name").notNull(),
  orgDescription: text("org_description").notNull(),
  orgUrl: text("org_url"), // Public link proving association
  status: text("status", { enum: ["pending", "approved", "denied"] })
    .notNull()
    .default("pending"),
  reviewedBy: text("reviewed_by").references(() => users.id),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  reviewedAt: integer("reviewed_at", { mode: "timestamp" }),
});

// ============================================================
// Needs
// ============================================================

export const needs = sqliteTable("needs", {
  id: text("id").primaryKey(),
  orgId: text("org_id")
    .notNull()
    .references(() => organizations.id),
  categoryTag: text("category_tag", {
    enum: ["shoes", "apparel", "accessories", "other"],
  }).notNull(),
  title: text("title").notNull(),
  body: text("body").notNull(), // Free-form text (template-assisted)
  extrasWelcome: integer("extras_welcome", { mode: "boolean" })
    .notNull()
    .default(false),
  location: text("location").notNull(), // Inherited from org, can override
  latitude: real("latitude"),
  longitude: real("longitude"),
  status: text("status", {
    enum: ["active", "partially_fulfilled", "fulfilled", "expired"],
  })
    .notNull()
    .default("active"),
  continuedFromId: text("continued_from_id").references((): any => needs.id),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const needsRelations = relations(needs, ({ one, many }) => ({
  organization: one(organizations, {
    fields: [needs.orgId],
    references: [organizations.id],
  }),
  continuedFrom: one(needs, {
    fields: [needs.continuedFromId],
    references: [needs.id],
    relationName: "needChain",
  }),
  pledges: many(pledges),
}));

// ============================================================
// Pledges (donor commitments)
// ============================================================

export const pledges = sqliteTable("pledges", {
  id: text("id").primaryKey(),
  needId: text("need_id")
    .notNull()
    .references(() => needs.id),
  donorId: text("donor_id").references(() => users.id), // Nullable for anonymous
  donorEmail: text("donor_email").notNull(), // Always required for contact
  donorName: text("donor_name"),
  description: text("description").notNull(), // What they're bringing
  status: text("status", {
    enum: ["collecting", "ready_to_deliver", "delivered", "withdrawn"],
  })
    .notNull()
    .default("collecting"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const pledgesRelations = relations(pledges, ({ one, many }) => ({
  need: one(needs, {
    fields: [pledges.needId],
    references: [needs.id],
  }),
  donor: one(users, {
    fields: [pledges.donorId],
    references: [users.id],
  }),
  messages: many(messages),
}));

// ============================================================
// Messages (per-pledge threads)
// ============================================================

export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  pledgeId: text("pledge_id")
    .notNull()
    .references(() => pledges.id),
  senderId: text("sender_id")
    .notNull()
    .references(() => users.id),
  body: text("body").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  pledge: one(pledges, {
    fields: [messages.pledgeId],
    references: [pledges.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));
