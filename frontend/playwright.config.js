import { defineConfig } from '@playwright/test';

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,
  fullyParallel: false,
  reporter: process.env.CI ? [['dot'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL: 'http://127.0.0.1:5173', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  webServer: [
    { command: 'mvn spring-boot:run', cwd: '../backend', url: 'http://127.0.0.1:8080/api/exercises?page=0&size=1', timeout: 120_000, reuseExistingServer: !process.env.CI, env: { JWT_SECRET: 'e2e-only-secret-change-me-12345678901234567890' } },
    { command: `${npmCommand} run dev -- --host 127.0.0.1`, cwd: '.', url: 'http://127.0.0.1:5173', timeout: 120_000, reuseExistingServer: !process.env.CI }
  ]
});
