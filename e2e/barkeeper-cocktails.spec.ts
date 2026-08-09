import { test, expect, type Page } from '@playwright/test'

interface Ingredient {
  id: number
  name: string
  alcohol_percentage: number
  timestamp: string
}

interface CocktailIngredientInput {
  ingredient_id: number
  amount: number
}

interface Cocktail {
  id: number
  name: string
  timestamp: string
  ingredients: {
    id: number
    name: string
    alcohol_percentage: number
    amount: number
    amount_percentage: number
  }[]
}

// See barkeeper-ingredients.spec.ts for why these headers/OPTIONS handling
// are needed: the mocked backend origin differs from the frontend's, same
// as real dev/prod, so responses need explicit CORS headers.
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function toRead(ingredients: Ingredient[], links: CocktailIngredientInput[]) {
  const total = links.reduce((sum, link) => sum + link.amount, 0)
  return links.map((link) => {
    const ingredient = ingredients.find((i) => i.id === link.ingredient_id)!
    return {
      id: ingredient.id,
      name: ingredient.name,
      alcohol_percentage: ingredient.alcohol_percentage,
      amount: link.amount,
      amount_percentage: Math.round((100 * link.amount) / total),
    }
  })
}

async function mockBarkeeperApi(page: Page, ingredients: Ingredient[], seedCocktails: Cocktail[]) {
  const cocktails = [...seedCocktails]
  let nextId = Math.max(0, ...cocktails.map((c) => c.id)) + 1

  await page.route('**/api/ingredients', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: CORS_HEADERS })
      return
    }
    await route.fulfill({ json: ingredients, headers: CORS_HEADERS })
  })

  await page.route('**/api/cocktails', async (route) => {
    const request = route.request()
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: CORS_HEADERS })
      return
    }
    if (request.method() === 'GET') {
      await route.fulfill({ json: cocktails, headers: CORS_HEADERS })
      return
    }
    if (request.method() === 'POST') {
      const body = request.postDataJSON() as {
        name: string
        ingredients: CocktailIngredientInput[]
      }
      const created: Cocktail = {
        id: nextId++,
        name: body.name,
        timestamp: new Date().toISOString(),
        ingredients: toRead(ingredients, body.ingredients),
      }
      cocktails.push(created)
      await route.fulfill({ status: 201, json: created, headers: CORS_HEADERS })
      return
    }
    await route.continue()
  })

  await page.route('**/api/cocktails/*', async (route) => {
    const request = route.request()
    const id = Number(new URL(request.url()).pathname.split('/').pop())
    if (request.method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: CORS_HEADERS })
      return
    }
    if (request.method() === 'DELETE') {
      const index = cocktails.findIndex((c) => c.id === id)
      if (index >= 0) cocktails.splice(index, 1)
      await route.fulfill({ status: 204, headers: CORS_HEADERS })
      return
    }
    await route.continue()
  })
}

async function unlockToCocktailsTab(page: Page) {
  await page.goto('/order')
  await page.getByRole('link', { name: 'Barkeeper' }).tap()
  for (const digit of '1234') {
    await page.getByRole('button', { name: digit, exact: true }).tap()
  }
  await expect(page).toHaveURL(/\/barkeeper$/)
  await page.getByRole('tab', { name: 'Cocktails' }).tap()
}

const VODKA: Ingredient = {
  id: 1,
  name: 'Vodka',
  alcohol_percentage: 40,
  timestamp: '2026-01-01T00:00:00',
}
const ORANGE: Ingredient = {
  id: 2,
  name: 'Orange juice',
  alcohol_percentage: 0,
  timestamp: '2026-01-01T00:00:00',
}

test('lists cocktails with ingredient percentages', async ({ page }) => {
  const screwdriver: Cocktail = {
    id: 1,
    name: 'Screwdriver',
    timestamp: '2026-01-01T00:00:00',
    ingredients: toRead(
      [VODKA, ORANGE],
      [
        { ingredient_id: VODKA.id, amount: 1 },
        { ingredient_id: ORANGE.id, amount: 2 },
      ],
    ),
  }
  await mockBarkeeperApi(page, [VODKA, ORANGE], [screwdriver])
  await unlockToCocktailsTab(page)

  await expect(page.getByText('Screwdriver')).toBeVisible()
  await expect(page.getByText('Vodka 33% · Orange juice 67%')).toBeVisible()
})

test('adds a new cocktail', async ({ page }) => {
  await mockBarkeeperApi(page, [VODKA, ORANGE], [])
  await unlockToCocktailsTab(page)

  await page.getByRole('button', { name: 'Add cocktail' }).tap()
  await page.getByPlaceholder('e.g. Screwdriver').tap()
  for (const ch of 'fizz') {
    await page
      .locator('.hg-button', { hasText: new RegExp(`^${ch}$`) })
      .first()
      .tap()
  }
  await page.locator('button', { hasText: 'Done' }).tap()

  await page.getByRole('combobox').first().click()
  await page.getByRole('option', { name: 'Vodka' }).click()

  await page.locator('button', { hasText: /^Add$/ }).click()

  await expect(page.getByText('fizz', { exact: true })).toBeVisible()
  await expect(page.getByText('Added fizz.')).toBeVisible()
})

test('deletes a cocktail after confirming', async ({ page }) => {
  const screwdriver: Cocktail = {
    id: 1,
    name: 'Screwdriver',
    timestamp: '2026-01-01T00:00:00',
    ingredients: toRead([VODKA, ORANGE], [{ ingredient_id: VODKA.id, amount: 1 }]),
  }
  await mockBarkeeperApi(page, [VODKA, ORANGE], [screwdriver])
  await unlockToCocktailsTab(page)

  await page.getByRole('button', { name: 'Delete Screwdriver' }).tap()
  await page.getByRole('button', { name: 'Delete' }).tap()

  await expect(page.getByText('Screwdriver')).toBeHidden()
  await expect(page.getByText('No cocktails yet.')).toBeVisible()
})
