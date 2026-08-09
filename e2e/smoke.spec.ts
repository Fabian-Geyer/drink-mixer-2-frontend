import { test, expect } from '@playwright/test'

test('redirects to the order page and renders the shell', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/order$/)
  await expect(page.getByRole('heading', { name: 'Order' })).toBeVisible()
  await expect(page.getByRole('navigation')).toBeVisible()
})

test('tapping a nav link navigates to that screen', async ({ page }) => {
  // Status, not Barkeeper: Barkeeper is PIN-gated (see pin-gate.spec.ts) -
  // this test is only about the nav bar itself.
  await page.goto('/order')
  await page.getByRole('link', { name: 'Status' }).tap()
  await expect(page).toHaveURL(/\/status$/)
  await expect(page.getByRole('heading', { name: 'Status' })).toBeVisible()
})
