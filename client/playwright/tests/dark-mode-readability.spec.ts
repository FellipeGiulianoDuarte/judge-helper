import { test, expect } from '@playwright/test';

const COLOR_WHITE = 'rgb(255, 255, 255)';

async function toggleToDarkTheme(page: import('@playwright/test').Page) {
  const toggleButton = page.getByRole('button', { name: /toggle theme/i });
  await toggleButton.click();
  await expect.poll(async () => page.evaluate(() => document.documentElement.getAttribute('data-mantine-color-scheme'))).toBe('dark');
}

async function expectColor(locator: import('@playwright/test').Locator, color: string) {
  await expect.poll(async () => locator.evaluate((node) => getComputedStyle(node).color)).toBe(color);
}

test.describe('Dark mode readability', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
  });

  test('Table Judge counters remain legible in dark theme', async ({ page }) => {
    await toggleToDarkTheme(page);
    await page.getByRole('tab', { name: /table judge/i }).click();

    const actionTotalLabel = page.getByTestId('action-total-label');
    const actionTotalValue = page.getByTestId('action-total-value');

    await expect(actionTotalLabel).toBeVisible();
    await expect(actionTotalValue).toBeVisible();

    await expectColor(actionTotalLabel, COLOR_WHITE);
    await expectColor(actionTotalValue, COLOR_WHITE);
  });

  test('Documents links remain legible in dark theme', async ({ page }) => {
    await toggleToDarkTheme(page);
    await page.getByRole('tab', { name: /documents/i }).click();

  const firstDocument = page.getByTestId('document-card').first();
    await expect(firstDocument).toBeVisible();
  const documentText = firstDocument.getByTestId('document-card-text');
    await expectColor(documentText, COLOR_WHITE);
  });

  test('Deck Check total remains legible in dark theme', async ({ page }) => {
    await toggleToDarkTheme(page);
    await page.getByRole('tab', { name: /deck check/i }).click();

    const totalLabel = page.getByTestId('deck-total-label');
    const totalValue = page.getByTestId('deck-total-value');

    await expect(totalLabel).toBeVisible();
    await expect(totalValue).toBeVisible();

    await expectColor(totalLabel, COLOR_WHITE);
    await expectColor(totalValue, COLOR_WHITE);
  });
});