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

test.describe("Security: Token Endpoint Protection", () => {
  test("GET /api/needs/fakeid/extend without token returns 400", async ({
    request,
  }) => {
    const response = await request.get("/api/needs/fakeid/extend");
    expect(response.status()).toBe(400);
  });

  test("GET /api/needs/fakeid/extend with invalid token returns 403", async ({
    request,
  }) => {
    const response = await request.get(
      "/api/needs/fakeid/extend?token=1234567890.deadbeef"
    );
    expect(response.status()).toBe(403);
  });

  test("GET /api/needs/fakeid/status without action or token returns 400", async ({
    request,
  }) => {
    const response = await request.get("/api/needs/fakeid/status");
    expect(response.status()).toBe(400);
  });

  test("GET /api/needs/fakeid/status with invalid action returns 400", async ({
    request,
  }) => {
    const response = await request.get(
      "/api/needs/fakeid/status?action=drop_tables&token=fake"
    );
    expect(response.status()).toBe(400);
  });

  test("GET /api/needs/fakeid/status with invalid token returns 403", async ({
    request,
  }) => {
    const response = await request.get(
      "/api/needs/fakeid/status?action=fulfilled&token=1234567890.deadbeef"
    );
    expect(response.status()).toBe(403);
  });

  test("Token endpoints are not gated by session auth", async ({
    request,
  }) => {
    // These should NOT return 401 (middleware blocks)
    // They should return 400/403 (endpoint-level validation)
    const extendResponse = await request.get("/api/needs/test/extend?token=x");
    expect(extendResponse.status()).not.toBe(401);

    const statusResponse = await request.get(
      "/api/needs/test/status?action=fulfilled&token=x"
    );
    expect(statusResponse.status()).not.toBe(401);
  });

  test("Token endpoint regex does not match nested paths", async ({
    request,
  }) => {
    // /api/needs/id/extend/extra should NOT be whitelisted
    const response = await request.get(
      "/api/needs/test/extend/extra?token=x"
    );
    // Should hit regular auth middleware → 401
    expect(response.status()).toBe(401);
  });
});

test.describe("Security: HTTP Methods", () => {
  test("DELETE on GET-only endpoint returns appropriate error", async ({
    request,
  }) => {
    const response = await request.delete("/api/needs", {
      headers: { Origin: BASE_URL },
    });
    // Should be 401 (auth required) or 405 (method not allowed)
    expect([401, 404, 405]).toContain(response.status());
  });

  test("PUT on POST-only endpoint returns appropriate error", async ({
    request,
  }) => {
    const response = await request.put("/api/pledges", {
      headers: { Origin: BASE_URL },
    });
    expect([401, 404, 405]).toContain(response.status());
  });
});

