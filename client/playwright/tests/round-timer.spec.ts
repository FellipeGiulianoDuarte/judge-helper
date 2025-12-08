import { test, expect } from '@playwright/test';

test.describe('Round Timer Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/round-timer');
  });

  test('should display round name input', async ({ page }) => {
    const input = page.getByPlaceholder(/round name|nome da rodada|nombre de la ronda/i);
    await expect(input).toBeVisible();
  });

  test('should display time preset buttons (BO1, BO3, Top Cut)', async ({ page }) => {
    await expect(page.getByRole('button', { name: /BO1.*30/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /BO3.*50/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Top Cut.*75/i })).toBeVisible();
  });

  test('should display custom minutes input', async ({ page }) => {
    const input = page.getByPlaceholder(/minutes|minutos/i);
    await expect(input).toBeVisible();
  });

  test('should set time when clicking BO1 preset', async ({ page }) => {
    await page.getByRole('button', { name: /BO1.*30/i }).click();
    await expect(page.locator('text=30:00')).toBeVisible();
  });

  test('should set time when clicking BO3 preset', async ({ page }) => {
    await page.getByRole('button', { name: /BO3.*50/i }).click();
    await expect(page.locator('text=50:00')).toBeVisible();
  });

  test('should set time when clicking Top Cut preset', async ({ page }) => {
    await page.getByRole('button', { name: /Top Cut.*75/i }).click();
    await expect(page.locator('text=75:00')).toBeVisible();
  });

  test('should set custom time', async ({ page }) => {
    await page.getByPlaceholder(/minutes|minutos/i).fill('15');
    await page.getByRole('button', { name: /^SET|DEFINIR|ESTABLECER$/i }).click();
    await expect(page.locator('text=15:00')).toBeVisible();
  });

  test('should display START, PAUSE, and RESET buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /^START|INICIAR$/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /PAUSE|PAUSAR/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /RESET|RESETAR|REINICIAR/i })).toBeVisible();
  });

  test('should start timer when clicking START', async ({ page }) => {
    await page.getByRole('button', { name: /BO1.*30/i }).click();
    await page.getByRole('button', { name: /^START$/i, exact: true }).click();
    
    await page.waitForTimeout(1100);
    const timer = await page.locator('text=/29:5[0-9]/').textContent();
    expect(timer).toMatch(/29:5[0-9]/);
  });

  test('should pause timer when clicking PAUSE', async ({ page }) => {
    await page.getByRole('button', { name: /BO1.*30/i }).click();
    await page.getByRole('button', { name: /^START$/i, exact: true }).click();
    await page.waitForTimeout(1100);
    
    await page.getByRole('button', { name: /PAUSE|PAUSAR/i }).click();
    const timerAfterPause = await page.locator('text=/29:5[0-9]/').textContent();
    
    await page.waitForTimeout(1000);
    const timerAfterWait = await page.locator('text=/29:5[0-9]/').textContent();
    expect(timerAfterPause).toBe(timerAfterWait);
  });

  test('should reset timer when clicking RESET', async ({ page }) => {
    await page.getByRole('button', { name: /BO1.*30/i }).click();
    await page.getByRole('button', { name: /^START$/i, exact: true }).click();
    await page.waitForTimeout(1100);
    
    await page.getByRole('button', { name: /RESET|RESETAR|REINICIAR/i }).click();
    await expect(page.locator('text=30:00')).toBeVisible();
  });

  test('should display timer in green initially', async ({ page }) => {
    await page.getByRole('button', { name: /BO1.*30/i }).click();
    const timer = page.locator('text=30:00').first();
    await expect(timer).toHaveCSS('color', /rgb\(64, 192, 87\)|#40c057/i);
  });

  test('should display timer in yellow when reaching 1/3 of time', async ({ page }) => {
    // Set 3 seconds for faster testing
    await page.getByPlaceholder(/minutes|minutos/i).fill('0.05'); // 3 seconds
    await page.getByRole('button', { name: /^SET|DEFINIR|ESTABLECER$/i }).click();
    
    await page.getByRole('button', { name: /^START$/i, exact: true }).click();
    await page.waitForTimeout(2100); // Wait for 2 seconds (2/3 of time passed)
    
    const timer = page.locator('text=/00:0[0-9]/').first();
    await expect(timer).toHaveCSS('color', /rgb\(250, 176, 5\)|#fab005/i);
  });

  test('should go into overtime and display negative time in red', async ({ page }) => {
    // Set 2 seconds for faster testing
    await page.getByPlaceholder(/minutes|minutos/i).fill('0.033'); // ~2 seconds
    await page.getByRole('button', { name: /^SET|DEFINIR|ESTABLECER$/i }).click();
    
    await page.getByRole('button', { name: /^START$/i, exact: true }).click();
    await page.waitForTimeout(3000); // Wait for overtime
    
    await expect(page.locator('text=/OVERTIME|TEMPO EXTRA|TIEMPO EXTRA/i')).toBeVisible();
    await expect(page.locator('text=/-00:0[0-9]/').first()).toBeVisible();
    
    const timer = page.locator('text=/-00:0[0-9]/').first();
    await expect(timer).toHaveCSS('color', /rgb\(250, 82, 82\)|#fa5252/i);
  });

  test('should display custom round name', async ({ page }) => {
    await page.getByPlaceholder(/round name|nome da rodada|nombre de la ronda/i).fill('Round 1');
    await expect(page.locator('text=Round 1')).toBeVisible();
  });

  test('should persist round name and timer state in localStorage', async ({ page }) => {
    await page.getByPlaceholder(/round name|nome da rodada|nombre de la ronda/i).fill('Finals');
    await page.getByRole('button', { name: /BO3.*50/i }).click();
    
    await page.waitForTimeout(500); // Wait for localStorage to save
    await page.reload();
    await page.waitForTimeout(500); // Wait for page to load
    
    await expect(page.getByPlaceholder(/round name|nome da rodada|nombre de la ronda/i)).toHaveValue('Finals');
    await expect(page.locator('text=50:00')).toBeVisible();
  });

  test('should persist running timer state after reload', async ({ page }) => {
    await page.getByRole('button', { name: /BO1.*30/i }).click();
    await page.getByRole('button', { name: /^START$/i, exact: true }).click();
    await page.waitForTimeout(2000); // Wait 2 seconds
    
    await page.reload();
    await page.waitForTimeout(500);
    
    // Timer should show less than 30:00 (around 29:58 or 29:57)
    const timerText = await page.locator('text=/29:5[0-9]/').first().textContent();
    expect(timerText).toMatch(/29:5[0-9]/);
  });

  test('should display "Start Display" button when timer is configured', async ({ page }) => {
    await page.getByRole('button', { name: /BO1.*30/i }).click();
    await expect(page.getByRole('button', { name: /start display|iniciar exibição|iniciar pantalla/i })).toBeVisible();
  });

  test('should open display mode in new tab when clicking Start Display', async ({ page, context }) => {
    await page.getByRole('button', { name: /BO1.*30/i }).click();
    
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.getByRole('button', { name: /start display|iniciar exibição|iniciar pantalla/i }).click()
    ]);
    
    await newPage.waitForLoadState();
    expect(newPage.url()).toContain('/round-timer-display');
  });
});
