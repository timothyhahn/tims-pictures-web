/**
 * Mock data for E2E tests
 * This matches the data in e2e/fixtures/api-mocks.ts to ensure
 * consistency between SSR and client-side testing
 */

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

/**
 * Returns mock response for a given API path during E2E tests
 * Returns null if no mock is available for the path
 */
export function getMockResponseForPath(path: string): unknown | null {
	// Match the path to return appropriate mock data
	if (path.match(/v1\/albums\/slug\//)) {
		return mockAlbums.data[0];
	}
	if (path.match(/v1\/albums\/[^/]+\/pictures/)) {
		return mockPictures;
	}
	if (path.match(/v1\/albums/)) {
		return mockAlbums;
	}
	if (path.match(/v1\/pictures\/recent/)) {
		return mockPictures;
	}
	if (path.match(/v1\/pictures\/[^/]+/)) {
		return mockPictures.data[0];
	}
	return null;
}
