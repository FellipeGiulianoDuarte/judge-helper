import { test, expect } from '@playwright/test';

test.describe('Onboarding Wizard - Time Extensions Category Steps', () => {
  test.beforeEach(async ({ page }) => {
    // Clear onboarding state so wizard can be triggered manually
    await page.goto('/time-extensions');
    await page.evaluate(() => {
      localStorage.setItem('onboardingCompleted', 'true');
    });
    await page.reload();
  });

  test('should have wizard step targeting the category selector element', async ({ page }) => {
    // The category selector should have a data-wizard-category-selector attribute
    const categoryWizardTarget = page.locator('[data-wizard-category-selector]');
    await expect(categoryWizardTarget).toBeVisible();
  });

  test('should have wizard step targeting the recommended extensions table', async ({ page }) => {
    // The recommended extensions section should have a data-wizard-recommended-extensions attribute
    const recommendedWizardTarget = page.locator('[data-wizard-recommended-extensions]');
    await expect(recommendedWizardTarget).toBeVisible();
  });

  test('should show category selector onboarding step with correct text', async ({ page }) => {
    // Start the wizard by clearing onboarding state and triggering it
    await page.evaluate(() => {
      localStorage.removeItem('onboardingCompleted');
    });
    await page.reload();

    // Wait for the wizard to auto-start and navigate through steps until we reach time extensions
    // The wizard starts on table-judge, so we need to trigger it manually on time-extensions
    await page.evaluate(() => {
      localStorage.setItem('onboardingCompleted', 'true');
    });
    await page.goto('/time-extensions');

    // Use the tutorial button to restart the wizard
    const tutorialButton = page.getByRole('button', { name: /tutorial/i });
    await expect(tutorialButton).toBeVisible();
    await tutorialButton.click();

    // The wizard should eventually show a step that mentions categories (Junior, Senior, Masters)
    // Navigate through steps until reaching the category selector step
    // The category selector steps are on the /time-extensions tab
    // We need to click Next until we reach the time extensions steps

    // Wait for the wizard overlay to appear
    await expect(page.locator('.introjs-tooltip')).toBeVisible({ timeout: 10000 });

    // Navigate through all prior steps to reach the time extensions category step
    // There are 3 global + 9 table judge + 4 deck check + 5 round timer = 21 steps before time extensions
    // Time extensions has: extensionForm, extensionTable, then our new steps
    // We need to get to step index that has categorySelector

    // Keep clicking Next until we find the category selector step or run out of steps
    let foundCategoryStep = false;
    for (let i = 0; i < 30; i++) {
      const tooltipText = await page.locator('.introjs-tooltip').textContent();
      if (tooltipText && tooltipText.includes('Junior') && tooltipText.includes('Senior') && tooltipText.includes('Masters')) {
        foundCategoryStep = true;
        break;
      }

      const nextButton = page.locator('.introjs-nextbutton');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        // Wait for potential navigation between tabs
        await page.waitForTimeout(600);
        // Wait for tooltip to be visible again after navigation
        await page.locator('.introjs-tooltip').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      } else {
        break;
      }
    }

    expect(foundCategoryStep).toBe(true);
  });

  test('should show recommended extensions onboarding step with correct text', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('onboardingCompleted', 'true');
    });
    await page.goto('/time-extensions');

    const tutorialButton = page.getByRole('button', { name: /tutorial/i });
    await expect(tutorialButton).toBeVisible();
    await tutorialButton.click();

    await expect(page.locator('.introjs-tooltip')).toBeVisible({ timeout: 10000 });

    // Navigate through all steps looking for the recommended extensions step
    let foundRecommendedStep = false;
    for (let i = 0; i < 30; i++) {
      const tooltipText = await page.locator('.introjs-tooltip').textContent();
      if (tooltipText && tooltipText.includes('recommended') || tooltipText && tooltipText.includes('Recommended')) {
        // Check if this is specifically about recommended time extensions
        if (tooltipText && (tooltipText.includes('category') || tooltipText.includes('selected category'))) {
          foundRecommendedStep = true;
          break;
        }
      }

      const nextButton = page.locator('.introjs-nextbutton');
      if (await nextButton.isVisible()) {
        await nextButton.click();
        await page.waitForTimeout(600);
        await page.locator('.introjs-tooltip').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      } else {
        break;
      }
    }

    expect(foundRecommendedStep).toBe(true);
  });
});
