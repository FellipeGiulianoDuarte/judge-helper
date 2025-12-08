import { test, expect } from '@playwright/test';

test.describe('Table Judge Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/table-judge');
  });

  test('should display all action buttons with initial count 0', async ({ page }) => {
    const actions = ['Supporter', 'Energy', 'Stadium', 'Retreat', 'Other Game Action'];
    
    for (const action of actions) {
      const button = page.getByRole('button', { name: new RegExp(action, 'i') });
      await expect(button).toBeVisible();
      await expect(button).toContainText('0');
    }
  });

  test('should display Action Total with initial value 0', async ({ page }) => {
    await expect(page.getByText('Action Total')).toBeVisible();
    await expect(page.getByText('Action Total').locator('..').getByText('0')).toBeVisible();
  });

  test('should display timer with initial value 0s', async ({ page }) => {
    await expect(page.getByText('Time', { exact: true })).toBeVisible();
    await expect(page.getByText('0s', { exact: true })).toBeVisible();
  });

  test('should display START, STOP, and CLEAR ALL buttons', async ({ page }) => {
    await expect(page.getByRole('button', { name: /start/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /stop/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /clear all/i })).toBeVisible();
  });

  test('should increment action counter when clicking action button', async ({ page }) => {
    const supporterButton = page.getByRole('button', { name: /supporter/i });
    
    await supporterButton.click();
    await expect(supporterButton).toContainText('1');
  });

  test('should change once-per-turn action button to green after click', async ({ page }) => {
    const supporterButton = page.getByRole('button', { name: /supporter/i });
    
    await supporterButton.click();
    
    const bgColor = await supporterButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    const rgbaMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    expect(rgbaMatch).toBeTruthy();
    if (rgbaMatch) {
      const [, r, g, b] = rgbaMatch.map(Number);
      expect(g).toBeGreaterThan(r);
      expect(g).toBeGreaterThan(b);
    }
  });

  test('should update Action Total when clicking action buttons', async ({ page }) => {
    await page.getByRole('button', { name: /supporter/i }).click();
    await page.getByRole('button', { name: /energy/i }).click();
    
    const totalSection = page.locator('text=Action Total').locator('..');
    await expect(totalSection).toContainText('2');
  });

  test('Other Game Action should allow multiple increments (not once-per-turn)', async ({ page }) => {
    const otherActionButton = page.getByRole('button', { name: /other game action/i });
    
    await otherActionButton.click();
    await otherActionButton.click();
    await otherActionButton.click();
    
    await expect(otherActionButton).toContainText('3');
  });

  test('should start timer when clicking START', async ({ page }) => {
    await page.getByRole('button', { name: /start/i }).click();
    
    await page.waitForTimeout(1500);
    
    const timerText = await page.getByText(/^\d+s$/).textContent();
    const seconds = parseInt(timerText?.replace('s', '') || '0');
    expect(seconds).toBeGreaterThanOrEqual(1);
  });

  test('should stop timer when clicking STOP', async ({ page }) => {
    await page.getByRole('button', { name: /start/i }).click();
    await page.waitForTimeout(1500);
    await page.getByRole('button', { name: /stop/i }).click();
    
    const timerText1 = await page.getByText(/^\d+s$/).textContent();
    await page.waitForTimeout(1500);
    const timerText2 = await page.getByText(/^\d+s$/).textContent();
    
    expect(timerText1).toBe(timerText2);
  });

  test('should reset all counters and timer when clicking CLEAR ALL', async ({ page }) => {
    await page.getByRole('button', { name: /supporter/i }).click();
    await page.getByRole('button', { name: /energy/i }).click();
    await page.getByRole('button', { name: /start/i }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: /clear all/i }).click();
    
    const actions = ['Supporter', 'Energy', 'Stadium', 'Retreat', 'Other Game Action'];
    for (const action of actions) {
      const button = page.getByRole('button', { name: new RegExp(action, 'i') });
      await expect(button).toContainText('0');
    }
    
    await expect(page.getByText('0s', { exact: true })).toBeVisible();
  });

  test('should reset once-per-turn buttons color after CLEAR ALL', async ({ page }) => {
    const supporterButton = page.getByRole('button', { name: /supporter/i });
    
    await supporterButton.click();
    
    const greenBgColor = await supporterButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    await page.getByRole('button', { name: /clear all/i }).click();
    
    const resetBgColor = await supporterButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    expect(greenBgColor).not.toBe(resetBgColor);
  });

  test('should persist state in localStorage', async ({ page }) => {
    await page.getByRole('button', { name: /supporter/i }).click();
    await page.getByRole('button', { name: /stadium/i }).click();
    
    await page.reload();
    
    await expect(page.getByRole('button', { name: /supporter/i })).toContainText('1');
    await expect(page.getByRole('button', { name: /stadium/i })).toContainText('1');
  });

  test('should display seconds per action metric', async ({ page }) => {
    await expect(page.getByText(/s\/action/i)).toBeVisible();
  });

  test('should calculate seconds per action correctly (rounded down)', async ({ page }) => {
    // Make 4 actions
    await page.getByRole('button', { name: /supporter/i }).click();
    await page.getByRole('button', { name: /energy/i }).click();
    await page.getByRole('button', { name: /stadium/i }).click();
    await page.getByRole('button', { name: /retreat/i }).click();
    
    // Start timer and wait for ~60 seconds would be too slow
    // Instead, manually set timer to 60 and verify calculation
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('tableJudgeState') || '{}');
      state.timerSeconds = 60;
      localStorage.setItem('tableJudgeState', JSON.stringify(state));
    });
    
    await page.reload();
    
    // 60s / 4 actions = 15s/action
    await expect(page.getByText('15s/action')).toBeVisible();
  });

  test('should round down seconds per action with decimals', async ({ page }) => {
    // Make 3 actions
    await page.getByRole('button', { name: /supporter/i }).click();
    await page.getByRole('button', { name: /energy/i }).click();
    await page.getByRole('button', { name: /stadium/i }).click();
    
    // Set timer to 50 seconds
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('tableJudgeState') || '{}');
      state.timerSeconds = 50;
      localStorage.setItem('tableJudgeState', JSON.stringify(state));
    });
    
    await page.reload();
    
    // 50s / 3 actions = 16.666... -> should round down to 16
    await expect(page.getByText('16s/action')).toBeVisible();
  });

  test('should show 0s/action when no actions have been taken', async ({ page }) => {
    await page.evaluate(() => {
      const state = JSON.parse(localStorage.getItem('tableJudgeState') || '{}');
      state.timerSeconds = 30;
      localStorage.setItem('tableJudgeState', JSON.stringify(state));
    });
    
    await page.reload();
    
    await expect(page.getByText('0s/action')).toBeVisible();
  });

  test('should have decrement buttons for all actions', async ({ page }) => {
    const decrementButtons = page.getByRole('button', { name: '−' });
    await expect(decrementButtons).toHaveCount(5); // 5 action types
  });

  test('should decrement counter when clicking minus button', async ({ page }) => {
    const supporterButton = page.getByRole('button', { name: /supporter/i });
    
    // Increment first
    await supporterButton.click();
    await expect(supporterButton).toContainText('1');
    
    // Then decrement
    const decrementButton = page.getByRole('button', { name: '−' }).first();
    await decrementButton.click();
    await expect(supporterButton).toContainText('0');
  });

  test('decrement button should be disabled when counter is 0', async ({ page }) => {
    const decrementButton = page.getByRole('button', { name: '−' }).first();
    await expect(decrementButton).toBeDisabled();
  });

  test('decrement button should not affect once-per-turn restriction', async ({ page }) => {
    const supporterButton = page.getByRole('button', { name: /supporter/i });
    const decrementButton = page.getByRole('button', { name: '−' }).first();
    
    // Click supporter (once-per-turn)
    await supporterButton.click();
    await expect(supporterButton).toContainText('1');
    
    // Decrement back to 0
    await decrementButton.click();
    await expect(supporterButton).toContainText('0');
    
    // Should be able to increment again
    await supporterButton.click();
    await expect(supporterButton).toContainText('1');
  });

  test('should decrement other action multiple times', async ({ page }) => {
    const otherActionButton = page.getByRole('button', { name: /other game action/i });
    
    // Increment 3 times
    await otherActionButton.click();
    await otherActionButton.click();
    await otherActionButton.click();
    await expect(otherActionButton).toContainText('3');
    
    // Find the last decrement button (for "Other Game Action")
    const decrementButtons = page.getByRole('button', { name: '−' });
    const lastDecrementButton = decrementButtons.last();
    
    // Decrement once
    await lastDecrementButton.click();
    await expect(otherActionButton).toContainText('2');
    
    // Decrement again
    await lastDecrementButton.click();
    await expect(otherActionButton).toContainText('1');
  });
});

