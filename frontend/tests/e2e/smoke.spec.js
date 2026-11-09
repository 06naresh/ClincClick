import { test, expect } from "@playwright/test";

test("home page loads and shows services navigation", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/ClincClick/i);
  await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
});

test("health endpoint returns ok", async ({ request }) => {
  const res = await request.get("http://localhost:8000/api/v1/health");
  expect(res.ok()).toBeTruthy();
});
