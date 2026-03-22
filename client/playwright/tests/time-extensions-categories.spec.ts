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
    // Masters should be selected by default (active state)
    const categorySelector = page.getByTestId('category-selector');
    await expect(categorySelector).toBeVisible();

    // Verify the recommended time section shows Masters values
    const recommendedSection = page.getByTestId('recommended-extensions');
    await expect(recommendedSection).toBeVisible();
    await expect(recommendedSection.getByText(/masters/i)).toBeVisible();
  });

  test('should show different recommended extensions for Junior category', async ({ page }) => {
    const categorySelector = page.getByTestId('category-selector');
    await categorySelector.getByText(/junior/i).click();

    const recommendedSection = page.getByTestId('recommended-extensions');
    await expect(recommendedSection).toBeVisible();
    await expect(recommendedSection.getByText(/junior/i)).toBeVisible();
  });

  test('should show different recommended extensions for Senior category', async ({ page }) => {
    const categorySelector = page.getByTestId('category-selector');
    await categorySelector.getByText(/senior/i).click();

    const recommendedSection = page.getByTestId('recommended-extensions');
    await expect(recommendedSection).toBeVisible();
    await expect(recommendedSection.getByText(/senior/i)).toBeVisible();
  });

  test('should display recommended time values that differ per category', async ({ page }) => {
    const recommendedSection = page.getByTestId('recommended-extensions');

    // Check Masters (default)
    const mastersText = await recommendedSection.textContent();

    // Switch to Junior
    const categorySelector = page.getByTestId('category-selector');
    await categorySelector.getByText(/junior/i).click();

    const juniorText = await recommendedSection.textContent();

    // The recommended extensions should differ between categories
    expect(mastersText).not.toBe(juniorText);
  });

  test('should persist selected category in localStorage', async ({ page }) => {
    const categorySelector = page.getByTestId('category-selector');
    await categorySelector.getByText(/junior/i).click();

    // Reload and verify Junior is still selected
    await page.reload();

    const recommendedSection = page.getByTestId('recommended-extensions');
    await expect(recommendedSection.getByText(/junior/i)).toBeVisible();
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

  test('should display recommended extensions table with procedure descriptions', async ({ page }) => {
    const recommendedSection = page.getByTestId('recommended-extensions');
    await expect(recommendedSection).toBeVisible();

    // Should show a table with procedure/action descriptions and time values
    await expect(recommendedSection.locator('table')).toBeVisible();
  });
});
