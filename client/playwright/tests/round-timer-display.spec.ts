import { test, expect } from '@playwright/test';

test.describe('Round Timer Display Page', () => {
  test.beforeEach(async ({ page }) => {
    // Set up timer configuration in localStorage
    await page.goto('/round-timer');
    await page.evaluate(() => {
      localStorage.setItem('roundTimer', JSON.stringify({
        roundName: 'Round 1',
        totalSeconds: 1800, // 30 minutes
        remainingSeconds: 1800,
        isRunning: false
      }));
    });
    await page.goto('/round-timer-display');
  });

  test('should display timer in large format', async ({ page }) => {
    await expect(page.locator('text=30:00').first()).toBeVisible();
  });

  test('should display round name', async ({ page }) => {
    await expect(page.locator('text=Round 1')).toBeVisible();
  });

  test('should display circular progress indicator', async ({ page }) => {
    const svg = page.locator('svg circle').first();
    await expect(svg).toBeVisible();
  });

  test('should start timer when clicking START', async ({ page }) => {
    await page.getByRole('button', { name: /^START|INICIAR$/i }).click();
    await page.waitForTimeout(1100);
    
    const timer = await page.locator('text=/29:5[0-9]/').textContent();
    expect(timer).toMatch(/29:5[0-9]/);
  });

  test('should update circular progress as time decreases', async ({ page }) => {
    const getPathD = async () => {
      return await page.locator('svg path').getAttribute('d');
    };
    
    const initialD = await getPathD();
    
    await page.getByRole('button', { name: /^START|INICIAR$/i }).click();
    await page.waitForTimeout(2000);
    
    const afterD = await getPathD();
    expect(afterD).not.toBe(initialD);
  });

  test('should show growing circle in opposite direction during overtime', async ({ page }) => {
    // Set very short time for testing
    await page.goto('/round-timer');
    await page.evaluate(() => {
      localStorage.setItem('roundTimer', JSON.stringify({
        roundName: 'Quick Test',
        totalSeconds: 2,
        remainingSeconds: 2,
        isRunning: false
      }));
    });
    await page.goto('/round-timer-display');
    
    await page.getByRole('button', { name: /^START|INICIAR$/i }).click();
    await page.waitForTimeout(3000); // Wait for overtime
    
    // Check that overtime indicator is visible
    await expect(page.locator('text=/OVERTIME|TEMPO EXTRA|TIEMPO EXTRA/i')).toBeVisible();
    await expect(page.locator('text=/-00:0[0-9]/').first()).toBeVisible();
  });

  test('should display timer in red during overtime', async ({ page }) => {
    await page.goto('/round-timer');
    await page.evaluate(() => {
      localStorage.setItem('roundTimer', JSON.stringify({
        roundName: 'Overtime Test',
        totalSeconds: 1,
        remainingSeconds: -5, // Already in overtime
        isRunning: false
      }));
    });
    await page.goto('/round-timer-display');
    
    const timer = page.locator('text=/-00:0[0-9]/').first();
    await expect(timer).toHaveCSS('color', /rgb\(250, 82, 82\)|#fa5252/i);
  });

  test('should persist timer state across page reloads in display mode', async ({ page }) => {
    await page.getByRole('button', { name: /^START|INICIAR$/i }).click();
    await page.waitForTimeout(2000);
    
    await page.reload();
    await page.waitForTimeout(500);
    
    // Timer should continue from where it left off (around 29:58)
    const timer = await page.locator('text=/29:5[0-9]/').first().textContent();
    expect(timer).toMatch(/29:5[0-9]/);
  });

  test('should have fullscreen layout without tabs', async ({ page }) => {
    // Check that navigation tabs are not visible
    await expect(page.getByRole('tab', { name: /table judge/i })).not.toBeVisible();
    await expect(page.getByRole('tab', { name: /deck check/i })).not.toBeVisible();
  });

  test('should pause and resume timer', async ({ page }) => {
    await page.getByRole('button', { name: /^START|INICIAR$/i }).click();
    await page.waitForTimeout(1100);
    
    await page.getByRole('button', { name: /PAUSE|PAUSAR/i }).click();
    const timerAfterPause = await page.locator('text=/29:5[0-9]/').textContent();
    
    await page.waitForTimeout(1000);
    const timerAfterWait = await page.locator('text=/29:5[0-9]/').textContent();
    
    expect(timerAfterPause).toBe(timerAfterWait);
  });
});
