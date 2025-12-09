import { test, expect } from '@playwright/test';

const COLOR_SCHEME_KEY = 'color-scheme';

const getColorScheme = async (page: import('@playwright/test').Page) => {
  return page.evaluate(() => document.documentElement.getAttribute('data-mantine-color-scheme'));
};

test.describe('Theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.evaluate((key) => localStorage.removeItem(key), COLOR_SCHEME_KEY);
    await page.reload();
    await page.getByRole('tab', { name: /deck check/i }).click();
  });

  test('toggle button should sit to the left of language switcher and align to left', async ({ page }) => {
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    await expect(themeToggle).toBeVisible();

  const languageSelect = page.getByLabel(/language/i).first();

    const toggleBox = await themeToggle.boundingBox();
    const selectBox = await languageSelect.boundingBox();

    expect(toggleBox && selectBox).toBeTruthy();
    expect(toggleBox!.x).toBeLessThan(selectBox!.x);

    const parentJustify = await themeToggle.evaluate((node) => {
      const parent = node.parentElement;
      return parent ? getComputedStyle(parent).justifyContent : null;
    });

    expect(parentJustify).toBe('flex-start');
  });

  test('should toggle between light and dark and persist selection', async ({ page }) => {
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    await expect(themeToggle).toBeVisible();

    await expect.poll(async () => await getColorScheme(page)).toBe('light');

    await themeToggle.click();
    await expect.poll(async () => await getColorScheme(page)).toBe('dark');

    const storedAfterToggle = await page.evaluate((key) => localStorage.getItem(key), COLOR_SCHEME_KEY);
    expect(storedAfterToggle).toBe('dark');

    await page.reload();
    await page.getByRole('tab', { name: /deck check/i }).click();

    await expect.poll(async () => await getColorScheme(page)).toBe('dark');

    const storedAfterReload = await page.evaluate((key) => localStorage.getItem(key), COLOR_SCHEME_KEY);
    expect(storedAfterReload).toBe('dark');
  });
});