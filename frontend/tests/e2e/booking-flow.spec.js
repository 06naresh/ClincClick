import { test, expect } from "@playwright/test";

test("customer can register, book, and see confirmation", async ({ page, request }) => {
  const email = `e2e_${Date.now()}@example.com`;

  await page.goto("/register");
  await page.getByLabel("Full name").fill("E2E Customer");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("Custpass1");
  await page.getByLabel("Confirm password").fill("Custpass1");
  await page.getByRole("button", { name: /create account/i }).click();

  await expect(page).toHaveURL(/\/login$/);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("Custpass1");
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/dashboard/book");

  // Pick a real slot from the backend so the form always has data.
  const availability = await request.get("http://localhost:8000/api/v1/availability?limit=200");
  const slots = await availability.json();
  const slot = (slots.data || []).find((s) => s.is_active && new Date(s.start_time) > new Date());
  if (!slot) {
    test.skip(true, "No future availability seeded");
    return;
  }

  await page.locator("select").first().selectOption(String(slot.service_id));
  await page.locator("select").nth(1).selectOption(String(slot.provider_id));

  const iso = new Date(slot.start_time).toISOString().slice(0, 10);
  await page.locator('input[type="date"]').fill(iso);

  const firstSlot = page.locator("button").filter({ hasText: /:/ }).first();
  await firstSlot.waitFor({ state: "visible", timeout: 15000 });
  await firstSlot.click();

  await page.getByRole("button", { name: /confirm booking/i }).click();
  await expect(page.getByRole("heading", { name: /appointment confirmed/i })).toBeVisible();
  await expect(page.getByText(/BK-\d{8}-/)).toBeVisible();
});

test("admin can log in and reach admin dashboard", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password", { exact: true }).fill("Admin12345");
  await page.getByRole("button", { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/admin\/dashboard$/);
  await expect(page.getByRole("heading", { name: /admin dashboard/i })).toBeVisible();
});
