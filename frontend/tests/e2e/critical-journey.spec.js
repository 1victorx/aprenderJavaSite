import { test, expect } from '@playwright/test';

test('cadastro, login, catálogo, execução e logout', async ({ page }) => {
  const email = `e2e.${Date.now()}@example.local`;
  const password = 'JavaStudy123!';

  await page.goto('/#/register');
  await expect(page.getByRole('heading', { name: 'Comece sua jornada' })).toBeVisible();
  await page.getByLabel('Nome').fill('Usuário E2E');
  await page.getByLabel('Email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByLabel('Confirmar senha').fill(password);
  await page.getByRole('button', { name: 'Cadastrar' }).click();
  await expect(page).toHaveURL(/#\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  await page.getByRole('link', { name: 'Exercícios' }).first().click();
  await expect(page).toHaveURL(/#\/exercises$/);
  await expect(page.locator('.exercise-item').first()).toBeVisible();
  await page.getByRole('link', { name: /Fazer|Refazer/ }).first().click();
  await expect(page.locator('#run-btn')).toBeEnabled();
  await page.locator('#run-btn').click();
  await expect(page.locator('#result-header')).toContainText(/testes|executar/i, { timeout: 30_000 });

  await page.locator('#user-menu-btn').click();
  await page.getByRole('menuitem', { name: 'Sair' }).click();
  await expect(page).toHaveURL(/#\/login/);
  await expect(page.getByRole('heading', { name: 'Bem-vindo de volta' })).toBeVisible();

  await page.getByLabel('Email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/#\/dashboard/);
});
