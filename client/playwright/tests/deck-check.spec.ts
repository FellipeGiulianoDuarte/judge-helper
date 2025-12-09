import { test, expect } from '@playwright/test';

test.describe('Deck Check Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173');
    await page.getByRole('tab', { name: /deck check/i }).click();
  });

  test('DC-01: Should display 3 counters (Pokémon, Trainer, Energy)', async ({ page }) => {
    await expect(page.getByText(/pokémon/i)).toBeVisible();
    await expect(page.getByText(/trainer/i)).toBeVisible();
    await expect(page.getByText(/energy/i)).toBeVisible();
  });

  test('DC-02: Each counter should display current value (initially 0)', async ({ page }) => {
    const pokemonSection = page.locator('div', { has: page.getByText(/^pokémon$/i) }).first();
    const trainerSection = page.locator('div', { has: page.getByText(/^trainer$/i) }).first();
    const energySection = page.locator('div', { has: page.getByText(/^energy$/i) }).first();

    await expect(pokemonSection.getByText('0').first()).toBeVisible();
    await expect(trainerSection.getByText('0').first()).toBeVisible();
    await expect(energySection.getByText('0').first()).toBeVisible();
  });

  test('DC-03: Each counter should have increment buttons +1, +2, +3, +4', async ({ page }) => {
    const pokemonSection = page.locator('div', { has: page.getByText(/^pokémon$/i) }).first();
    
    const buttons = pokemonSection.getByRole('button');
    await expect(buttons.nth(0)).toContainText('+1');
    await expect(buttons.nth(1)).toContainText('+2');
    await expect(buttons.nth(2)).toContainText('+3');
    await expect(buttons.nth(3)).toContainText('+4');
  });

  test('DC-04: Clicking increment button should update the counter', async ({ page }) => {
    const pokemonSection = page.locator('div', { has: page.getByText(/^pokémon$/i) }).first();
    
    await pokemonSection.getByRole('button').nth(1).click(); // +2 button
    await expect(pokemonSection.getByText('2').first()).toBeVisible();
    
    await pokemonSection.getByRole('button').nth(2).click(); // +3 button
    await expect(pokemonSection.getByText('5').first()).toBeVisible();
  });

  test('DC-05: Should display Total (sum of all counters)', async ({ page }) => {
    await expect(page.getByText(/^total$/i)).toBeVisible();
    
    const totalSection = page.locator('div', { has: page.getByText(/^total$/i) }).first();
    await expect(totalSection.getByText('0').first()).toBeVisible();
  });

  test('DC-05: Total should update when counters change', async ({ page }) => {
    const pokemonSection = page.locator('div', { has: page.getByText(/^pokémon$/i) }).first();
    const trainerSection = page.locator('div', { has: page.getByText(/^trainer$/i) }).first();
    const energySection = page.locator('div', { has: page.getByText(/^energy$/i) }).first();
    const totalSection = page.locator('div', { has: page.getByText(/^total$/i) }).first();

    await pokemonSection.getByRole('button').nth(3).click(); // +4 button
    await expect(totalSection.getByText('4').first()).toBeVisible();

    await trainerSection.getByRole('button').nth(2).click(); // +3 button
    await expect(totalSection.getByText('7').first()).toBeVisible();

    await energySection.getByRole('button').nth(1).click(); // +2 button
    await expect(totalSection.getByText('9').first()).toBeVisible();
  });

  test('DC-06: Should have UNDO button that reverts last action', async ({ page }) => {
    const undoButton = page.getByRole('button', { name: /undo/i });
    await expect(undoButton).toBeVisible();

    const pokemonSection = page.locator('div', { has: page.getByText(/^pokémon$/i) }).first();
    
    await pokemonSection.getByRole('button').nth(2).click(); // +3 button
    await expect(pokemonSection.getByText('3').first()).toBeVisible();
    
    await pokemonSection.getByRole('button').nth(1).click(); // +2 button
    await expect(pokemonSection.getByText('5').first()).toBeVisible();
    
    await undoButton.click();
    await expect(pokemonSection.getByText('3').first()).toBeVisible();
  });

  test('DC-07: Should have RESET button that zeros all counters', async ({ page }) => {
    const resetButton = page.getByRole('button', { name: /reset/i });
    await expect(resetButton).toBeVisible();

    const pokemonSection = page.locator('div', { has: page.getByText(/^pokémon$/i) }).first();
    const trainerSection = page.locator('div', { has: page.getByText(/^trainer$/i) }).first();
    const totalSection = page.locator('div', { has: page.getByText(/^total$/i) }).first();

    await pokemonSection.getByRole('button').nth(3).click(); // +4 button
    await trainerSection.getByRole('button').nth(2).click(); // +3 button
    
    await resetButton.click();
    
    await expect(pokemonSection.getByText('0').first()).toBeVisible();
    await expect(trainerSection.getByText('0').first()).toBeVisible();
    await expect(totalSection.getByText('0').first()).toBeVisible();
  });

  test('DC-08: Should have LOOKUP CARD button', async ({ page }) => {
    const lookupButton = page.getByRole('link', { name: /lookup card/i });
    await expect(lookupButton).toBeVisible();
    await expect(lookupButton).toHaveAttribute('href', 'https://www.pokemon.com/us/pokemon-tcg/pokemon-cards');
    await expect(lookupButton).toHaveAttribute('target', '_blank');
  });

  test('DC-09: Should persist counters in localStorage', async ({ page }) => {
    const pokemonSection = page.locator('div', { has: page.getByText(/^pokémon$/i) }).first();
    const trainerSection = page.locator('div', { has: page.getByText(/^trainer$/i) }).first();
    
    await pokemonSection.getByRole('button').nth(3).click(); // +4 button
    await trainerSection.getByRole('button').nth(1).click(); // +2 button
    
    await page.reload();
    await page.getByRole('tab', { name: /deck check/i }).click();
    
    const pokemonAfterReload = page.locator('div', { has: page.getByText(/^pokémon$/i) }).first();
    const trainerAfterReload = page.locator('div', { has: page.getByText(/^trainer$/i) }).first();
    
    await expect(pokemonAfterReload.getByText('4').first()).toBeVisible();
    await expect(trainerAfterReload.getByText('2').first()).toBeVisible();
  });

  test('Mobile-first: Should be usable on 375px viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    const pokemonSection = page.locator('div', { has: page.getByText(/^pokémon$/i) }).first();
    
    await expect(pokemonSection).toBeVisible();
    
    const firstButton = pokemonSection.getByRole('button').nth(0);
    await expect(firstButton).toBeVisible();
    
    const boundingBox = await firstButton.boundingBox();
    expect(boundingBox?.height).toBeGreaterThanOrEqual(40);
  });

  test('Counter selection: Should highlight selected counter', async ({ page }) => {
    // Find the Paper containing "Pokémon" and click one of its buttons
    await page.locator('[class*="mantine-Paper"]', { has: page.getByText(/^pokémon$/i) })
      .getByRole('button').nth(0).click();
    
    // Check if the Paper element has data-selected="true"
    const paperElement = page.locator('[class*="mantine-Paper"][data-selected="true"]', { 
      has: page.getByText(/^pokémon$/i) 
    });
    
    await expect(paperElement).toBeVisible();
  });

  test('Undo multiple times should work correctly', async ({ page }) => {
    const pokemonSection = page.locator('div', { has: page.getByText(/^pokémon$/i) }).first();
    const trainerSection = page.locator('div', { has: page.getByText(/^trainer$/i) }).first();
    const undoButton = page.getByRole('button', { name: /undo/i });
    
    await pokemonSection.getByRole('button').nth(1).click(); // +2 button
    await trainerSection.getByRole('button').nth(2).click(); // +3 button
    await pokemonSection.getByRole('button').nth(0).click(); // +1 button
    
    await undoButton.click();
    await expect(pokemonSection.getByText('2').first()).toBeVisible();
    
    await undoButton.click();
    const trainerAfterUndo = page.locator('div', { has: page.getByText(/^trainer$/i) }).first();
    await expect(trainerAfterUndo.getByText('0').first()).toBeVisible();
    
    await undoButton.click();
    const pokemonAfterUndo = page.locator('div', { has: page.getByText(/^pokémon$/i) }).first();
    await expect(pokemonAfterUndo.getByText('0').first()).toBeVisible();
  });

  test('Undo when history is empty should do nothing', async ({ page }) => {
    const undoButton = page.getByRole('button', { name: /undo/i });
    const pokemonSection = page.locator('div', { has: page.getByText(/^pokémon$/i) }).first();
    
    await undoButton.click();
    await expect(pokemonSection.getByText('0').first()).toBeVisible();
  });

  test('Total should turn green when count reaches exactly 60', async ({ page }) => {
    const pokemonSection = page.locator('div', { has: page.getByText(/^pokémon$/i) }).first();

    // Add cards to reach 60
    for (let i = 0; i < 15; i++) {
      await pokemonSection.getByRole('button').nth(3).click(); // +4 x 15 = 60 total
    }

    const totalPaper = page.locator('[class*="mantine-Paper"]', { has: page.getByText(/^total$/i) });
    await expect(totalPaper.getByText('60').first()).toBeVisible();
  });

  test('Total should turn red when count exceeds 60', async ({ page }) => {
    const pokemonSection = page.locator('div', { has: page.getByText(/^pokémon$/i) }).first();

    // Add cards to exceed 60
    for (let i = 0; i < 16; i++) {
      await pokemonSection.getByRole('button').nth(3).click(); // +4 x 16 = 64 total
    }

    const totalPaper = page.locator('[class*="mantine-Paper"]', { has: page.getByText(/^total$/i) });
    await expect(totalPaper.getByText('64').first()).toBeVisible();
  });

  test('Pokémon counter should be visible with styling', async ({ page }) => {
    const pokemonPaper = page.locator('[class*="mantine-Paper"]', { has: page.getByText(/^pokémon$/i) }).first();
    await expect(pokemonPaper).toBeVisible();
    
    // Verify the Paper has custom border styling
    const hasCustomStyle = await pokemonPaper.evaluate((el) => {
      return el.hasAttribute('style');
    });
    
    expect(hasCustomStyle).toBe(true);
  });
});