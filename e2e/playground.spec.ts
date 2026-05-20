import { test, expect } from '@playwright/test';

test.describe('FlexibleDatePicker playground', () => {
  test('loads playground and shows pickers', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: 'FlexibleDatePicker' })).toBeVisible();
    await expect(page.getByText('Date Picker (Reactive Forms)')).toBeVisible();
  });

  test('opens date picker popup', async ({ page }) => {
    await page.goto('/');
    const trigger = page.locator('.flex-picker-trigger').first();
    await trigger.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('grid')).toBeVisible();
  });

  test('toggles dark mode', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Dark mode' }).click();
    await expect(page.locator('html.dark')).toBeVisible();
  });
});
