import { test, expect } from '@playwright/test'

test('redirects to the order page and renders the shell', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveURL(/\/order$/)
  await expect(page.getByRole('heading', { name: 'Order' })).toBeVisible()
  await expect(page.getByRole('navigation')).toBeVisible()
})

test('tapping a nav link navigates to that screen', async ({ page }) => {
  await page.goto('/order')
  await page.getByRole('link', { name: 'Barkeeper' }).tap()
  await expect(page).toHaveURL(/\/barkeeper$/)
  await expect(page.getByRole('heading', { name: 'Barkeeper' })).toBeVisible()
})
