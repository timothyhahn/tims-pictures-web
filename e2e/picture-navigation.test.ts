import { expect, test } from '@playwright/test';
import { setupApiMocks, mockPictures } from './fixtures/api-mocks';

test.describe('Picture Navigation', () => {
	test.beforeEach(async ({ page }) => {
		await setupApiMocks(page);

		await page.addInitScript(
			(mockData) => {
				sessionStorage.setItem(
					'pictureNavState',
					JSON.stringify({
						pictures: mockData.pictures,
						albumId: mockData.albumId,
						timestamp: Date.now()
					})
				);
			},
			{
				pictures: mockPictures.data,
				albumId: mockPictures.data[0].album_id
			}
		);
	});

	test('can navigate between pictures using arrow keys', async ({ page }) => {
		await page.goto(`/pictures/${mockPictures.data[0].id}?back=album`);
		await expect(page.locator('img.lightbox-image')).toBeVisible();

		await page.keyboard.press('ArrowRight');
		await expect(page).toHaveURL(`/pictures/${mockPictures.data[1].id}?back=album`);
		await expect(page.locator('img.lightbox-image')).toBeVisible();

		await page.keyboard.press('ArrowLeft');
		await expect(page).toHaveURL(`/pictures/${mockPictures.data[0].id}?back=album`);
	});

	test('can navigate between pictures using next/previous buttons', async ({ page }) => {
		await page.goto(`/pictures/${mockPictures.data[0].id}?back=album`);
		await expect(page.locator('img.lightbox-image')).toBeVisible();

		const nextButton = page.getByLabel('Next photo');
		await nextButton.click();
		await expect(page).toHaveURL(`/pictures/${mockPictures.data[1].id}?back=album`);

		const prevButton = page.getByLabel('Previous photo');
		await prevButton.click();
		await expect(page).toHaveURL(`/pictures/${mockPictures.data[0].id}?back=album`);
	});

	test('can close lightbox with Escape key', async ({ page }) => {
		await page.goto(`/pictures/${mockPictures.data[0].id}?back=album`);
		await expect(page.locator('img.lightbox-image')).toBeVisible();

		await page.keyboard.press('Escape');
		await expect(page).toHaveURL(/\/albums\//);
	});

	test('can close lightbox with X button', async ({ page }) => {
		await page.goto(`/pictures/${mockPictures.data[0].id}?back=album`);
		await expect(page.locator('img.lightbox-image')).toBeVisible();

		await page.getByLabel('Close', { exact: true }).click();
		await expect(page).toHaveURL(/\/albums\//);
	});

	test('handles rapid navigation correctly', async ({ page }) => {
		await page.goto(`/pictures/${mockPictures.data[0].id}?back=album`);
		await expect(page.locator('img.lightbox-image')).toBeVisible();

		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('ArrowRight');

		await page.waitForTimeout(500);

		const currentUrl = page.url();
		expect(currentUrl).not.toContain(mockPictures.data[0].id);
	});

	test('navigation buttons are only shown when available', async ({ page }) => {
		await page.goto(`/pictures/${mockPictures.data[0].id}?back=album`);
		await expect(page.locator('img.lightbox-image')).toBeVisible();

		await expect(page.getByLabel('Previous photo')).not.toBeVisible();
		await expect(page.getByLabel('Next photo')).toBeVisible();

		await page.goto(`/pictures/${mockPictures.data[2].id}?back=album`);
		await expect(page.locator('img.lightbox-image')).toBeVisible();

		await expect(page.getByLabel('Next photo')).not.toBeVisible();
		await expect(page.getByLabel('Previous photo')).toBeVisible();
	});

	test('displays loading spinner while image loads', async ({ page }) => {
		await page.goto(`/pictures/${mockPictures.data[0].id}?back=album`);
		await expect(page.locator('img.lightbox-image')).toBeVisible();
	});

	test('can toggle info panel with i key', async ({ page }) => {
		await page.goto(`/pictures/${mockPictures.data[0].id}?back=album`);
		await expect(page.locator('img.lightbox-image')).toBeVisible();

		await page.keyboard.press('i');
		await page.waitForTimeout(100);
		await page.keyboard.press('i');
	});

	test('swipe gestures work on touch devices', async ({ page, isMobile }) => {
		test.skip(!isMobile, 'Touch gestures only on mobile');

		await page.goto(`/pictures/${mockPictures.data[0].id}?back=album`);
		await expect(page.locator('img.lightbox-image')).toBeVisible();

		const image = page.locator('img.lightbox-image');
		const box = await image.boundingBox();
		if (box) {
			await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
			await page.touchscreen.swipe(
				{ x: box.x + box.width * 0.8, y: box.y + box.height / 2 },
				{ x: box.x + box.width * 0.2, y: box.y + box.height / 2 }
			);
		}

		await expect(page).toHaveURL(`/pictures/${mockPictures.data[1].id}?back=album`);
	});

	test('view transitions are applied during navigation', async ({ page }) => {
		await page.goto(`/pictures/${mockPictures.data[0].id}?back=album`);
		await expect(page.locator('img.lightbox-image')).toBeVisible();

		const img = page.locator('img.lightbox-image');
		const style = await img.getAttribute('style');
		expect(style).toContain('view-transition-name');
		expect(style).toContain(`picture-${mockPictures.data[0].id}`);
	});

	test('preserves back location through navigation', async ({ page }) => {
		await page.goto(`/pictures/${mockPictures.data[0].id}?back=home`);
		await expect(page.locator('img.lightbox-image')).toBeVisible();

		await page.keyboard.press('ArrowRight');
		await expect(page).toHaveURL(/back=home/);

		await page.keyboard.press('Escape');
		await expect(page).toHaveURL('/');
	});
});
