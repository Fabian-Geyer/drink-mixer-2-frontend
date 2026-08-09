import { test, expect } from '@playwright/test'

async function pressPin(page: import('@playwright/test').Page, digits: string) {
  for (const digit of digits) {
    await page.getByRole('button', { name: digit, exact: true }).tap()
  }
}

test('visiting a locked route opens the PIN dialog without navigating away', async ({ page }) => {
  await page.goto('/order')
  await page.getByRole('link', { name: 'Barkeeper' }).tap()

  await expect(page.getByRole('dialog', { name: 'Enter PIN' })).toBeVisible()
  await expect(page).toHaveURL(/\/order$/)
})

test('wrong PIN shows an error and does not unlock', async ({ page }) => {
  await page.goto('/order')
  await page.getByRole('link', { name: 'Barkeeper' }).tap()

  await pressPin(page, '9999')

  await expect(page.getByText('Incorrect PIN - try again')).toBeVisible()
  await expect(page).toHaveURL(/\/order$/)
})

test('correct PIN unlocks and completes the navigation', async ({ page }) => {
  await page.goto('/order')
  await page.getByRole('link', { name: 'Barkeeper' }).tap()

  await pressPin(page, '1234')

  await expect(page).toHaveURL(/\/barkeeper$/)
  await expect(page.getByRole('dialog', { name: 'Enter PIN' })).toBeHidden()
})

test('once unlocked, Settings does not prompt again', async ({ page }) => {
  await page.goto('/order')
  await page.getByRole('link', { name: 'Barkeeper' }).tap()
  await pressPin(page, '1234')
  await expect(page).toHaveURL(/\/barkeeper$/)

  await page.getByRole('link', { name: 'Settings' }).tap()

  await expect(page).toHaveURL(/\/settings$/)
  await expect(page.getByRole('dialog', { name: 'Enter PIN' })).toBeHidden()
})
