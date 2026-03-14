import type { Page } from "@playwright/test";

/**
 * Set the Auth.js session cookie so the page is authenticated as the given user.
 * Call this BEFORE navigating to the page under test.
 *
 * @param page — Playwright Page
 * @param sessionToken — value from `scripts/create-test-users.ts` output
 */
export async function loginAs(page: Page, sessionToken: string) {
  await page.context().addCookies([
    {
      name: "authjs.session-token",
      value: sessionToken,
      domain: "localhost",
      path: "/",
    },
  ]);
}
