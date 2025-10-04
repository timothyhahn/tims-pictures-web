import { vi } from 'vitest';
import type { Album, Picture, PaginatedResponse } from '$lib/api/types';

export const mockPicture: Picture = {
	id: '18208992-966e-417f-a7be-7aa985178192',
	album_id: 'd3925d9f-77d2-416e-8f77-58258bd168fa',
	created_at: '2025-10-03T16:48:25.676734000Z',
	updated_at: '2025-10-03T16:48:25.676734000Z',
	image_url: 'https://timspictures.b-cdn.net/fd9a76bd-4fe8-4620-8f6e-bb6a81bd0b42.jpg',
	description: 'Test Picture',
	metadata: {
		Make: 'Canon',
		Model: 'EOS R5',
		FNumber: '2.8',
		ExposureTime: '1/250',
		PhotographicSensitivity: '800',
		FocalLength: '50',
		DateTime: '2025-06-23 16:53:54'
	}
};

export const mockPictures: Picture[] = [
	mockPicture,
	{
		id: '43c89fe5-8fdb-4948-b973-a9a4539931ee',
		album_id: 'd3925d9f-77d2-416e-8f77-58258bd168fa',
		created_at: '2025-10-03T16:48:30.893194000Z',
		updated_at: '2025-10-03T16:48:30.893194000Z',
		image_url: 'https://timspictures.b-cdn.net/1400ec31-9638-4fcb-8c6c-2232694cfd45.jpg',
		description: 'Second Test Picture',
		metadata: {}
	},
	{
		id: 'df72ca73-70f3-4b74-a262-670bf8fe0c00',
		album_id: 'd3925d9f-77d2-416e-8f77-58258bd168fa',
		created_at: '2025-10-03T16:48:28.710783000Z',
		updated_at: '2025-10-03T16:48:28.710783000Z',
		image_url: 'https://timspictures.b-cdn.net/e5e89d3e-8362-4325-ac6e-26ce80429b47.jpg',
		metadata: {}
	}
];

export const mockAlbum: Album = {
	id: 'd3925d9f-77d2-416e-8f77-58258bd168fa',
	created_at: '2025-10-03T16:48:09.520292000Z',
	updated_at: '2025-10-03T16:48:26.037495000Z',
	name: 'Test Album',
	slug: 'test-album',
	description: 'A test album for unit tests',
	visibility: 'public',
	has_password: false,
	cover_picture_id: '18208992-966e-417f-a7be-7aa985178192',
	cover_picture_url: 'https://timspictures.b-cdn.net/fd9a76bd-4fe8-4620-8f6e-bb6a81bd0b42.jpg',
	picture_count: 3
};

export const mockAlbums: Album[] = [
	mockAlbum,
	{
		id: 'e4925d9f-77d2-416e-8f77-58258bd168fb',
		created_at: '2025-10-03T16:48:09.520292000Z',
		updated_at: '2025-10-03T16:48:26.037495000Z',
		name: 'Second Album',
		slug: 'second-album',
		description: 'Another test album',
		visibility: 'public',
		has_password: false,
		cover_picture_id: '43c89fe5-8fdb-4948-b973-a9a4539931ee',
		cover_picture_url: 'https://timspictures.b-cdn.net/1400ec31-9638-4fcb-8c6c-2232694cfd45.jpg',
		picture_count: 5
	}
];

export const mockAlbumsResponse: PaginatedResponse<Album> = {
	data: mockAlbums,
	page: 1,
	per_page: 20,
	total: 2,
	total_pages: 1
};

export const mockPicturesResponse: PaginatedResponse<Picture> = {
	data: mockPictures,
	page: 1,
	per_page: 20,
	total: 3,
	total_pages: 1
};

/**
 * Setup fetch mocks for all API endpoints
 * Use in tests with: setupApiMocks()
 */
export function setupApiMocks() {
	window.fetch = vi.fn((url: string | URL | Request) => {
		const urlString = typeof url === 'string' ? url : url instanceof URL ? url.href : url.url;

		// Albums list
		if (urlString.includes('/api/v1/albums') && !urlString.includes('/pictures')) {
			return Promise.resolve(
				new Response(JSON.stringify(mockAlbumsResponse), {
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				})
			);
		}

		// Album by slug
		if (urlString.includes('/api/v1/albums/slug/')) {
			return Promise.resolve(
				new Response(JSON.stringify(mockAlbum), {
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				})
			);
		}

		// Album by ID
		if (urlString.match(/\/api\/v1\/albums\/[^/]+$/) && !urlString.includes('slug')) {
			return Promise.resolve(
				new Response(JSON.stringify(mockAlbum), {
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				})
			);
		}

		// Recent pictures
		if (urlString.includes('/api/v1/pictures/recent')) {
			return Promise.resolve(
				new Response(JSON.stringify(mockPicturesResponse), {
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				})
			);
		}

		// Album pictures
		if (urlString.includes('/pictures') && urlString.includes('/api/v1/albums/')) {
			return Promise.resolve(
				new Response(JSON.stringify(mockPicturesResponse), {
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				})
			);
		}

		// Single picture
		if (urlString.match(/\/api\/v1\/pictures\/[^/]+$/)) {
			return Promise.resolve(
				new Response(JSON.stringify(mockPicture), {
					status: 200,
					headers: { 'Content-Type': 'application/json' }
				})
			);
		}

		// CDN images - return mock blob
		if (urlString.includes('timspictures.b-cdn.net')) {
			const blob = new Blob(['fake image data'], { type: 'image/jpeg' });
			return Promise.resolve(
				new Response(blob, {
					status: 200,
					headers: { 'Content-Type': 'image/jpeg' }
				})
			);
		}

		// Default: 404
		return Promise.resolve(
			new Response(JSON.stringify({ error: 'Not found' }), {
				status: 404,
				headers: { 'Content-Type': 'application/json' }
			})
		);
	}) as unknown as typeof fetch;
}

/**
 * Reset fetch mocks after tests
 */
export function resetApiMocks() {
	vi.restoreAllMocks();
}
