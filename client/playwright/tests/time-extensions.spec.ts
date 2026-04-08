import { test, expect } from '@playwright/test';

test.describe('Time Extensions Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/time-extensions');
    await page.evaluate(() => {
      localStorage.removeItem('timeExtensions');
      localStorage.setItem('onboardingCompleted', 'true');
    });
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
    
    // Should display the new extension in the list (use exact match to avoid matching recommended table)
    await expect(page.getByText('Round 1')).toBeVisible(); // Round header
    await expect(page.getByRole('cell', { name: '5', exact: true })).toBeVisible(); // Table
    await expect(page.getByRole('cell', { name: '3', exact: true })).toBeVisible(); // Minutes
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
    await page.getByLabel(/edit|editar/i).click();

    // Find the edit input inside the table row and update value
    const row = page.locator('table tbody tr');
    const editInput = row.getByRole('spinbutton');
    await expect(editInput).toBeVisible();
    await editInput.fill('7');

    // Save - use dispatchEvent to reliably trigger click on mobile viewport
    const saveButton = row.getByLabel(/save|salvar|guardar/i);
    await saveButton.dispatchEvent('click');

    // Should show updated value
    const bodyText = await page.locator('table tbody').textContent();
    expect(bodyText).toContain('7');
  });

  test('should delete extension', async ({ page }) => {
    // Add extension
    await page.getByPlaceholder(/round|rodada|ronda/i).fill('1');
    await page.getByPlaceholder(/table|mesa/i).fill('5');
    await page.getByPlaceholder(/minutes|minutos/i).fill('3');
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();
    
    // Verify it's visible (use exact match to avoid matching recommended table)
    await expect(page.getByRole('cell', { name: '5', exact: true })).toBeVisible();
    
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
    
    // Wait and verify the item was added (use exact match to avoid matching recommended table)
    await expect(page.getByRole('cell', { name: '5', exact: true })).toBeVisible();
    
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

  test('should save category with each extension', async ({ page }) => {
    // Default category is Masters - add extension
    await page.getByPlaceholder(/round|rodada|ronda/i).fill('1');
    await page.getByPlaceholder(/table|mesa/i).fill('5');
    await page.getByPlaceholder(/minutes|minutos/i).fill('3');
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();

    // Category should be displayed in the table row
    await expect(page.getByRole('cell', { name: /masters/i })).toBeVisible();

    // Switch to Junior and add another extension
    await page.locator('[data-testid="category-selector"]').getByText(/junior/i).click();
    await page.getByPlaceholder(/round|rodada|ronda/i).fill('1');
    await page.getByPlaceholder(/table|mesa/i).fill('8');
    await page.getByPlaceholder(/minutes|minutos/i).fill('5');
    await page.getByRole('button', { name: /add|adicionar|agregar/i }).click();

    // Both categories should be visible
    await expect(page.getByRole('cell', { name: /masters/i })).toBeVisible();
    await expect(page.getByRole('cell', { name: /junior/i })).toBeVisible();

    // Verify localStorage has category data
    const storedData = await page.evaluate(() => localStorage.getItem('timeExtensions'));
    expect(storedData).toContain('"category":"masters"');
    expect(storedData).toContain('"category":"junior"');
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
