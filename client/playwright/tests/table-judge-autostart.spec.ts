import { test, expect } from '@playwright/test';

test.describe('Table Judge - Autostart Switches', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Table Judge');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display autostart switches at bottom of page', async ({ page }) => {
    // Verificar que os switches existem
    const autostartDrawSwitch = page.getByTestId('autostart-draw-switch');
    const autostartNextTurnSwitch = page.getByTestId('autostart-next-turn-switch');
    
    await expect(autostartDrawSwitch).toBeAttached();
    await expect(autostartNextTurnSwitch).toBeAttached();

    // Verificar labels
    await expect(page.getByText(/autostart.*draw/i)).toBeVisible();
    await expect(page.getByText(/autostart.*next turn/i)).toBeVisible();
  });

  test('should start timer when draw is clicked and autostart-draw is ON', async ({ page }) => {
    // Ativar autostart para draw - clicar na label
    await page.getByText(/autostart.*draw/i).click();

    // Verificar tempo inicial (0s) - usar selector mais específico
    await expect(page.locator('text=/^0s$/')).toBeVisible();

    // Clicar em Draw
    await page.getByRole('checkbox', { name: /draw/i }).click();

    // Aguardar 2 segundos e verificar que o timer está rodando
    await page.waitForTimeout(2000);
    const timerText = await page.locator('text=/[1-9]s/').first().textContent();
    expect(parseInt(timerText || '0')).toBeGreaterThanOrEqual(1);
  });

  test('should NOT start timer when draw is clicked and autostart-draw is OFF', async ({ page }) => {
    // Garantir que autostart está OFF (padrão)
    const switchElement = page.getByTestId('autostart-draw-switch');
    const isChecked = await switchElement.isChecked();
    if (isChecked) {
      await page.getByText(/autostart.*draw/i).click();
    }

    // Verificar tempo inicial (0s) - usar selector mais específico
    await expect(page.locator('text=/^0s$/')).toBeVisible();

    // Clicar em Draw
    await page.getByRole('checkbox', { name: /draw/i }).click();

    // Aguardar 1 segundo e verificar que o timer NÃO está rodando
    await page.waitForTimeout(1000);
    await expect(page.locator('text=/^0s$/')).toBeVisible();
  });

  test('should start timer when next turn is clicked and autostart-next-turn is ON', async ({ page }) => {
    // Fazer algumas ações primeiro
    await page.getByRole('button', { name: /supporter/i }).click();
    
    // Ativar autostart para próximo turno - clicar na label
    await page.getByText(/autostart.*next turn/i).click();

    // Clicar em próximo turno
    await page.getByRole('button', { name: /next turn/i }).click();

    // Aguardar 2 segundos e verificar que o timer está rodando
    await page.waitForTimeout(2000);
    const timerText = await page.locator('text=/[1-9]s/').first().textContent();
    expect(parseInt(timerText || '0')).toBeGreaterThanOrEqual(1);
  });

  test('should NOT start timer when next turn is clicked and autostart-next-turn is OFF', async ({ page }) => {
    // Fazer algumas ações primeiro
    await page.getByRole('button', { name: /supporter/i }).click();
    
    // Garantir que autostart está OFF (padrão)
    const switchElement = page.getByTestId('autostart-next-turn-switch');
    const isChecked = await switchElement.isChecked();
    if (isChecked) {
      await page.getByText(/autostart.*next turn/i).click();
    }

    // Clicar em próximo turno
    await page.getByRole('button', { name: /next turn/i }).click();

    // Aguardar 1 segundo e verificar que o timer NÃO está rodando
    await page.waitForTimeout(1000);
    await expect(page.locator('text=/^0s$/')).toBeVisible();
  });

  test('should persist autostart settings in localStorage', async ({ page }) => {
    // Ativar ambos os switches - clicar nas labels
    await page.getByText(/autostart.*draw/i).click();
    await page.getByText(/autostart.*next turn/i).click();

    // Recarregar página
    await page.reload();

    // Verificar que os switches permanecem ativos
    await expect(page.getByTestId('autostart-draw-switch')).toBeChecked();
    await expect(page.getByTestId('autostart-next-turn-switch')).toBeChecked();
  });

  test('switches should be discrete and at bottom of page', async ({ page }) => {
    const switchesContainer = page.getByTestId('autostart-switches-container');
    
    // Verificar que existe
    await expect(switchesContainer).toBeVisible();
    
    // Verificar que está próximo do final da página (após Clear All)
    const clearAllButton = page.getByRole('button', { name: /clear all/i });
    await expect(clearAllButton).toBeVisible();
    
    // Verificar ordem: Clear All vem antes dos switches
    const clearAllBox = await clearAllButton.boundingBox();
    const switchesBox = await switchesContainer.boundingBox();
    
    expect(clearAllBox).not.toBeNull();
    expect(switchesBox).not.toBeNull();
    expect(switchesBox!.y).toBeGreaterThan(clearAllBox!.y);
  });
});
