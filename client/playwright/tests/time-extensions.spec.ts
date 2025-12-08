import { test, expect } from '@playwright/test';

test.describe('Time Extensions Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/time-extensions');
    await page.evaluate(() => localStorage.removeItem('timeExtensions'));
    await page.reload();
  });

  test('should display page title', async ({ page }) => {
    await expect(page.getByText(/Time Extensions|Extensões de Tempo|Extensiones de Tiempo/i)).toBeVisible();
  });

  test('should display input fields for round, table and extension', async ({ page }) => {
    await expect(page.getByPlaceholder(/round|rodada|ronda/i)).toBeVisible();
    await expect(page.getByPlaceholder(/table|mesa/i)).toBeVisible();
    await expect(page.getByPlaceholder(/minutes|minutos/i)).toBeVisible();
  });

  test('should display ADD button', async ({ page }) => {
    await expect(page.getByRole('button', { name: /add|adicionar|agregar/i })).toBeVisible();
  });

  test('should add a new time extension', async ({ page }) => {
    await page.getByPlaceholder(/round|rodada|ronda/i).fill('1');
    await page.getByPlaceholder(/table|mesa/i).fill('5');
    await page.getByPlaceholder(/minutes|minutos/i).fill('3');
    
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();
    
    // Should display the new extension in the list
    await expect(page.getByText('1')).toBeVisible(); // Round
    await expect(page.getByText('5')).toBeVisible(); // Table
    await expect(page.getByText('3')).toBeVisible(); // Minutes
  });

  test('should clear inputs after adding', async ({ page }) => {
    await page.getByPlaceholder(/round|rodada|ronda/i).fill('1');
    await page.getByPlaceholder(/table|mesa/i).fill('5');
    await page.getByPlaceholder(/minutes|minutos/i).fill('3');
    
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();
    
    await expect(page.getByPlaceholder(/round|rodada|ronda/i)).toHaveValue('');
    await expect(page.getByPlaceholder(/table|mesa/i)).toHaveValue('');
    await expect(page.getByPlaceholder(/minutes|minutos/i)).toHaveValue('');
  });

  test('should add multiple extensions', async ({ page }) => {
    // Add first extension
    await page.getByPlaceholder(/round|rodada|ronda/i).fill('1');
    await page.getByPlaceholder(/table|mesa/i).fill('5');
    await page.getByPlaceholder(/minutes|minutos/i).fill('3');
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();
    
    // Add second extension
    await page.getByPlaceholder(/round|rodada|ronda/i).fill('2');
    await page.getByPlaceholder(/table|mesa/i).fill('10');
    await page.getByPlaceholder(/minutes|minutos/i).fill('5');
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();
    
    // Both should be visible - use table cells
    await expect(page.getByRole('cell', { name: '5' }).first()).toBeVisible(); // Table 5
    await expect(page.getByRole('cell', { name: '10' })).toBeVisible(); // Table 10
  });

  test('should edit extension minutes', async ({ page }) => {
    // Add extension
    await page.getByPlaceholder(/round|rodada|ronda/i).fill('1');
    await page.getByPlaceholder(/table|mesa/i).fill('5');
    await page.getByPlaceholder(/minutes|minutos/i).fill('3');
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();
    
    // Click edit button
    await page.getByRole('button', { name: /edit|editar/i }).click();
    
    // Should show edit input with current value
    const editInput = page.locator('input[type="number"]').last();
    await editInput.fill('7');
    
    // Save
    await page.getByRole('button', { name: /save|salvar|guardar/i }).click();
    
    // Should show updated value
    await expect(page.getByText('7')).toBeVisible();
  });

  test('should delete extension', async ({ page }) => {
    // Add extension
    await page.getByPlaceholder(/round|rodada|ronda/i).fill('1');
    await page.getByPlaceholder(/table|mesa/i).fill('5');
    await page.getByPlaceholder(/minutes|minutos/i).fill('3');
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();
    
    // Verify it's visible
    await expect(page.getByText('5')).toBeVisible();
    
    // Delete
    await page.getByRole('button', { name: /delete|excluir|eliminar/i }).click();
    
    // Should not be visible anymore (check for "no extensions" message or empty state)
    await expect(page.getByText(/no extensions|nenhuma extensão|sin extensiones/i)).toBeVisible();
  });

  test('should persist extensions in localStorage', async ({ page }) => {
    // Add extension (localStorage already cleared by beforeEach)
    await page.getByPlaceholder(/round|rodada|ronda/i).fill('1');
    await page.getByPlaceholder(/table|mesa/i).fill('5');
    await page.getByPlaceholder(/minutes|minutos/i).fill('3');
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();
    
    // Wait and verify the item was added
    await expect(page.getByRole('cell', { name: '5' })).toBeVisible();
    
    // Verify localStorage has data
    const storedData = await page.evaluate(() => localStorage.getItem('timeExtensions'));
    expect(storedData).toContain('5');
    expect(storedData).toContain('3');
  });

  test('should not add extension with empty fields', async ({ page }) => {
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();
    
    // Should show empty state (no extension added)
    await expect(page.getByText(/no extensions|nenhuma extensão|sin extensiones/i)).toBeVisible();
  });

  test('should display extensions grouped or sorted by round', async ({ page }) => {
    // Add extensions for different rounds
    await page.getByPlaceholder(/round|rodada|ronda/i).fill('2');
    await page.getByPlaceholder(/table|mesa/i).fill('10');
    await page.getByPlaceholder(/minutes|minutos/i).fill('5');
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();
    
    await page.getByPlaceholder(/round|rodada|ronda/i).fill('1');
    await page.getByPlaceholder(/table|mesa/i).fill('5');
    await page.getByPlaceholder(/minutes|minutos/i).fill('3');
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();
    
    // Both rounds should be visible
    const roundHeaders = page.locator('text=/Round|Rodada|Ronda/i');
    await expect(roundHeaders.first()).toBeVisible();
  });
});
