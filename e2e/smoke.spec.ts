import { test, expect } from '@playwright/test'

test('redirects to the order page and renders the shell', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/order$/)
  await expect(page.getByRole('heading', { name: 'Order' })).toBeVisible()
})
