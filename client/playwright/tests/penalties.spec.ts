import { test, expect } from '@playwright/test';

test.describe('Penalties Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage and navigate to penalties page
    await page.goto('/penalties');
    await page.evaluate(() => {
      localStorage.removeItem('penalties');
      localStorage.setItem('onboardingCompleted', 'true');
    });
    await page.reload();
  });

  // Helper to get form fields unambiguously
  const getPlayerNameInput = (page: import('@playwright/test').Page) =>
    page.locator('[data-wizard-penalty-form]').getByPlaceholder(/player name|nome do jogador|nombre del jugador/i);
  const getRoundInput = (page: import('@playwright/test').Page) =>
    page.locator('[data-wizard-penalty-form]').getByPlaceholder(/round|rodada|ronda/i);
  const getInfractionInput = (page: import('@playwright/test').Page) =>
    page.locator('input[data-testid="infraction-select"]');
  const getPenaltyInput = (page: import('@playwright/test').Page) =>
    page.locator('input[data-testid="penalty-select"]');
  const getNotesInput = (page: import('@playwright/test').Page) =>
    page.getByPlaceholder(/notes|notas|observaciones/i);
  const getAddButton = (page: import('@playwright/test').Page) =>
    page.locator('[data-wizard-penalty-form]').getByRole('button', { name: /add|adicionar|agregar/i });
  const getSearchInput = (page: import('@playwright/test').Page) =>
    page.getByPlaceholder(/search|buscar|pesquisar/i);

  async function fillAndSubmitPenalty(
    page: import('@playwright/test').Page,
    playerName: string,
    round: string,
    infractionName: RegExp,
    opts?: { notes?: string }
  ) {
    await getPlayerNameInput(page).fill(playerName);
    await getRoundInput(page).fill(round);
    await getInfractionInput(page).click();
    await page.getByRole('option', { name: infractionName }).click();
    if (opts?.notes) {
      await getNotesInput(page).fill(opts.notes);
    }
    await getAddButton(page).click();
  }

  test('should display Penalties tab in navigation', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /penalties|penalidades|penalizaciones/i })).toBeVisible();
  });

  test('should navigate to /penalties', async ({ page }) => {
    await expect(page).toHaveURL(/\/penalties/);
    await expect(page.getByText(/penalties|penalidades|penalizaciones/i).first()).toBeVisible();
  });

  test('should display penalty registration form', async ({ page }) => {
    await expect(getPlayerNameInput(page)).toBeVisible();
    await expect(getRoundInput(page)).toBeVisible();
    await expect(page.getByText(/infraction|infração|infracción/i).first()).toBeVisible();
    await expect(getAddButton(page)).toBeVisible();
  });

  test('should register a penalty with auto-filled default penalty', async ({ page }) => {
    // Fill player name
    await getPlayerNameInput(page).fill('John Doe');

    // Fill round
    await getRoundInput(page).fill('1');

    // Select infraction - "Gameplay Error - Minor: Procedural Error" has default "Warning"
    await getInfractionInput(page).click();
    await page.getByRole('option', { name: /Gameplay Error - Minor: Procedural Error/i }).click();

    // Verify the penalty applied field auto-filled with "Warning"
    await expect(getPenaltyInput(page)).toHaveValue(/warning/i);

    // Add notes
    await getNotesInput(page).fill('Test penalty note');

    // Submit
    await getAddButton(page).click();

    // Verify penalty appears in the history
    await expect(page.getByText('John Doe')).toBeVisible();
    await expect(page.getByRole('cell', { name: /Procedural Error/i })).toBeVisible();
    await expect(page.getByText('Test penalty note')).toBeVisible();
  });

  test('should override default penalty applied', async ({ page }) => {
    // Fill form
    await getPlayerNameInput(page).fill('Jane Smith');
    await getRoundInput(page).fill('2');

    // Select infraction
    await getInfractionInput(page).click();
    await page.getByRole('option', { name: /Gameplay Error - Minor: Procedural Error/i }).click();

    // Override penalty - change from Warning to Caution
    await getPenaltyInput(page).click();
    await page.getByRole('option', { name: /caution/i }).click();

    // Submit
    await getAddButton(page).click();

    // Verify penalty with overridden value appears
    await expect(page.getByText('Jane Smith')).toBeVisible();
    await expect(page.getByText(/caution/i).first()).toBeVisible();
  });

  test('should search/filter penalties by player name', async ({ page }) => {
    // Add penalty for player 1
    await fillAndSubmitPenalty(page, 'Alice', '1', /Gameplay Error - Minor: Procedural Error/i);

    // Add penalty for player 2
    await fillAndSubmitPenalty(page, 'Bob', '2', /Marked Cards - Minor/i);

    // Search for Alice
    await getSearchInput(page).fill('Alice');

    // Alice should be visible, Bob should not
    await expect(page.getByText('Alice')).toBeVisible();
    await expect(page.getByText('Bob')).not.toBeVisible();
  });

  test('should delete a penalty', async ({ page }) => {
    // Add a penalty
    await fillAndSubmitPenalty(page, 'Delete Me', '1', /Gameplay Error - Minor: Procedural Error/i);

    // Verify it exists
    await expect(page.getByText('Delete Me')).toBeVisible();

    // Delete it
    await page.getByRole('button', { name: /delete|excluir|eliminar/i }).first().click();

    // Verify it's gone
    await expect(page.getByText('Delete Me')).not.toBeVisible();
  });

  test('should clear all penalties', async ({ page }) => {
    // Add two penalties
    await fillAndSubmitPenalty(page, 'Player A', '1', /Gameplay Error - Minor: Procedural Error/i);
    await fillAndSubmitPenalty(page, 'Player B', '2', /Marked Cards - Minor/i);

    // Click clear all
    await page.getByRole('button', { name: /clear all|limpar tudo|limpiar todo/i }).click();

    // Confirm
    await page.getByRole('button', { name: /confirm|confirmar/i }).click();

    // Verify all penalties are gone
    await expect(page.getByText('Player A')).not.toBeVisible();
    await expect(page.getByText('Player B')).not.toBeVisible();
    await expect(page.getByText(/no penalties|nenhuma penalidade|sin penalizaciones/i)).toBeVisible();
  });

  test('should persist penalties in localStorage', async ({ page }) => {
    // Add a penalty
    await fillAndSubmitPenalty(page, 'Persist Player', '3', /Gameplay Error - Minor: Procedural Error/i);

    // Verify data in localStorage
    const storedData = await page.evaluate(() => localStorage.getItem('penalties'));
    expect(storedData).toContain('Persist Player');

    // Reload page and verify persistence
    await page.reload();
    await page.waitForLoadState('networkidle');
    await expect(page.getByText('Persist Player')).toBeVisible({ timeout: 10000 });
  });

  test('should show empty state when no penalties exist', async ({ page }) => {
    await expect(page.getByText(/no penalties|nenhuma penalidade|sin penalizaciones/i)).toBeVisible();
  });

  test('should not add penalty with empty required fields', async ({ page }) => {
    // Try to submit with empty fields
    await getAddButton(page).click();

    // Should still show empty state
    await expect(page.getByText(/no penalties|nenhuma penalidade|sin penalizaciones/i)).toBeVisible();
  });

  test('should clear form inputs after adding a penalty', async ({ page }) => {
    await fillAndSubmitPenalty(page, 'Test Player', '1', /Gameplay Error - Minor: Procedural Error/i);

    // Inputs should be cleared
    await expect(getPlayerNameInput(page)).toHaveValue('');
    await expect(getRoundInput(page)).toHaveValue('');
  });
});
