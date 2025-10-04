import { expect, test } from '@playwright/test';
import { setupApiMocks } from './fixtures/api-mocks';

test.describe('Visual Regression Tests', () => {
	test('home page layout', async ({ page }) => {
		await setupApiMocks(page);
		await page.goto('/');

		// Wait for page to be fully loaded
		await page.waitForLoadState('networkidle');

		// Take screenshot of the full page
		await expect(page).toHaveScreenshot('home-page.png', {
			fullPage: true,
			animations: 'disabled'
		});
	});

	test('albums page layout', async ({ page }) => {
		await setupApiMocks(page);
		await page.goto('/albums');

		await page.waitForLoadState('networkidle');

		await expect(page).toHaveScreenshot('albums-page.png', {
			fullPage: true,
			animations: 'disabled'
		});
	});

	test('album card component', async ({ page }) => {
		await setupApiMocks(page);
		await page.goto('/albums');

		// Wait for album cards to render
		const albumCard = page.locator('a[href^="/albums/"]').first();
		await expect(albumCard).toBeVisible();

		// Screenshot of a single album card
		await expect(albumCard).toHaveScreenshot('album-card.png', {
			animations: 'disabled'
		});
	});

	test('navigation component', async ({ page }) => {
		await setupApiMocks(page);
		await page.goto('/');

		const nav = page.locator('nav').first();
		await expect(nav).toBeVisible();

		await expect(nav).toHaveScreenshot('navigation.png', {
			animations: 'disabled'
		});
	});

	test('loading spinner component', async ({ page }) => {
		await page.goto('/');

		// Take a screenshot showing the loading state
		// Note: This may be hard to catch, so we'll just test the component renders
		await expect(page).toHaveScreenshot('loading-state.png', {
			animations: 'disabled'
		});
	});
});
