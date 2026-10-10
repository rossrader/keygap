import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('malformed platforms load and empty app links override saved state', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('keygap.apps', 'slack'));
  await page.goto('/?p=constructor&apps=');
  await expect(page.locator('#headline')).toContainText('no known conflict');
  await expect(page.locator('[data-app="slack"]')).toHaveAttribute('aria-pressed', 'false');
  expect(new URL(page.url()).searchParams.get('apps')).toBe('');
});
test('scope, deletion keys and accessible descriptions', async ({ page }) => {
  await page.goto('/?p=mac&m=cmd&apps=vscode');
  await page.locator('[data-key="B"]').focus();
  await expect(page.locator('#inspectText')).toContainText('Toggle sidebar');
  await expect(page.locator('[data-key="B"]')).toHaveAccessibleDescription(/Toggle sidebar/);
  await page.goto('/?p=win&m=ctrl-alt&apps=');
  await expect(page.locator('[data-key="Delete"]')).toHaveAccessibleName(/taken by Windows/);
  await expect(page.locator('[data-key="Backspace"]')).toHaveAccessibleName(/no known conflict/);
  await page.keyboard.press('Control+Alt+Backspace');
  await expect(page.locator('#inspectText')).toContainText('No known conflict');
});
test('passive shortcut checks preserve focused tabs', async ({ page }) => {
  await page.goto('/?p=win&m=ctrl&apps=');
  const tab = page.locator('[data-combo="ctrl"]');
  await tab.focus();
  await page.keyboard.press('Control+Shift+K');
  await expect(tab).toBeFocused();
});
test('clipboard rejection offers a manual fallback', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.reject(new Error('Denied')) } }));
  await page.goto('/?apps=');
  await page.locator('#copyFree').click();
  await expect(page.locator('#copyText')).toBeFocused();
  await expect(page.locator('#copyText')).not.toHaveValue('');
  await expect(page.locator('#announce')).toContainText('Copy failed');
});
test('repeated copies restore a stable button label', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'clipboard', { value: { writeText: () => Promise.resolve() } }));
  await page.goto('/?apps=');
  await page.locator('#copyFree').click();
  await page.locator('#copyFree').click();
  await expect(page.locator('#copyFree')).toHaveText('Copy list', { timeout: 4000 });
});
test('keyboard navigation, dialogs, mobile layout and automated accessibility', async ({ page }) => {
  await page.goto('/?p=mac&m=cmd&apps=vscode');
  await page.locator('[data-key="A"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('[data-key="S"]')).toBeFocused();
  await page.locator('[data-open="about"]').click();
  await expect(page.locator('#aboutPanel')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-open="about"]')).toBeFocused();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(results.violations).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
