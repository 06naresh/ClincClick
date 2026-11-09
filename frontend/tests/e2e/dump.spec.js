import { test } from "@playwright/test";

test("admin dashboard dump", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Email").fill("admin@example.com");
  await page.getByLabel("Password", { exact: true }).fill("Admin12345");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/admin\/dashboard$/);
  await page.waitForTimeout(2000);
  const text = await page.locator("main").last().innerText();
  console.log("DASHBOARD_TEXT:\n" + text);
});
