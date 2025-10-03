import { expect, test } from '@playwright/test';

test('home page loads', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/Tim's Pictures/);
});

test('albums page displays heading', async ({ page }) => {
	await page.goto('/albums');
	await expect(page.getByRole('heading', { name: 'Albums' })).toBeVisible();
});

test('health check endpoint works', async ({ page }) => {
	const response = await page.request.get('/health');
	expect(response.ok()).toBeTruthy();
	const body = await response.json();
	expect(body.status).toBe('ok');
});
