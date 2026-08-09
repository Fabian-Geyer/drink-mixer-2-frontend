import { defineConfig, devices } from '@playwright/test'

// Kiosk target: Raspberry Pi 7" touchscreen, fixed 800x480. All visual QA -
// automated and manual/dev-loop screenshotting alike - happens at this
// viewport. See frontend/REQUIREMENTS.md.
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'kiosk-800x480',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 800, height: 480 },
        deviceScaleFactor: 1,
        hasTouch: true,
      },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
