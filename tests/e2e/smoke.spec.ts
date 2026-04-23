import { expect, test } from "@playwright/test";

test("redirect from root to localized login page", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/(en|vi)\/login$/);
});
