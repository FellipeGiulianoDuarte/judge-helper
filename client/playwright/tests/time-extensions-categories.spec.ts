import { test, expect } from '@playwright/test';

test.describe('Time Extensions - Category Division', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/time-extensions');
    await page.evaluate(() => {
      localStorage.removeItem('timeExtensions');
      localStorage.removeItem('timeExtensionCategory');
    });
    await page.reload();
  });

  test('should display category selector with Junior, Senior, and Masters options', async ({ page }) => {
    const categorySelector = page.getByTestId('category-selector');
    await expect(categorySelector).toBeVisible();

    await expect(categorySelector.getByText(/junior/i)).toBeVisible();
    await expect(categorySelector.getByText(/senior/i)).toBeVisible();
    await expect(categorySelector.getByText(/masters/i)).toBeVisible();
  });

  test('should default to Masters category', async ({ page }) => {
    const categorySelector = page.getByTestId('category-selector');
    await expect(categorySelector).toBeVisible();

    // Check that Masters is the active segment
    const mastersLabel = categorySelector.getByText(/masters/i);
    await expect(mastersLabel).toBeVisible();
  });

  test('should allow switching between categories', async ({ page }) => {
    const categorySelector = page.getByTestId('category-selector');
    await categorySelector.getByText(/junior/i).click();
    await categorySelector.getByText(/senior/i).click();
    await categorySelector.getByText(/masters/i).click();
  });

  test('should persist selected category in localStorage', async ({ page }) => {
    const categorySelector = page.getByTestId('category-selector');
    await categorySelector.getByText(/junior/i).click();

    // Reload and verify Junior is still selected
    await page.reload();

    const saved = await page.evaluate(() => localStorage.getItem('timeExtensionCategory'));
    expect(saved).toBe('junior');
  });

  test('should still allow adding time extensions with category selected', async ({ page }) => {
    // Select Junior category
    const categorySelector = page.getByTestId('category-selector');
    await categorySelector.getByText(/junior/i).click();

    // Add extension
    await page.getByPlaceholder(/round|rodada|ronda/i).fill('1');
    await page.getByPlaceholder(/table|mesa/i).fill('5');
    await page.getByPlaceholder(/minutes|minutos/i).fill('3');
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();

    // Extension should appear in the list
    await expect(page.getByRole('cell', { name: '5' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '3', exact: true })).toBeVisible();
  });
});
