import { expect, test } from '@playwright/test'

test('page loads', async ({ page }) => {
  await page.goto('/')

  // Expect h1 to contain a substring.
  await expect(page.locator('img')).toBeVisible()
})
