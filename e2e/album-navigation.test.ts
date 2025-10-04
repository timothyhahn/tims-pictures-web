import { expect, test } from '@playwright/test';
import { setupApiMocks } from './fixtures/api-mocks';

test.describe('Album Navigation', () => {
	test('can navigate from albums page to an album', async ({ page }) => {
		await setupApiMocks(page);
		await page.goto('/albums');

		// Wait for albums to load
		await expect(page.getByRole('heading', { name: 'Albums' })).toBeVisible();

		// Click on the first album card
		const firstAlbum = page.locator('a[href^="/albums/"]').first();
		await expect(firstAlbum).toBeVisible();
		await firstAlbum.click();

		// Should navigate to album page
		await expect(page).toHaveURL(/\/albums\/[\w-]+/);
	});

	test('album page displays album name', async ({ page }) => {
		await setupApiMocks(page);
		// Navigate to albums page first
		await page.goto('/albums');
		const firstAlbum = page.locator('a[href^="/albums/"]').first();
		await firstAlbum.click();

		// Wait for album header to be visible
		const heading = page.locator('h1').first();
		await expect(heading).toBeVisible();
	});

	test('can navigate back to albums from an album page', async ({ page }) => {
		await setupApiMocks(page);
		await page.goto('/albums');
		const firstAlbum = page.locator('a[href^="/albums/"]').first();
		await firstAlbum.click();

		// Click on the "Albums" link in navigation
		const albumsLink = page.getByRole('link', { name: 'Albums' });
		await albumsLink.click();

		// Should be back on albums page
		await expect(page).toHaveURL('/albums');
		await expect(page.getByRole('heading', { name: 'Albums' })).toBeVisible();
	});
});
