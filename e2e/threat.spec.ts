import { test, expect } from '@playwright/test';
test('threatroom loads and logs threat', async ({ page }) => {
  await page.goto('http://localhost:3000/room/demo');
  await expect(page.locator('h1')).toContainText('ThreatRoom: demo');
  await page.locator('.title-input').fill('Brute force attempt');
  await page.locator('.source-input').fill('ssh');
  await page.locator('.severity-input').selectOption('high');
  await page.locator('.mitre-input').fill('T1110');
  await page.locator('.add-btn').click();
  await expect(page.locator('.threat-list').locator('div').first()).toBeVisible();
});