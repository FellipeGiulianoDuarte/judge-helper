import { test, expect } from '@playwright/test';

test.describe('Table Judge - Turn History with Time and Pace', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.click('text=Table Judge');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should display time duration and pace in turn history', async ({ page }) => {
    // Fazer uma ação para ter algo no histórico
    await page.getByRole('button', { name: /supporter/i }).click();
    await page.getByRole('button', { name: /other.*action/i }).click();
    await page.getByRole('button', { name: /other.*action/i }).click();
    
    // Esperar um pouco para o timer
    await page.waitForTimeout(2000);
    
    // Passar para o próximo turno
    await page.getByRole('button', { name: /next turn/i }).click();
    
    // Verificar que o histórico foi criado
    const turnHistory = page.getByTestId('turn-history');
    await expect(turnHistory).toBeVisible();
    
    // Verificar que existe um entry no histórico
    const turnEntry = page.getByTestId('turn-entry').first();
    await expect(turnEntry).toBeVisible();
    
    // Verificar que contém o ícone de relógio (⏱️)
    await expect(turnEntry.locator('text=⏱️')).toBeVisible();
    
    // Verificar que contém o formato de tempo (MM:SS)
    await expect(turnEntry.locator('text=/\\d+:\\d{2}/')).toBeVisible();
    
    // Verificar que contém o pace (Xs/act)
    await expect(turnEntry.locator('text=/\\d+s\\/act/')).toBeVisible();
  });

  test('should show 0s/act when no actions were performed', async ({ page }) => {
    // Passar para o próximo turno sem fazer ações
    await page.getByRole('button', { name: /next turn/i }).click();
    
    // Verificar que o histórico foi criado
    const turnEntry = page.getByTestId('turn-entry').first();
    await expect(turnEntry).toBeVisible();
    
    // Verificar que mostra 0s/act quando não há ações
    await expect(turnEntry.locator('text=/0s\\/act/')).toBeVisible();
  });

  test('should calculate pace correctly based on other actions', async ({ page }) => {
    // Iniciar o timer primeiro
    await page.getByRole('checkbox', { name: /draw/i }).click();
    
    // Fazer 4 other actions
    await page.getByRole('button', { name: /other.*action/i }).click();
    await page.getByRole('button', { name: /other.*action/i }).click();
    await page.getByRole('button', { name: /other.*action/i }).click();
    await page.getByRole('button', { name: /other.*action/i }).click();
    
    // Esperar 4 segundos (1s por ação = pace de 1s/act)
    await page.waitForTimeout(4000);
    
    // Passar para o próximo turno
    await page.getByRole('button', { name: /next turn/i }).click();
    
    // Verificar que o histórico foi criado
    const turnEntry = page.getByTestId('turn-entry').first();
    await expect(turnEntry).toBeVisible();
    
    // Verificar que o pace existe e é um número válido
    const paceText = await turnEntry.locator('text=/\\d+s\\/act/').textContent();
    expect(paceText).toMatch(/\d+s\/act/);
    
    // Verificar que o pace está entre 0 e 2s/act (com margem de erro)
    const paceValue = parseInt(paceText?.match(/(\d+)s\/act/)?.[1] || '0');
    expect(paceValue).toBeGreaterThanOrEqual(0);
    expect(paceValue).toBeLessThanOrEqual(2);
  });

  test('should format time correctly (MM:SS)', async ({ page }) => {
    // Fazer uma ação
    await page.getByRole('button', { name: /supporter/i }).click();
    
    // Esperar mais de 60 segundos não é prático, então vamos apenas verificar o formato
    // Passar para o próximo turno
    await page.getByRole('button', { name: /next turn/i }).click();
    
    // Verificar que o histórico foi criado
    const turnEntry = page.getByTestId('turn-entry').first();
    await expect(turnEntry).toBeVisible();
    
    // Verificar que o tempo está no formato correto (M:SS ou MM:SS)
    const timeText = await turnEntry.locator('text=/\\d+:\\d{2}/').textContent();
    expect(timeText).toMatch(/\d+:\d{2}/);
  });
});
