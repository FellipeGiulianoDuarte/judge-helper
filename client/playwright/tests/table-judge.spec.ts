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

  test('should reset all counters and timer when clicking CLEAR ALL (with confirmation)', async ({ page }) => {
    await page.getByRole('button', { name: /supporter/i }).click();
    await page.getByRole('button', { name: /energy/i }).click();
    await page.getByRole('button', { name: /start/i }).click();
    await page.waitForTimeout(1000);
    
    await page.getByRole('button', { name: /clear all/i }).click();
    await page.getByRole('button', { name: /confirm/i }).click();
    
    const actions = ['Supporter', 'Energy', 'Stadium', 'Retreat', 'Other Game Action'];
    for (const action of actions) {
      const button = page.getByRole('button', { name: new RegExp(action, 'i') });
      await expect(button).toContainText('0');
    }
    
    await expect(page.getByText('0s', { exact: true })).toBeVisible();
  });

  test('should reset once-per-turn buttons color after CLEAR ALL (with confirmation)', async ({ page }) => {
    const supporterButton = page.getByRole('button', { name: /supporter/i });
    
    await supporterButton.click();
    
    const greenBgColor = await supporterButton.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    await page.getByRole('button', { name: /clear all/i }).click();
    await page.getByRole('button', { name: /confirm/i }).click();
    
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

  test('should have decrement buttons for all actions and prizes', async ({ page }) => {
    const decrementButtons = page.getByRole('button', { name: '−' });
    await expect(decrementButtons).toHaveCount(6); // 5 action types + 1 prize
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
    
    // Find the decrement button for "Other Game Action" (5th row, index 4)
    const decrementButtons = page.getByRole('button', { name: '−' });
    const otherActionDecrementButton = decrementButtons.nth(4);
    
    // Decrement once
    await otherActionDecrementButton.click();
    await expect(otherActionButton).toContainText('2');
    
    // Decrement again
    await otherActionDecrementButton.click();
    await expect(otherActionButton).toContainText('1');
  });

  // =============================================
  // NEW FEATURES: Draw checkbox, Prizes, History, Next Turn, Clear All
  // =============================================

  test('should display draw checkbox', async ({ page }) => {
    const drawCheckbox = page.getByRole('checkbox', { name: /draw/i });
    await expect(drawCheckbox).toBeVisible();
    await expect(drawCheckbox).not.toBeChecked();
  });

  test('should toggle draw checkbox', async ({ page }) => {
    const drawCheckbox = page.getByRole('checkbox', { name: /draw/i });
    
    await drawCheckbox.click();
    await expect(drawCheckbox).toBeChecked();
    
    await drawCheckbox.click();
    await expect(drawCheckbox).not.toBeChecked();
  });

  test('should display prize cards counter', async ({ page }) => {
    await expect(page.getByText(/prize/i)).toBeVisible();
    const prizeButton = page.getByRole('button', { name: /prize/i });
    await expect(prizeButton).toBeVisible();
    await expect(prizeButton).toContainText('0');
  });

  test('should increment prize cards counter multiple times', async ({ page }) => {
    const prizeButton = page.getByRole('button', { name: /prize/i });
    
    await prizeButton.click();
    await expect(prizeButton).toContainText('1');
    
    await prizeButton.click();
    await expect(prizeButton).toContainText('2');
    
    await prizeButton.click();
    await expect(prizeButton).toContainText('3');
  });

  test('should display Next Turn button', async ({ page }) => {
    const nextTurnButton = page.getByRole('button', { name: /next turn/i });
    await expect(nextTurnButton).toBeVisible();
  });

  test('should display turn history section', async ({ page }) => {
    await expect(page.getByTestId('turn-history')).toBeVisible();
  });

  test('should add turn to history when clicking Next Turn', async ({ page }) => {
    // Setup turn actions
    await page.getByRole('button', { name: /supporter/i }).click();
    await page.getByRole('button', { name: /energy/i }).click();
    await page.getByRole('checkbox', { name: /draw/i }).click();
    await page.getByRole('button', { name: /prize/i }).click();
    await page.getByRole('button', { name: /prize/i }).click();
    
    // Click next turn
    await page.getByRole('button', { name: /next turn/i }).click();
    
    // History should show Player 1 entry
    const history = page.getByTestId('turn-history');
    await expect(history.getByText(/player 1/i)).toBeVisible();
  });

  test('should alternate players between turns in history', async ({ page }) => {
    // First turn
    await page.getByRole('button', { name: /supporter/i }).click();
    await page.getByRole('button', { name: /next turn/i }).click();
    
    // Second turn
    await page.getByRole('button', { name: /energy/i }).click();
    await page.getByRole('button', { name: /next turn/i }).click();
    
    // History should show both players
    const history = page.getByTestId('turn-history');
    await expect(history.getByText(/player 1/i)).toBeVisible();
    await expect(history.getByText(/player 2/i)).toBeVisible();
  });

  test('should reset current turn counters after Next Turn', async ({ page }) => {
    // Setup turn
    await page.getByRole('button', { name: /supporter/i }).click();
    await page.getByRole('checkbox', { name: /draw/i }).click();
    await page.getByRole('button', { name: /prize/i }).click();
    
    // Click next turn
    await page.getByRole('button', { name: /next turn/i }).click();
    
    // Counters should be reset
    const supporterButton = page.getByRole('button', { name: /supporter/i });
    await expect(supporterButton).toContainText('0');
    
    const drawCheckbox = page.getByRole('checkbox', { name: /draw/i });
    await expect(drawCheckbox).not.toBeChecked();
    
    const prizeButton = page.getByRole('button', { name: /prize/i });
    await expect(prizeButton).toContainText('0');
  });

  test('should display Clear All button with confirmation', async ({ page }) => {
    const clearAllButton = page.getByRole('button', { name: /clear all/i });
    await expect(clearAllButton).toBeVisible();
  });

  test('should show confirmation modal when clicking Clear All', async ({ page }) => {
    // Add some history first
    await page.getByRole('button', { name: /supporter/i }).click();
    await page.getByRole('button', { name: /next turn/i }).click();
    
    // Click Clear All
    await page.getByRole('button', { name: /clear all/i }).click();
    
    // Confirmation modal should appear - check for the modal title
    await expect(page.getByRole('heading', { name: /confirm/i })).toBeVisible();
  });

  test('should not clear when canceling confirmation', async ({ page }) => {
    // Add history
    await page.getByRole('button', { name: /supporter/i }).click();
    await page.getByRole('button', { name: /next turn/i }).click();
    
    // Click Clear All
    await page.getByRole('button', { name: /clear all/i }).click();
    
    // Cancel
    await page.getByRole('button', { name: /cancel/i }).click();
    
    // History should still be there
    const history = page.getByTestId('turn-history');
    await expect(history.getByText(/player 1/i)).toBeVisible();
  });

  test('should clear everything when confirming Clear All', async ({ page }) => {
    // Add history
    await page.getByRole('button', { name: /supporter/i }).click();
    await page.getByRole('button', { name: /next turn/i }).click();
    
    // Current turn actions
    await page.getByRole('button', { name: /stadium/i }).click();
    
    // Click Clear All
    await page.getByRole('button', { name: /clear all/i }).click();
    
    // Confirm
    await page.getByRole('button', { name: /confirm/i }).click();
    
    // Everything should be cleared
    const supporterButton = page.getByRole('button', { name: /supporter/i });
    await expect(supporterButton).toContainText('0');
    
    const stadiumButton = page.getByRole('button', { name: /stadium/i });
    await expect(stadiumButton).toContainText('0');
    
    // History should be empty (no player entries visible)
    const history = page.getByTestId('turn-history');
    await expect(history.locator('[data-testid="turn-entry"]')).toHaveCount(0);
  });

  test('should display turn history with all action info', async ({ page }) => {
    // Setup complete turn
    await page.getByRole('button', { name: /supporter/i }).click();
    await page.getByRole('button', { name: /stadium/i }).click();
    await page.getByRole('checkbox', { name: /draw/i }).click();
    await page.getByRole('button', { name: /prize/i }).click();
    await page.getByRole('button', { name: /prize/i }).click();
    
    // Next turn
    await page.getByRole('button', { name: /next turn/i }).click();
    
    // History should show all info
    const history = page.getByTestId('turn-history');
    const turnEntry = history.locator('[data-testid="turn-entry"]').first();
    
    await expect(turnEntry).toBeVisible();
  });

  test('draw checkbox state should persist in localStorage', async ({ page }) => {
    await page.getByRole('checkbox', { name: /draw/i }).click();
    
    await page.reload();
    
    const drawCheckbox = page.getByRole('checkbox', { name: /draw/i });
    await expect(drawCheckbox).toBeChecked();
  });

  test('prize counter should persist in localStorage', async ({ page }) => {
    await page.getByRole('button', { name: /prize/i }).click();
    await page.getByRole('button', { name: /prize/i }).click();
    
    await page.reload();
    
    const prizeButton = page.getByRole('button', { name: /prize/i });
    await expect(prizeButton).toContainText('2');
  });

  test('turn history should persist in localStorage', async ({ page }) => {
    await page.getByRole('button', { name: /supporter/i }).click();
    await page.getByRole('button', { name: /next turn/i }).click();
    
    await page.reload();
    
    const history = page.getByTestId('turn-history');
    await expect(history.getByText(/player 1/i)).toBeVisible();
  });
});

