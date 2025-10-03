import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Page from './+page.svelte';
import type { Picture } from '$lib/api/types';

describe('/+page.svelte', () => {
	it('should render photo grid with pictures', async () => {
		const mockPictures: Picture[] = [
			{
				id: '1',
				album_id: '1',
				created_at: '2024-01-01T00:00:00Z',
				updated_at: '2024-01-01T00:00:00Z',
				image_url: 'https://example.com/image.jpg',
				description: 'Test picture',
				metadata: {}
			}
		];

		const mockData = {
			pictures: Promise.resolve(mockPictures)
		};

		render(Page, { data: mockData });

		// Wait for pictures to load and render
		const img = page.getByAltText('Test picture');
		await expect.element(img).toBeInTheDocument();
		await expect
			.element(img)
			.toHaveAttribute('src', 'https://example.com/image.jpg?class=thumbnail');
	});
});
