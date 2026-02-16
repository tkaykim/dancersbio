import { defineConfig, devices } from '@playwright/test'

/**
 * E2E 테스트 설정.
 * .cursor/forplaywrighttest.mdc 계정 정보로 시나리오 테스트 실행.
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: 1,
    reporter: 'list',
    timeout: 120000,
    use: {
        baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
        trace: 'on-first-retry',
        video: 'on-first-retry',
    },
    projects: [
        { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    ],
    webServer: process.env.CI
        ? undefined
        : {
              command: 'npm run dev',
              url: 'http://localhost:3000',
              reuseExistingServer: !process.env.CI,
              timeout: 120_000,
          },
})