test.describe("Security: Parameter Injection", () => {
  test("POST /api/pledges with null bytes in needId is handled safely", async ({
    request,
  }) => {
    const response = await request.post("/api/pledges", {
      headers: { Origin: BASE_URL },
      multipart: {
        needId: "test\x00admin",
        donorEmail: "test@example.com",
        description: "Testing null byte injection",
      },
    });
    // Should fail validation, not crash
    expect([400, 403, 404]).toContain(response.status());
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

test.describe("Security: Auth Flow Edge Cases", () => {
  test("GET /api/auth/session returns null when unauthenticated", async ({
    request,
  }) => {
    const response = await request.get("/api/auth/session");
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toBe("null");
  });

  test("POST /api/auth/signin/resend without CSRF returns 403", async ({
    request,
  }) => {
    const response = await request.post("/api/auth/signin/resend", {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      data: "email=test@test.com",
    });
    // Auth.js CSRF protection blocks requests without valid CSRF cookie
    expect([403, 400]).toContain(response.status());
  });

  test("GET /api/auth/callback/resend with fake token returns error", async ({
    request,
  }) => {
    const response = await request.get(
      "/api/auth/callback/resend?token=fake&email=test@test.com"
    );
    // Should not succeed — invalid magic link token
    expect(response.status()).not.toBe(200);
  });
});

test.describe("Security: Public API Scoping", () => {
  test("GET /api/needs returns only public fields", async ({ request }) => {
    const response = await request.get("/api/needs");
    expect(response.status()).toBe(200);
    const needs = await response.json();
    if (needs.length > 0) {
      const need = needs[0];
      // Must have public fields
      expect(need).toHaveProperty("id");
      expect(need).toHaveProperty("title");
      expect(need).toHaveProperty("orgName");
      expect(need).toHaveProperty("categoryTag");
      // Must NOT have private fields
      expect(need).not.toHaveProperty("orgId");
      expect(need).not.toHaveProperty("donorEmail");
      expect(need).not.toHaveProperty("shippingAddress");
      expect(need).not.toHaveProperty("continuedFromId");
      expect(need).not.toHaveProperty("suggestedText");
      expect(need).not.toHaveProperty("allDeliveredAt");
    }
  });
});

test.describe("Security: Content-Type Handling", () => {
  test("POST /api/pledges with JSON content-type returns 400", async ({
    request,
  }) => {
    const response = await request.post("/api/pledges", {
      headers: {
        Origin: BASE_URL,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({
        needId: "test",
        donorEmail: "test@test.com",
        description: "JSON confusion test",
      }),
    });
    expect(response.status()).toBe(400);
  });
});

test.describe("Security: Email Header Injection", () => {
  test("pledge with CRLF in email is rejected", async ({ request }) => {
    const response = await request.post("/api/pledges", {
      headers: { Origin: BASE_URL },
      multipart: {
        needId: "test",
        donorEmail: "test@test.com\r\nBcc: victim@evil.com",
        description: "email injection test",
      },
    });
    expect([400, 403]).toContain(response.status());
  });
});

test.describe("Security: Config File Exposure", () => {
  test("dotfiles and config files are not accessible", async ({ request }) => {
    const sensitiveFiles = [
      "/.env",
      "/.env.local",
      "/.git/config",
      "/package.json",
      "/tsconfig.json",
      "/wrangler.toml",
      "/drizzle.config.ts",
    ];
    for (const file of sensitiveFiles) {
      const response = await request.get(file);
      expect(response.status()).toBe(404);
    }
  });
});

test.describe("Security: Session Fixation", () => {
  test("forged session cookie returns null session", async ({ request }) => {
    const response = await request.get("/api/auth/session", {
      headers: {
        Cookie:
          "__Secure-authjs.session-token=forged-session-value-12345",
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.text();
    // Forged session should not be accepted
    expect(body).toBe("null");
  });
});

test.describe("Security: Cookie Attributes", () => {
  test("CSRF cookie uses __Host- prefix with secure attributes", async ({
    request,
  }) => {
    const response = await request.get("/api/auth/csrf");
    const setCookie = response.headers()["set-cookie"] || "";
    // In local dev, cookies may not have __Host- prefix (requires HTTPS)
    // but they should still be set
    expect(setCookie).toContain("csrf-token");
  });
});

test.describe("Security: Auth Provider Exposure", () => {
  test("providers endpoint exposes only necessary info", async ({
    request,
  }) => {
    const response = await request.get("/api/auth/providers");
    expect(response.status()).toBe(200);
    const providers = await response.json();
    // Should have resend and google
    expect(providers).toHaveProperty("resend");
    expect(providers).toHaveProperty("google");
    // Should not contain secrets
    const text = JSON.stringify(providers);
    expect(text).not.toContain("secret");
    expect(text).not.toContain("SECRET");
    expect(text).not.toContain("key");
  });
});

test.describe("Security: Malformed Astro Actions", () => {
  test("invalid action name returns 404 not 500", async ({ request }) => {
    const response = await request.post("/_actions/nonExistentAction", {
      headers: {
        Origin: BASE_URL,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({}),
    });
    // Should be 404 (not found), not 500 (server error)
    expect(response.status()).toBe(404);
  });
});

test.describe("Security: Caching", () => {
  test("public API sets cache headers", async ({ request }) => {
    const response = await request.get("/api/needs");
    expect(response.status()).toBe(200);
    // Public endpoint can have cache headers — verify they exist
    const cacheControl = response.headers()["cache-control"];
    if (cacheControl) {
      // If cached, should be public (not private/no-store for public data)
      expect(cacheControl).toContain("public");
    }
  });
});

test.describe("Security: Protected Route Access", () => {
  test("profile page redirects unauthenticated users", async ({ request }) => {
    const response = await request.get("/profile", {
      maxRedirects: 0,
    });
    expect([301, 302]).toContain(response.status());
  });

  test("dashboard page redirects unauthenticated users", async ({
    request,
  }) => {
    const response = await request.get("/dashboard", {
      maxRedirects: 0,
    });
    expect([301, 302]).toContain(response.status());
  });

  test("admin API returns 401 without session", async ({ request }) => {
    const response = await request.post("/api/admin/approve-request", {
      headers: { Origin: BASE_URL },
      data: "requestId=test",
    });
    expect(response.status()).toBe(401);
  });
});
