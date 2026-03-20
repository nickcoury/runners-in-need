import { test, expect } from "@playwright/test";

const BASE_URL = "http://localhost:4321";

test.describe("Security: CSRF Protection", () => {
  test("POST with cross-origin Origin header is rejected", async ({
    request,
  }) => {
    const response = await request.post("/api/pledges", {
      headers: { Origin: "https://evil.com" },
      multipart: {
        needId: "test",
        donorEmail: "test@example.com",
        description: "Test pledge",
      },
    });
    expect(response.status()).toBe(403);
    const body = await response.text();
    expect(body).toContain("CSRF");
  });

  test("POST with mismatched Origin header is rejected", async ({
    request,
  }) => {
    const response = await request.post("/api/messages", {
      headers: { Origin: "https://runnersinneed.com" },
      multipart: {
        pledgeId: "test",
        body: "Hello",
      },
    });
    expect(response.status()).toBe(403);
  });
});

test.describe("Security: Auth Protection", () => {
  test("GET /dashboard redirects unauthenticated to signin", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test("GET /profile redirects unauthenticated to signin", async ({
    page,
  }) => {
    await page.goto("/profile");
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test("GET /post redirects unauthenticated to signin", async ({ page }) => {
    await page.goto("/post");
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test("GET /admin redirects unauthenticated to signin", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test("POST /api/user/update without auth returns 401", async ({
    request,
  }) => {
    const response = await request.post("/api/user/update", {
      headers: { Origin: BASE_URL },
      multipart: { name: "Hacker" },
    });
    expect(response.status()).toBe(401);
  });

  test("POST /api/user/delete without auth returns 401", async ({
    request,
  }) => {
    const response = await request.post("/api/user/delete", {
      headers: { Origin: BASE_URL },
    });
    expect(response.status()).toBe(401);
  });

  test("POST /api/needs without auth returns 401", async ({ request }) => {
    const response = await request.post("/api/needs", {
      headers: { Origin: BASE_URL },
      multipart: {
        orgId: "test",
        title: "Test need title",
        body: "Test need body text here",
        categoryTag: "shoes",
      },
    });
    expect(response.status()).toBe(401);
  });

  test("POST /api/drives without auth returns 401", async ({ request }) => {
    const response = await request.post("/api/drives", {
      headers: { Origin: BASE_URL },
      multipart: {
        organizerName: "Test",
        organizerEmail: "test@example.com",
        groupName: "Test Group",
        eventName: "Test Event",
        eventDate: "2026-12-01",
        eventLocation: "Test Location",
        description: "Test description that is long enough",
      },
    });
    expect(response.status()).toBe(401);
  });

  test("POST /api/org/update without auth returns 401", async ({
    request,
  }) => {
    const response = await request.post("/api/org/update", {
      headers: { Origin: BASE_URL },
      multipart: { orgId: "test", name: "Hacked Org", location: "Nowhere" },
    });
    expect(response.status()).toBe(401);
  });

  test("POST /api/admin/approve-request without auth returns 401", async ({
    request,
  }) => {
    const response = await request.post("/api/admin/approve-request", {
      headers: { Origin: BASE_URL },
      multipart: { requestId: "test" },
    });
    // Could be 401 (middleware) or 403 (handler defense-in-depth)
    expect([401, 403]).toContain(response.status());
  });

  test("POST /api/admin/deny-request without auth returns 401", async ({
    request,
  }) => {
    const response = await request.post("/api/admin/deny-request", {
      headers: { Origin: BASE_URL },
      multipart: { requestId: "test" },
    });
    expect([401, 403]).toContain(response.status());
  });
});

test.describe("Security: Cron Endpoint", () => {
  test("GET /api/cron/daily without token returns 403", async ({
    request,
  }) => {
    const response = await request.get("/api/cron/daily");
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("Forbidden");
    // Must NOT reveal config state
    expect(body.error).not.toContain("not configured");
  });

  test("GET /api/cron/daily with invalid token returns 403", async ({
    request,
  }) => {
    const response = await request.get("/api/cron/daily?token=wrong-secret");
    expect(response.status()).toBe(403);
  });

  test("POST /api/cron/daily with invalid header returns 403", async ({
    request,
  }) => {
    const response = await request.post("/api/cron/daily", {
      headers: { "x-cron-secret": "wrong-secret" },
    });
    expect(response.status()).toBe(403);
  });
});

test.describe("Security: Input Validation", () => {
  test("POST /api/pledges with XSS in description returns 400 or stores safely", async ({
    request,
  }) => {
    const response = await request.post("/api/pledges", {
      headers: { Origin: BASE_URL },
      multipart: {
        needId: "nonexistent",
        donorEmail: "test@example.com",
        description: '<script>alert("xss")</script>',
      },
    });
    // Should either reject or sanitize — not execute
    const status = response.status();
    expect([400, 403, 404]).toContain(status);
  });

  test("POST /api/pledges with extremely long description returns 400", async ({
    request,
  }) => {
    const response = await request.post("/api/pledges", {
      headers: { Origin: BASE_URL },
      multipart: {
        needId: "test",
        donorEmail: "test@example.com",
        description: "x".repeat(5000),
      },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain("2000");
  });

  test("POST /api/pledges with honeypot filled returns fake 201", async ({
    request,
  }) => {
    const response = await request.post("/api/pledges", {
      headers: { Origin: BASE_URL },
      multipart: {
        needId: "test",
        donorEmail: "test@example.com",
        description: "Test pledge",
        website: "http://spam.com",
      },
    });
    // Honeypot triggers fake success
    expect(response.status()).toBe(201);
    const body = await response.json();
    expect(body.id).toBe("ok");
  });

  test("POST /api/pledges with invalid email format returns 400", async ({
    request,
  }) => {
    const response = await request.post("/api/pledges", {
      headers: { Origin: BASE_URL },
      multipart: {
        needId: "test",
        donorEmail: "not-an-email",
        description: "Valid description text",
      },
    });
    expect(response.status()).toBe(400);
  });
});

test.describe("Security: Data Exposure", () => {
  test("GET /api/needs returns no PII", async ({ request }) => {
    const response = await request.get("/api/needs");
    expect(response.status()).toBe(200);

    const needs = await response.json();
    if (needs.length > 0) {
      const need = needs[0];
      // Should NOT contain these fields
      expect(need).not.toHaveProperty("orgId");
      expect(need).not.toHaveProperty("donorEmail");
      expect(need).not.toHaveProperty("shippingAddress");
      // Should contain only public fields
      expect(need).toHaveProperty("id");
      expect(need).toHaveProperty("title");
      expect(need).toHaveProperty("orgName");
    }
  });

  test("GET /api/health does not leak sensitive info", async ({ request }) => {
    const response = await request.get("/api/health");
    const body = await response.json();
    // Should not contain secrets, passwords, or internal paths
    expect(JSON.stringify(body)).not.toMatch(
      /password|secret|key|token|auth/i
    );
  });

  test("GET /.env returns 404", async ({ request }) => {
    const response = await request.get("/.env");
    expect([404, 403]).toContain(response.status());
  });

  test("Error responses do not leak stack traces", async ({ request }) => {
    // Hit a nonexistent API endpoint
    const response = await request.get("/api/nonexistent");
    const text = await response.text();
    expect(text).not.toContain("at ");
    expect(text).not.toContain("Error:");
    expect(text).not.toContain("node_modules");
  });
});

test.describe("Security: Open Redirect Prevention", () => {
  test("signin page with external callbackUrl does not render it visibly", async ({
    page,
  }) => {
    await page.goto("/auth/signin?callbackUrl=https://evil.com");
    const content = await page.textContent("body");
    expect(content).not.toContain("evil.com");
  });
});

test.describe("Security: Security Headers", () => {
  test("responses include security headers", async ({ request }) => {
    const response = await request.get("/about");
    const headers = response.headers();
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["referrer-policy"]).toBe(
      "strict-origin-when-cross-origin"
    );
  });
});
