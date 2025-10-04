import { expect, test } from '@playwright/test';
import { setupApiMocks } from './fixtures/api-mocks';

test.describe('Photo Viewing', () => {
	test('home page loads successfully', async ({ page }) => {
		await setupApiMocks(page);
		await page.goto('/');

		// Home page should load (even if API fails on SSR, client-side mocks will work)
		await expect(page).toHaveTitle(/Tim's Pictures/);
	});

	test('can navigate to picture page directly', async ({ page }) => {
		await setupApiMocks(page);
		// Navigate directly to a picture page (using our mock picture ID)
		await page.goto('/pictures/43c89fe5-8fdb-4948-b973-a9a4539931ee');

		// Picture page should load
		await expect(page).toHaveURL(/\/pictures\/[\w-]+/);
	});
});
