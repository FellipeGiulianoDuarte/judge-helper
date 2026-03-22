import { test, expect } from '@playwright/test';

test.describe('Documents Page - Language Translation', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh and set English as default
    await page.goto('/docs');
    await page.evaluate(() => {
      localStorage.setItem('locale', 'en');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should have document links with EN paths when language is English', async ({ page }) => {
    // Language is already set to EN via beforeEach

    // Verify document cards contain English URLs
    const documentCards = page.locator('[data-testid="document-card"]');
    const count = await documentCards.count();
    expect(count).toBeGreaterThan(0);

    // Check that PDF links use English URL patterns
    const tournamentRulesLink = documentCards.filter({ hasText: 'Tournament Rules' });
    await expect(tournamentRulesLink).toHaveAttribute('href', /\/cms2\//);
    await expect(tournamentRulesLink).toHaveAttribute('href', /-en\.pdf$/);

    const penaltyLink = documentCards.filter({ hasText: 'Penalty Guidelines' });
    await expect(penaltyLink).toHaveAttribute('href', /\/cms2\//);
    await expect(penaltyLink).toHaveAttribute('href', /-en\.pdf$/);
  });

  test('should update document links to PT paths when language is Portuguese', async ({ page }) => {
    // Switch to Portuguese
    await page.locator('[data-wizard-language]').click();
    await page.getByRole('option', { name: 'PT' }).click();

    // Wait for language change to take effect
    await page.waitForTimeout(500);

    // Verify document cards contain Portuguese URLs
    const documentCards = page.locator('[data-testid="document-card"]');

    // Check that PDF links use Portuguese URL patterns: /cms2-pt-br/ and -br.pdf
    const tournamentRulesLink = documentCards.filter({ hasText: /Manual de Regras|Tournament Rules/ });
    await expect(tournamentRulesLink).toHaveAttribute('href', /\/cms2-pt-br\//);
    await expect(tournamentRulesLink).toHaveAttribute('href', /-br\.pdf$/);

    const penaltyLink = documentCards.filter({ hasText: /Diretrizes de Penalidades|Penalty Guidelines/ });
    await expect(penaltyLink).toHaveAttribute('href', /\/cms2-pt-br\//);
    await expect(penaltyLink).toHaveAttribute('href', /-br\.pdf$/);
  });

  test('should switch links back to EN when switching from PT to EN', async ({ page }) => {
    // Switch to Portuguese first
    await page.locator('[data-wizard-language]').click();
    await page.getByRole('option', { name: 'PT' }).click();
    await page.waitForTimeout(500);

    // Now switch back to English
    await page.locator('[data-wizard-language]').click();
    await page.getByRole('option', { name: 'EN' }).click();
    await page.waitForTimeout(500);

    // Verify document cards contain English URLs again
    const documentCards = page.locator('[data-testid="document-card"]');

    const tournamentRulesLink = documentCards.filter({ hasText: 'Tournament Rules' });
    await expect(tournamentRulesLink).toHaveAttribute('href', /\/cms2\//);
    await expect(tournamentRulesLink).toHaveAttribute('href', /-en\.pdf$/);
  });

  test('all PDF document links should update their cms path for PT', async ({ page }) => {
    // Switch to Portuguese
    await page.locator('[data-wizard-language]').click();
    await page.getByRole('option', { name: 'PT' }).click();
    await page.waitForTimeout(500);

    // Get all document card hrefs
    const documentCards = page.locator('[data-testid="document-card"]');
    const count = await documentCards.count();

    for (let i = 0; i < count; i++) {
      const href = await documentCards.nth(i).getAttribute('href');
      if (href && href.includes('pokemon.com/static-assets')) {
        // All static-assets PDF links should use PT path
        expect(href).toContain('/cms2-pt-br/');
        // URLs end with either -br.pdf or _br.pdf depending on the original naming convention
        expect(href).toMatch(/[_-]br\.pdf$/);
      }
    }
  });

  test('non-PDF links should not be affected by language change', async ({ page }) => {
    // Switch to Portuguese
    await page.locator('[data-wizard-language]').click();
    await page.getByRole('option', { name: 'PT' }).click();
    await page.waitForTimeout(500);

    // The judgeball.com link should remain unchanged
    const documentCards = page.locator('[data-testid="document-card"]');
    const count = await documentCards.count();

    let foundJudgeball = false;
    for (let i = 0; i < count; i++) {
      const href = await documentCards.nth(i).getAttribute('href');
      if (href && href.includes('judgeball.com')) {
        foundJudgeball = true;
        expect(href).toBe('https://www.judgeball.com/guidebook/tcg/attack-steps/');
      }
    }
    expect(foundJudgeball).toBe(true);
  });
});
