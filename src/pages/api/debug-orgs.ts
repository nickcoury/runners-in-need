export const prerender = false;
// Temporary diagnostic endpoint — remove after debugging PROD-C2
// Returns org/need relationship data to diagnose "Unknown Organization"
import type { APIRoute } from "astro";
import { getDb, schema } from "../../db";
import { sql } from "drizzle-orm";

export const GET: APIRoute = async () => {
  const db = getDb();

  // Count organizations
  const orgCount = await db.select({ count: sql<number>`count(*)` }).from(schema.organizations);

  // Get first 3 orgs (name + id only)
  const orgs = await db.select({
    id: schema.organizations.id,
    name: schema.organizations.name,
  }).from(schema.organizations).limit(3);

  // Get first 3 needs with orgId
  const needs = await db.select({
    id: schema.needs.id,
    title: schema.needs.title,
    orgId: schema.needs.orgId,
  }).from(schema.needs).limit(3);

  // Test relational query
  const needsWithOrg = await db.query.needs.findMany({
    with: { organization: { columns: { name: true } } },
    limit: 3,
  });

  const relationalResult = needsWithOrg.map((n) => ({
    needId: n.id,
    orgId: n.orgId,
    orgFromRelation: n.organization?.name ?? "NULL",
  }));

  return new Response(JSON.stringify({
    orgCount: orgCount[0]?.count,
    sampleOrgs: orgs,
    sampleNeeds: needs,
    relationalQuery: relationalResult,
  }, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
};
