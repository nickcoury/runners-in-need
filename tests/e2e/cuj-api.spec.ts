import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:4321";

test.describe("API Endpoint Behavior", () => {
  test("GET /api/health returns 200 with valid JSON shape", async ({
    request,
  }) => {
    const response = await request.get("/api/health");
    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("db");
    expect(body).toHaveProperty("timestamp");
    expect(["ok", "degraded"]).toContain(body.status);
    expect(["connected", "unreachable"]).toContain(body.db);
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });

  test("POST /api/pledges without required fields returns 400", async ({
    request,
  }) => {
    const response = await request.post("/api/pledges", {
      headers: { Origin: BASE_URL },
      multipart: {
        // Missing needId, donorEmail, description
      },
    });
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty("error");
    expect(body.error).toContain("Missing required fields");
  });

  test("POST /api/pledges with invalid email returns 400", async ({
    request,
  }) => {
    const response = await request.post("/api/pledges", {
      headers: { Origin: BASE_URL },
      multipart: {
        needId: "fake-need-id",
        donorEmail: "not-an-email",
        description: "I have some shoes to donate",
      },
    });
    expect(response.status()).toBe(400);

    const body = await response.json();
    expect(body).toHaveProperty("error");
    expect(body.error).toContain("Invalid email");
  });

  test("POST /api/needs without auth returns 401", async ({ request }) => {
    const response = await request.post("/api/needs", {
      headers: { Origin: BASE_URL },
      multipart: {
        orgId: "fake-org",
        title: "Test need",
        body: "We need running shoes",
        categoryTag: "shoes",
      },
    });
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body).toHaveProperty("error");
  });

  test("POST /api/messages without auth returns 401", async ({ request }) => {
    const response = await request.post("/api/messages", {
      headers: { Origin: BASE_URL },
      multipart: {
        pledgeId: "fake-pledge",
        body: "Hello, is this still available?",
      },
    });
    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body).toHaveProperty("error");
  });
});
