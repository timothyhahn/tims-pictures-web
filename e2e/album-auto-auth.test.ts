import { expect, test } from '@playwright/test';

test.describe('Album auto-auth via query param', () => {
	test('correct password redirects to album and strips query param', async ({ page }) => {
		await page.goto('/albums/secret-album?password=secret-password');

		// Should redirect to the clean URL
		await expect(page).toHaveURL('/albums/secret-album');

		// Should display the album (not the auth page)
		await expect(page.getByRole('heading', { name: 'Secret Album' })).toBeVisible();
	});

	test('wrong password redirects to auth page', async ({ page }) => {
		await page.goto('/albums/secret-album?password=wrong');

		// Should redirect to the auth page
		await expect(page).toHaveURL('/albums/secret-album/auth');

		// Should show the password form
		await expect(page.getByRole('heading', { name: 'Password Required' })).toBeVisible();
	});

	test('public album with password param just strips the param', async ({ page }) => {
		await page.goto('/albums/test-album?password=anything');

		// Should redirect to the clean URL
		await expect(page).toHaveURL('/albums/test-album');

		// Should display the album normally
		const heading = page.locator('h1').first();
		await expect(heading).toBeVisible();
	});

	test('private album without password param redirects to auth', async ({ page }) => {
		await page.goto('/albums/secret-album');

		// Should redirect to the auth page
		await expect(page).toHaveURL('/albums/secret-album/auth');
	});
});
