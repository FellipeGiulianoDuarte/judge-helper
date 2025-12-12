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

  test('should persist autostart switches state in localStorage', async ({ page }) => {
    // Ativar ambos os switches
    await page.getByText(/autostart.*draw/i).click();
    await page.getByText(/autostart.*next turn/i).click();

    // Verificar que estão ativados
    const drawSwitch = page.getByTestId('autostart-draw-switch');
    const nextTurnSwitch = page.getByTestId('autostart-next-turn-switch');
    
    await expect(drawSwitch).toBeChecked();
    await expect(nextTurnSwitch).toBeChecked();

    // Recarregar a página
    await page.reload();

    // Verificar que os switches continuam ativados
    await expect(drawSwitch).toBeChecked();
    await expect(nextTurnSwitch).toBeChecked();
  });

  test('should persist autostart switches when one is ON and other is OFF', async ({ page }) => {
    // Ativar apenas autostart-draw
    await page.getByText(/autostart.*draw/i).click();

    // Verificar estados
    const drawSwitch = page.getByTestId('autostart-draw-switch');
    const nextTurnSwitch = page.getByTestId('autostart-next-turn-switch');
    
    await expect(drawSwitch).toBeChecked();
    await expect(nextTurnSwitch).not.toBeChecked();

    // Recarregar a página
    await page.reload();

    // Verificar que os estados foram mantidos
    await expect(drawSwitch).toBeChecked();
    await expect(nextTurnSwitch).not.toBeChecked();
  });

  test('should preserve autostart switches when clicking Clear All', async ({ page }) => {
    // Ativar ambos os switches
    await page.getByText(/autostart.*draw/i).click();
    await page.getByText(/autostart.*next turn/i).click();

    // Fazer algumas ações
    await page.getByRole('button', { name: /supporter/i }).click();
    await page.getByRole('checkbox', { name: /draw/i }).click();

    // Verificar que switches estão ativados
    const drawSwitch = page.getByTestId('autostart-draw-switch');
    const nextTurnSwitch = page.getByTestId('autostart-next-turn-switch');
    await expect(drawSwitch).toBeChecked();
    await expect(nextTurnSwitch).toBeChecked();

    // Clicar em Clear All
    await page.getByRole('button', { name: /clear all/i }).click();

    // Confirmar no modal
    await page.getByRole('button', { name: /confirm/i }).click();

    // Verificar que os switches foram PRESERVADOS
    await expect(drawSwitch).toBeChecked();
    await expect(nextTurnSwitch).toBeChecked();

    // Verificar que os contadores foram resetados
    await expect(page.getByTestId('action-total-value')).toHaveText('0');
    await expect(page.getByRole('checkbox', { name: /draw/i })).not.toBeChecked();
  });

  test('should preserve only enabled switches after Clear All', async ({ page }) => {
    // Ativar apenas autostart-draw (deixar next turn OFF)
    await page.getByText(/autostart.*draw/i).click();

    // Fazer algumas ações
    await page.getByRole('button', { name: /supporter/i }).click();

    // Verificar estados antes do Clear All
    const drawSwitch = page.getByTestId('autostart-draw-switch');
    const nextTurnSwitch = page.getByTestId('autostart-next-turn-switch');
    await expect(drawSwitch).toBeChecked();
    await expect(nextTurnSwitch).not.toBeChecked();

    // Clicar em Clear All e confirmar
    await page.getByRole('button', { name: /clear all/i }).click();
    await page.getByRole('button', { name: /confirm/i }).click();

    // Verificar que os switches mantiveram seus estados
    await expect(drawSwitch).toBeChecked();
    await expect(nextTurnSwitch).not.toBeChecked();
  });
});
