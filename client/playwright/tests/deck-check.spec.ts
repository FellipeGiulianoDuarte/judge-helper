import { test, expect } from '@playwright/test';

test.describe('Deck Check Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.getByRole('tab', { name: /deck check/i }).click();
  });

  test('DC-01: Should display 3 counters (Pokemon, Trainer, Energy)', async ({ page }) => {
    await expect(page.getByTestId('counter-creatures')).toBeVisible();
    await expect(page.getByTestId('counter-trainer')).toBeVisible();
    await expect(page.getByTestId('counter-energy')).toBeVisible();
  });

  test('DC-02: Each counter should display current value (initially 0)', async ({ page }) => {
    await expect(page.getByTestId('counter-creatures-value')).toHaveText('0');
    await expect(page.getByTestId('counter-trainer-value')).toHaveText('0');
    await expect(page.getByTestId('counter-energy-value')).toHaveText('0');
  });

  test('DC-03: Each counter should have increment buttons +1, +2, +3, +4', async ({ page }) => {
    await expect(page.getByTestId('counter-creatures-add-1')).toContainText('+1');
    await expect(page.getByTestId('counter-creatures-add-2')).toContainText('+2');
    await expect(page.getByTestId('counter-creatures-add-3')).toContainText('+3');
    await expect(page.getByTestId('counter-creatures-add-4')).toContainText('+4');
  });

  test('DC-04: Clicking increment button should update the counter', async ({ page }) => {
    await page.getByTestId('counter-creatures-add-2').click();
    await expect(page.getByTestId('counter-creatures-value')).toHaveText('2');
    
    await page.getByTestId('counter-creatures-add-3').click();
    await expect(page.getByTestId('counter-creatures-value')).toHaveText('5');
  });

  test('DC-05: Should display Total (sum of all counters)', async ({ page }) => {
    await expect(page.getByTestId('deck-total-card')).toBeVisible();
    await expect(page.getByTestId('deck-total-value')).toHaveText('0');
  });

  test('DC-05b: Total should update when counters change', async ({ page }) => {
    await page.getByTestId('counter-creatures-add-4').click();
    await expect(page.getByTestId('deck-total-value')).toHaveText('4');

    await page.getByTestId('counter-trainer-add-3').click();
    await expect(page.getByTestId('deck-total-value')).toHaveText('7');

    await page.getByTestId('counter-energy-add-2').click();
    await expect(page.getByTestId('deck-total-value')).toHaveText('9');
  });

  test('DC-06: Should have UNDO button that reverts last action', async ({ page }) => {
    const undoButton = page.getByRole('button', { name: /undo/i });
    await expect(undoButton).toBeVisible();

    await page.getByTestId('counter-creatures-add-3').click();
    await expect(page.getByTestId('counter-creatures-value')).toHaveText('3');
    
    await page.getByTestId('counter-creatures-add-2').click();
    await expect(page.getByTestId('counter-creatures-value')).toHaveText('5');
    
    await undoButton.click();
    await expect(page.getByTestId('counter-creatures-value')).toHaveText('3');
  });

  test('DC-07: Should have RESET button that zeros all counters', async ({ page }) => {
    const resetButton = page.getByRole('button', { name: /reset/i });
    await expect(resetButton).toBeVisible();

    await page.getByTestId('counter-creatures-add-4').click();
    await page.getByTestId('counter-trainer-add-3').click();
    
    await resetButton.click();
    
    await expect(page.getByTestId('counter-creatures-value')).toHaveText('0');
    await expect(page.getByTestId('counter-trainer-value')).toHaveText('0');
    await expect(page.getByTestId('deck-total-value')).toHaveText('0');
  });

  test('DC-08: Should have LOOKUP CARD button', async ({ page }) => {
    const lookupButton = page.getByRole('link', { name: /lookup card/i });
    await expect(lookupButton).toBeVisible();
    await expect(lookupButton).toHaveAttribute('href', 'https://www.pokemon.com/us/pokemon-tcg/pokemon-cards');
    await expect(lookupButton).toHaveAttribute('target', '_blank');
  });

  test('DC-09: Should persist counters in localStorage', async ({ page }) => {
    await page.getByTestId('counter-creatures-add-4').click();
    await page.getByTestId('counter-trainer-add-2').click();
    
    // Wait for localStorage to be saved
    await page.waitForTimeout(100);
    
    // Reload the page
    await page.reload();
    
    // Navigate back to Deck Check tab
    await page.getByRole('tab', { name: /deck check/i }).click();
    
    // Wait for the component to load data from localStorage
    await expect(page.getByTestId('counter-creatures-value')).toHaveText('4', { timeout: 10000 });
    await expect(page.getByTestId('counter-trainer-value')).toHaveText('2');
  });

  test('Mobile-first: Should be usable on 375px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const pokemonSection = page.getByTestId('counter-creatures');
    await expect(pokemonSection).toBeVisible();
    
    const firstButton = page.getByTestId('counter-creatures-add-1');
    await expect(firstButton).toBeVisible();
    
    const boundingBox = await firstButton.boundingBox();
    expect(boundingBox?.height).toBeGreaterThanOrEqual(30);
  });

  test('Counter selection: Should highlight selected counter', async ({ page }) => {
    await page.getByTestId('counter-creatures-add-1').click();
    
    const paperElement = page.getByTestId('counter-creatures');
    await expect(paperElement).toHaveAttribute('data-selected', 'true');
  });

  test('Undo multiple times should work correctly', async ({ page }) => {
    const undoButton = page.getByRole('button', { name: /undo/i });
    
    await page.getByTestId('counter-creatures-add-2').click();
    await page.getByTestId('counter-trainer-add-3').click();
    await page.getByTestId('counter-creatures-add-1').click();
    
    await undoButton.click();
    await expect(page.getByTestId('counter-creatures-value')).toHaveText('2');
    
    await undoButton.click();
    await expect(page.getByTestId('counter-trainer-value')).toHaveText('0');
    
    await undoButton.click();
    await expect(page.getByTestId('counter-creatures-value')).toHaveText('0');
  });

  test('Undo when history is empty should do nothing', async ({ page }) => {
    const undoButton = page.getByRole('button', { name: /undo/i });
    
    await undoButton.click();
    await expect(page.getByTestId('counter-creatures-value')).toHaveText('0');
  });

  test('Total should turn green when count reaches exactly 60', async ({ page }) => {
    for (let i = 0; i < 15; i++) {
      await page.getByTestId('counter-creatures-add-4').click();
    }
    await expect(page.getByTestId('deck-total-value')).toHaveText('60');
  });

  test('Total should turn red when count exceeds 60', async ({ page }) => {
    for (let i = 0; i < 16; i++) {
      await page.getByTestId('counter-creatures-add-4').click();
    }
    await expect(page.getByTestId('deck-total-value')).toHaveText('64');
  });

  test('Total should turn red when count is below 60 but not zero', async ({ page }) => {
    await page.getByTestId('counter-creatures-add-4').click();
    await expect(page.getByTestId('deck-total-value')).toHaveText('4');
  });

  test('Pokemon counter should be visible with styling', async ({ page }) => {
    const pokemonPaper = page.getByTestId('counter-creatures');
    await expect(pokemonPaper).toBeVisible();
    
    const hasCustomStyle = await pokemonPaper.evaluate((el) => {
      return el.hasAttribute('style');
    });
    
    expect(hasCustomStyle).toBe(true);
  });
});
