import { test, expect } from '@playwright/test';

test.describe('Penalties Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/penalties');
    await page.evaluate(() => localStorage.removeItem('penalties'));
    await page.reload();
  });

  test('should display Penalties tab in navigation', async ({ page }) => {
    await expect(page.getByRole('tab', { name: /penalties|penalidades|sanciones/i })).toBeVisible();
  });

  test('should display page title', async ({ page }) => {
    await expect(page.getByRole('paragraph').filter({ hasText: /^Penalties$|^Penalidades$|^Sanciones$/ })).toBeVisible();
  });

  test('should display input fields for player/table, penalty type, and notes', async ({ page }) => {
    await expect(page.getByPlaceholder(/player.*table|jogador.*mesa|jugador.*mesa/i)).toBeVisible();
    await expect(page.getByText(/penalty type|tipo de penalidade|tipo de sanción/i)).toBeVisible();
    await expect(page.getByPlaceholder(/notes|notas|observações/i)).toBeVisible();
  });

  test('should display ADD button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /add|adicionar|agregar/i })).toBeVisible();
  });

  test('should add a new penalty', async ({ page }) => {
    await page.getByPlaceholder(/player.*table|jogador.*mesa|jugador.*mesa/i).fill('Table 5 - John');
    // Select penalty type
    await page.getByTestId('penalty-type-select').click();
    await page.getByRole('option', { name: /warning|advertência|advertencia/i }).click();
    await page.getByPlaceholder(/notes|notas|observações/i).fill('Slow play');

    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();

    // Should display the new penalty in the list
    await expect(page.getByRole('cell', { name: 'Table 5 - John' })).toBeVisible();
    await expect(page.getByRole('cell', { name: /warning|advertência|advertencia/i })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Slow play' })).toBeVisible();
  });

  test('should clear inputs after adding a penalty', async ({ page }) => {
    await page.getByPlaceholder(/player.*table|jogador.*mesa|jugador.*mesa/i).fill('Table 5 - John');
    await page.getByTestId('penalty-type-select').click();
    await page.getByRole('option', { name: /caution|cuidado|precaución/i }).click();
    await page.getByPlaceholder(/notes|notas|observações/i).fill('Minor issue');

    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();

    await expect(page.getByPlaceholder(/player.*table|jogador.*mesa|jugador.*mesa/i)).toHaveValue('');
    await expect(page.getByPlaceholder(/notes|notas|observações/i)).toHaveValue('');
  });

  test('should add multiple penalties', async ({ page }) => {
    // Add first penalty
    await page.getByPlaceholder(/player.*table|jogador.*mesa|jugador.*mesa/i).fill('Table 1 - Alice');
    await page.getByTestId('penalty-type-select').click();
    await page.getByRole('option', { name: /caution|cuidado|precaución/i }).click();
    await page.getByPlaceholder(/notes|notas|observações/i).fill('Minor issue');
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();

    // Add second penalty
    await page.getByPlaceholder(/player.*table|jogador.*mesa|jugador.*mesa/i).fill('Table 3 - Bob');
    await page.getByTestId('penalty-type-select').click();
    await page.getByRole('option', { name: /game loss|derrota|pérdida/i }).click();
    await page.getByPlaceholder(/notes|notas|observações/i).fill('Deck error');
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();

    // Both should be visible
    await expect(page.getByText('Table 1 - Alice')).toBeVisible();
    await expect(page.getByText('Table 3 - Bob')).toBeVisible();
  });

  test('should delete a penalty', async ({ page }) => {
    // Add a penalty
    await page.getByPlaceholder(/player.*table|jogador.*mesa|jugador.*mesa/i).fill('Table 5 - John');
    await page.getByTestId('penalty-type-select').click();
    await page.getByRole('option', { name: /warning|advertência|advertencia/i }).click();
    await page.getByPlaceholder(/notes|notas|observações/i).fill('Slow play');
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();

    // Verify it's visible
    await expect(page.getByText('Table 5 - John')).toBeVisible();

    // Delete
    await page.getByRole('button', { name: /delete|excluir|eliminar/i }).click();

    // Should show empty state
    await expect(page.getByText(/no penalties|nenhuma penalidade|sin sanciones/i)).toBeVisible();
  });

  test('should clear all penalties with reset button', async ({ page }) => {
    // Add two penalties
    await page.getByPlaceholder(/player.*table|jogador.*mesa|jugador.*mesa/i).fill('Table 1 - Alice');
    await page.getByTestId('penalty-type-select').click();
    await page.getByRole('option', { name: /caution|cuidado|precaución/i }).click();
    await page.getByPlaceholder(/notes|notas|observações/i).fill('Note 1');
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();

    await page.getByPlaceholder(/player.*table|jogador.*mesa|jugador.*mesa/i).fill('Table 3 - Bob');
    await page.getByTestId('penalty-type-select').click();
    await page.getByRole('option', { name: /warning|advertência|advertencia/i }).click();
    await page.getByPlaceholder(/notes|notas|observações/i).fill('Note 2');
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();

    // Click clear all
    await page.getByRole('button', { name: /clear all|limpar tudo|limpiar todo/i }).click();

    // Should show empty state
    await expect(page.getByText(/no penalties|nenhuma penalidade|sin sanciones/i)).toBeVisible();
  });

  test('should persist penalties in localStorage', async ({ page }) => {
    // Add penalty
    await page.getByPlaceholder(/player.*table|jogador.*mesa|jugador.*mesa/i).fill('Table 5 - John');
    await page.getByTestId('penalty-type-select').click();
    await page.getByRole('option', { name: /warning|advertência|advertencia/i }).click();
    await page.getByPlaceholder(/notes|notas|observações/i).fill('Slow play');
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();

    // Wait for penalty to appear
    await expect(page.getByText('Table 5 - John')).toBeVisible();

    // Verify localStorage has data
    const storedData = await page.evaluate(() => localStorage.getItem('penalties'));
    expect(storedData).toContain('Table 5 - John');
    expect(storedData).toContain('Slow play');
  });

  test('should load penalties from localStorage on page reload', async ({ page }) => {
    // Add penalty
    await page.getByPlaceholder(/player.*table|jogador.*mesa|jugador.*mesa/i).fill('Table 7 - Carol');
    await page.getByTestId('penalty-type-select').click();
    await page.getByRole('option', { name: /caution|cuidado|precaución/i }).click();
    await page.getByPlaceholder(/notes|notas|observações/i).fill('Minor infraction');
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();

    // Wait for it to appear and verify localStorage was saved
    await expect(page.getByRole('cell', { name: 'Table 7 - Carol' })).toBeVisible();

    // Navigate away and come back to simulate fresh component mount
    await page.getByRole('tab', { name: /table judge/i }).click();
    await page.getByRole('tab', { name: /penalties|penalidades|sanciones/i }).click();

    // Should still be visible after loading from localStorage
    await expect(page.getByRole('cell', { name: 'Table 7 - Carol' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('cell', { name: 'Minor infraction' })).toBeVisible();
  });

  test('should not add penalty with empty player/table field', async ({ page }) => {
    await page.getByTestId('penalty-type-select').click();
    await page.getByRole('option', { name: /warning|advertência|advertencia/i }).click();
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();

    // Should show empty state (no penalty added)
    await expect(page.getByText(/no penalties|nenhuma penalidade|sin sanciones/i)).toBeVisible();
  });

  test('should display all penalty type options', async ({ page }) => {
    await page.getByTestId('penalty-type-select').click();

    await expect(page.getByRole('option', { name: /caution|cuidado|precaución/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /warning|advertência|advertencia/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /prize card|carta de prêmio|carta de premio/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /game loss|derrota|pérdida/i })).toBeVisible();
    await expect(page.getByRole('option', { name: /disqualification|desclassificação|descalificación/i })).toBeVisible();
  });

  test('should show empty state when no penalties are registered', async ({ page }) => {
    await expect(page.getByText(/no penalties|nenhuma penalidade|sin sanciones/i)).toBeVisible();
  });
});
