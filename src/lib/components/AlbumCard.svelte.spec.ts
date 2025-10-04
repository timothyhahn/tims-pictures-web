import { render, cleanup } from '@testing-library/svelte';
import { describe, it, expect, afterEach } from 'vitest';
import AlbumCard from './AlbumCard.svelte';
import type { Album } from '$lib/api/types';

describe('AlbumCard', () => {
	afterEach(() => {
		cleanup();
	});
	const mockAlbum: Album = {
		id: '1',
		name: 'Test Album',
		slug: 'test-album',
		description: 'A test album description',
		visibility: 'public',
		picture_count: 10,
		has_password: false,
		cover_picture_url: 'https://example.com/cover.jpg',
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z'
	};

	it('renders album name', () => {
		const { getByText } = render(AlbumCard, { props: { album: mockAlbum } });
		expect(getByText('Test Album')).toBeTruthy();
	});

	it('renders album description', () => {
		const { getByText } = render(AlbumCard, { props: { album: mockAlbum } });
		expect(getByText('A test album description')).toBeTruthy();
	});

	it('renders picture count with plural', () => {
		const { getByText } = render(AlbumCard, { props: { album: mockAlbum } });
		expect(getByText('10 images')).toBeTruthy();
	});

	it('renders picture count with singular', () => {
		const singlePictureAlbum = { ...mockAlbum, picture_count: 1 };
		const { getByText } = render(AlbumCard, { props: { album: singlePictureAlbum } });
		expect(getByText('1 image')).toBeTruthy();
	});

	it('renders cover image when available', () => {
		const { getByAltText } = render(AlbumCard, { props: { album: mockAlbum } });
		const img = getByAltText('Test Album cover') as HTMLImageElement;
		expect(img).toBeTruthy();
		expect(img.src).toContain('cover.jpg?class=thumbnail');
	});

	it('renders placeholder when no cover image', () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { cover_picture_url: _cover, ...albumWithoutCover } = mockAlbum;
		const { container } = render(AlbumCard, { props: { album: albumWithoutCover } });
		const placeholderSvg = container.querySelector('svg');
		expect(placeholderSvg).toBeTruthy();
	});

	it('shows protected icon when has_password is true', () => {
		const protectedAlbum = { ...mockAlbum, has_password: true };
		const { getByText } = render(AlbumCard, { props: { album: protectedAlbum } });
		expect(getByText('Protected')).toBeTruthy();
	});

	it('does not show protected icon when has_password is false', () => {
		const { queryByText } = render(AlbumCard, { props: { album: mockAlbum } });
		expect(queryByText('Protected')).toBeFalsy();
	});

	it('links to correct album slug', () => {
		const { container } = render(AlbumCard, { props: { album: mockAlbum } });
		const link = container.querySelector('a');
		expect(link?.getAttribute('href')).toBe('/albums/test-album');
	});

	it('does not render description when null', () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { description: _desc, ...albumWithoutDesc } = mockAlbum;
		const { queryByText } = render(AlbumCard, { props: { album: albumWithoutDesc } });
		expect(queryByText('A test album description')).toBeFalsy();
	});
});
