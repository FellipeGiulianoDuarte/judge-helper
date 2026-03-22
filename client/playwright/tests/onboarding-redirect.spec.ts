import { test, expect } from '@playwright/test';

test.describe('Onboarding redirect bug (#4)', () => {
  test('should NOT show onboarding wizard after it has been completed', async ({ page }) => {
    // Set onboardingCompleted in localStorage before navigating
    await page.goto('/table-judge');
    await page.evaluate(() => {
      localStorage.setItem('onboardingCompleted', 'true');
    });

    // Reload the page (simulates opening a new tab with same localStorage)
    await page.goto('/table-judge');

    // Wait enough time for the auto-start timeout (800ms + buffer)
    await page.waitForTimeout(1500);

    // The intro.js overlay should NOT be visible
    const overlay = page.locator('.introjs-overlay');
    await expect(overlay).toHaveCount(0);
  });

  test('should NOT show onboarding when navigating to round-timer tab after completion', async ({ page }) => {
    // Mark onboarding as completed
    await page.goto('/table-judge');
    await page.evaluate(() => {
      localStorage.setItem('onboardingCompleted', 'true');
    });

    // Navigate to round-timer tab
    await page.goto('/round-timer');
    await page.waitForTimeout(1500);

    // The intro.js overlay should NOT be visible
    const overlay = page.locator('.introjs-overlay');
    await expect(overlay).toHaveCount(0);
  });

  test('should NOT show onboarding when navigating to time-extensions tab after completion', async ({ page }) => {
    // Mark onboarding as completed
    await page.goto('/table-judge');
    await page.evaluate(() => {
      localStorage.setItem('onboardingCompleted', 'true');
    });

    // Navigate to time-extensions tab
    await page.goto('/time-extensions');
    await page.waitForTimeout(1500);

    // The intro.js overlay should NOT be visible
    const overlay = page.locator('.introjs-overlay');
    await expect(overlay).toHaveCount(0);
  });

  test('should mark onboarding as completed when user skips the wizard', async ({ page }) => {
    // Each Playwright test gets a fresh browser context, so localStorage is clean.
    // The wizard should auto-start since onboardingCompleted is not set.
    await page.goto('/table-judge');

    // Wait for the wizard to auto-start (800ms auto-start delay + 300ms startWizard delay + DOM)
    const skipButton = page.locator('.introjs-skipbutton');
    await skipButton.waitFor({ state: 'visible', timeout: 5000 });

    // Skip/close the wizard
    await skipButton.click();

    // Wait for the exit handler to complete
    await page.waitForTimeout(500);

    // Verify that onboardingCompleted is now set to 'true' in localStorage
    const completed = await page.evaluate(() => {
      return localStorage.getItem('onboardingCompleted');
    });
    expect(completed).toBe('true');
  });

  test('should NOT auto-start onboarding on reload after wizard was skipped', async ({ page }) => {
    // Fresh context - wizard should auto-start on /table-judge
    await page.goto('/table-judge');

    // Wait for the wizard to auto-start
    const skipButton = page.locator('.introjs-skipbutton');
    await skipButton.waitFor({ state: 'visible', timeout: 5000 });

    // Skip the wizard
    await skipButton.click();
    await page.waitForTimeout(500);

    // Now reload the page (simulates opening in a new browser tab with same localStorage)
    await page.reload();
    await page.waitForTimeout(1500);

    // Wizard should NOT appear again
    const overlayAfterReload = page.locator('.introjs-overlay');
    await expect(overlayAfterReload).toHaveCount(0);
  });

  test('should NOT redirect to onboarding when opening round-timer directly as first-time user', async ({ page }) => {
    // Fresh context - no onboardingCompleted set (first-time user)
    // Navigate directly to round-timer (e.g., user opened a bookmarked URL)
    await page.goto('/round-timer');

    // Wait enough time for the auto-start logic
    await page.waitForTimeout(1500);

    // User should stay on round-timer, NOT be redirected to table-judge
    expect(page.url()).toContain('/round-timer');

    // No wizard overlay should be shown
    const overlay = page.locator('.introjs-overlay');
    await expect(overlay).toHaveCount(0);

    // Onboarding should be marked completed to prevent future auto-start interference
    const completed = await page.evaluate(() => {
      return localStorage.getItem('onboardingCompleted');
    });
    expect(completed).toBe('true');
  });

  test('timer on table-judge page should be accessible without onboarding blocking', async ({ page }) => {
    // Mark onboarding as completed
    await page.goto('/table-judge');
    await page.evaluate(() => {
      localStorage.setItem('onboardingCompleted', 'true');
    });

    // Navigate directly to table-judge
    await page.goto('/table-judge');
    await page.waitForTimeout(1500);

    // Timer controls should be visible and usable (no onboarding overlay blocking)
    await expect(page.getByRole('button', { name: /start/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /stop/i })).toBeVisible();

    // No overlay blocking interactions
    const overlay = page.locator('.introjs-overlay');
    await expect(overlay).toHaveCount(0);
  });

  test('should be able to manually restart onboarding from info button after completion', async ({ page }) => {
    // Mark onboarding as completed
    await page.goto('/table-judge');
    await page.evaluate(() => {
      localStorage.setItem('onboardingCompleted', 'true');
    });

    await page.goto('/table-judge');
    await page.waitForTimeout(1000);

    // Click the info button to manually start the wizard
    const infoButton = page.locator('[data-wizard-info]');
    await expect(infoButton).toBeVisible();
    await infoButton.click();

    // Wizard should appear
    await page.waitForTimeout(1500);
    const tooltip = page.locator('.introjs-tooltip');
    await expect(tooltip).toBeVisible();
  });
});
