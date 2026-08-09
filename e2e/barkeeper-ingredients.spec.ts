import { test, expect, type Page } from '@playwright/test'

interface Ingredient {
  id: number
  name: string
  alcohol_percentage: number
  timestamp: string
}

// The mocked backend origin (127.0.0.1:5055) differs from the frontend dev
// server's (localhost:5173), same as in real dev/prod - so, same as the
// real backend's CORSMiddleware, every mocked response needs explicit CORS
// headers or the browser rejects it before the app ever sees it, and every
// non-GET/DELETE request needs its OPTIONS preflight answered too.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

async function mockIngredientsApi(page: Page, seed: Ingredient[]) {
  const ingredients = [...seed]
  let nextId = Math.max(0, ...ingredients.map((i) => i.id)) + 1

  await page.route('**/api/ingredients', async (route) => {
    const request = route.request()
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: CORS_HEADERS })
      return
    }
    if (request.method() === 'GET') {
      await route.fulfill({ json: ingredients, headers: CORS_HEADERS })
      return
    }
    if (request.method() === 'POST') {
      const body = request.postDataJSON() as { name: string; alcohol_percentage: number }
      const created: Ingredient = {
        id: nextId++,
        name: body.name,
        alcohol_percentage: body.alcohol_percentage,
        timestamp: new Date().toISOString(),
      }
      ingredients.push(created)
      await route.fulfill({ status: 201, json: created, headers: CORS_HEADERS })
      return
    }
    await route.continue()
  })

  await page.route('**/api/ingredients/*', async (route) => {
    const request = route.request()
    const id = Number(new URL(request.url()).pathname.split('/').pop())
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: CORS_HEADERS })
      return
    }
    if (request.method() === 'PUT') {
      const body = request.postDataJSON() as { name?: string; alcohol_percentage?: number }
      const ingredient = ingredients.find((i) => i.id === id)
      if (ingredient) Object.assign(ingredient, body)
      await route.fulfill({ json: ingredient, headers: CORS_HEADERS })
      return
    }
    if (request.method() === 'DELETE') {
      const index = ingredients.findIndex((i) => i.id === id)
      if (index >= 0) ingredients.splice(index, 1)
      await route.fulfill({ status: 204, headers: CORS_HEADERS })
      return
    }
    await route.continue()
  })
}

async function unlockToBarkeeper(page: Page) {
  await page.goto('/order')
  await page.getByRole('link', { name: 'Barkeeper' }).tap()
  for (const digit of '1234') {
    await page.getByRole('button', { name: digit, exact: true }).tap()
  }
  await expect(page).toHaveURL(/\/barkeeper$/)
}

test('lists ingredients from the backend', async ({ page }) => {
  await mockIngredientsApi(page, [
    { id: 1, name: 'Vodka', alcohol_percentage: 40, timestamp: '2026-01-01T00:00:00' },
    { id: 2, name: 'Orange juice', alcohol_percentage: 0, timestamp: '2026-01-01T00:00:00' },
  ])
  await unlockToBarkeeper(page)

  await expect(page.getByRole('cell', { name: 'Vodka', exact: true })).toBeVisible()
  await expect(page.getByRole('cell', { name: 'Orange juice', exact: true })).toBeVisible()
})

test('adds a new ingredient', async ({ page }) => {
  await mockIngredientsApi(page, [])
  await unlockToBarkeeper(page)

  await page.getByRole('button', { name: 'Add ingredient' }).tap()
  await page.getByPlaceholder('e.g. Vodka').tap()
  for (const ch of 'gin') {
    await page
      .locator('.hg-button', { hasText: new RegExp(`^${ch}$`) })
      .first()
      .tap()
  }
  await page.locator('button', { hasText: 'Done' }).tap()
  await page.locator('button', { hasText: /^Add$/ }).tap()

  await expect(page.getByRole('cell', { name: 'gin', exact: true })).toBeVisible()
  await expect(page.getByText('Added gin.')).toBeVisible()
})

test('deletes an ingredient after confirming', async ({ page }) => {
  await mockIngredientsApi(page, [
    { id: 1, name: 'Vodka', alcohol_percentage: 40, timestamp: '2026-01-01T00:00:00' },
  ])
  await unlockToBarkeeper(page)

  await page.getByRole('button', { name: 'Delete Vodka' }).tap()
  await page.getByRole('button', { name: 'Delete' }).tap()

  await expect(page.getByRole('cell', { name: 'Vodka', exact: true })).toBeHidden()
  await expect(page.getByText('No ingredients yet.')).toBeVisible()
})
