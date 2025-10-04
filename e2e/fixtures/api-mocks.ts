import type { Page } from '@playwright/test';

export const mockAlbums = {
	data: [
		{
			id: 'd3925d9f-77d2-416e-8f77-58258bd168fa',
			created_at: '2025-10-03T16:48:09.520292000Z',
			updated_at: '2025-10-03T16:48:26.037495000Z',
			name: 'Test Album',
			slug: 'test-album',
			description: 'A test album for E2E tests',
			visibility: 'public',
			has_password: false,
			cover_picture_id: '18208992-966e-417f-a7be-7aa985178192',
			cover_picture_url: 'https://timspictures.b-cdn.net/fd9a76bd-4fe8-4620-8f6e-bb6a81bd0b42.jpg',
			picture_count: 3
		}
	],
	page: 1,
	per_page: 20,
	total: 1,
	total_pages: 1
};

export const mockPictures = {
	data: [
		{
			id: '43c89fe5-8fdb-4948-b973-a9a4539931ee',
			album_id: 'd3925d9f-77d2-416e-8f77-58258bd168fa',
			created_at: '2025-10-03T16:48:30.893194000Z',
			updated_at: '2025-10-03T16:48:30.893194000Z',
			image_url: 'https://timspictures.b-cdn.net/1400ec31-9638-4fcb-8c6c-2232694cfd45.jpg',
			description: null,
			metadata: {},
			picture_created_at: '2025-06-23T16:54:14.000000000Z'
		},
		{
			id: '18208992-966e-417f-a7be-7aa985178192',
			album_id: 'd3925d9f-77d2-416e-8f77-58258bd168fa',
			created_at: '2025-10-03T16:48:25.676734000Z',
			updated_at: '2025-10-03T16:48:25.676734000Z',
			image_url: 'https://timspictures.b-cdn.net/fd9a76bd-4fe8-4620-8f6e-bb6a81bd0b42.jpg',
			description: null,
			metadata: {},
			picture_created_at: '2025-06-23T16:53:54.000000000Z'
		},
		{
			id: 'df72ca73-70f3-4b74-a262-670bf8fe0c00',
			album_id: 'd3925d9f-77d2-416e-8f77-58258bd168fa',
			created_at: '2025-10-03T16:48:28.710783000Z',
			updated_at: '2025-10-03T16:48:28.710783000Z',
			image_url: 'https://timspictures.b-cdn.net/e5e89d3e-8362-4325-ac6e-26ce80429b47.jpg',
			description: null,
			metadata: {},
			picture_created_at: '2025-06-23T16:53:34.000000000Z'
		}
	],
	page: 1,
	per_page: 20,
	total: 3,
	total_pages: 1
};

export const mockAlbum = mockAlbums.data[0];

export async function setupApiMocks(page: Page) {
	// Mock albums endpoint
	await page.route('**/api/v1/albums*', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(mockAlbums)
		});
	});

	// Mock recent pictures endpoint
	await page.route('**/api/v1/pictures/recent*', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(mockPictures)
		});
	});

	// Mock album by slug endpoint
	await page.route('**/api/v1/albums/slug/**', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(mockAlbum)
		});
	});

	// Mock album pictures endpoint
	await page.route('**/api/v1/albums/*/pictures*', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(mockPictures)
		});
	});

	// Mock individual picture endpoint
	await page.route('**/api/v1/pictures/*', async (route) => {
		await route.fulfill({
			status: 200,
			contentType: 'application/json',
			body: JSON.stringify(mockPictures.data[0])
		});
	});
}
