import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('should not have automatically detectable accessibility issues on home page', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have automatically detectable accessibility issues on algorithm page', async ({ page }) => {
    await page.goto('/visualize/sorting/bubble-sort');
    
    // Wait for page to be fully loaded
    await page.waitForSelector('[data-testid="pseudocode-tab"]', { timeout: 5000 });
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/visualize/sorting/bubble-sort');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocused).toBeDefined();
    
    // Check for visible focus indicator
    const focusOutline = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el) return null;
      const styles = window.getComputedStyle(el);
      return styles.outlineWidth;
    });
    
    expect(focusOutline).not.toBe('0px');
  });

  test('should have aria-live region for status updates', async ({ page }) => {
    await page.goto('/visualize/sorting/bubble-sort');
    
    const liveRegion = await page.locator('[aria-live="polite"]');
    await expect(liveRegion).toBeAttached();
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/visualize/sorting/bubble-sort');
    
    // Wait for log tab
    await page.waitForSelector('[data-testid="log-tab"]', { timeout: 5000 });
    
    // Click log tab
    const logTab = page.locator('button:has-text("Log")');
    await logTab.click();
    
    // Focus the log container
    const logContainer = page.locator('[data-testid="virtualized-log-container"]');
    await logContainer.focus();
    
    // Test keyboard navigation (if rows exist)
    const rows = await page.locator('[data-testid^="log-row-"]').count();
    if (rows > 0) {
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      
      // Verify navigation worked
      const activeRow = page.locator('[data-testid^="log-row-"].active');
      await expect(activeRow).toBeVisible();
    }
  });
});
