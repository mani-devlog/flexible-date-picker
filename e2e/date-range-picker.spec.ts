import { test, expect } from '@playwright/test';

test.describe('Date range picker', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('selects a range and applies', async ({ page }) => {
    const section = page.locator('section').filter({ hasText: 'Date Range Picker' });
    const trigger = section.locator('.flex-picker-trigger');
    await trigger.click();

    const dialog = page.getByRole('dialog', { name: 'Choose date range' });
    await expect(dialog).toBeVisible();

    await dialog.locator('.flex-day:not([disabled])').first().click();
    await dialog.locator('.flex-day:not([disabled])').nth(5).click();

    await dialog.getByRole('button', { name: 'Apply' }).click();
    await expect(dialog).not.toBeVisible();
    await expect(trigger).not.toHaveText('Select date range');
  });
});
