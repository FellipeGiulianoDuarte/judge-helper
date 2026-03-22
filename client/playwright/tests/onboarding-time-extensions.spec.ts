import { test, expect } from '@playwright/test';

test.describe('Onboarding Wizard - Time Extensions Category Steps', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/time-extensions');
    await page.evaluate(() => {
      localStorage.setItem('onboardingCompleted', 'true');
    });
    await page.reload();
  });

  test('should have wizard step targeting the category selector element', async ({ page }) => {
    const categoryWizardTarget = page.locator('[data-wizard-category-selector]');
    await expect(categoryWizardTarget).toBeVisible();
  });

  test('should show category selector onboarding step with correct text', async ({ page }) => {
    await page.evaluate(() => {
      localStorage.setItem('onboardingCompleted', 'true');
    });
    await page.goto('/time-extensions');

    const tutorialButton = page.getByRole('button', { name: /tutorial/i });
    await expect(tutorialButton).toBeVisible();
    await tutorialButton.click();

    await expect(page.locator('.introjs-tooltip')).toBeVisible({ timeout: 10000 });

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
        await page.waitForTimeout(600);
        await page.locator('.introjs-tooltip').waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
      } else {
        break;
      }
    }

    expect(foundCategoryStep).toBe(true);
  });
});
