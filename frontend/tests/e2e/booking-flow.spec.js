import { test, expect } from "@playwright/test";

test("customer can register, book, and see confirmation", async ({ page, request }) => {
  // Admin creates a fresh service/provider/slot with capacity.
  const adminLogin = await request.post("http://localhost:8000/api/v1/auth/login", {
    data: { email: "admin@example.com", password: "Admin12345" },
  });
  const adminToken = (await adminLogin.json()).data.access_token;
  const ah = { Authorization: `Bearer ${adminToken}` };

  const svc = (await (await request.post("http://localhost:8000/api/v1/services", { data: { name: `E2E Svc ${Date.now()}`, duration_minutes: 30, price: 50 }, headers: ah })).json()).data;
  const prov = (await (await request.post("http://localhost:8000/api/v1/providers", { data: { full_name: "E2E Doc" }, headers: ah })).json()).data;

  const future = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
  const day = future.toISOString().slice(0, 10);
  const slotRes = await request.post("http://localhost:8000/api/v1/availability", {
    data: {
      service_id: svc.id,
      provider_id: prov.id,
      start_time: `${day}T10:00:00Z`,
      end_time: `${day}T10:30:00Z`,
      capacity: 5,
    },
    headers: ah,
  });
  const slot = (await slotRes.json()).data;

  // Register + login customer via UI
  const email = `e2e_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;
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

  await page.locator("select").first().selectOption(String(slot.service_id));
  await page.locator("select").nth(1).selectOption(String(slot.provider_id));
  await page.locator('input[type="date"]').fill(day);

  const firstSlot = page.locator("button[data-slot-id]").first();
  await firstSlot.waitFor({ state: "visible", timeout: 15000 });
  await firstSlot.click();
  await page.waitForTimeout(500);

  await page.getByRole("button", { name: /confirm booking/i }).click();
  await page.waitForTimeout(1000);
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
