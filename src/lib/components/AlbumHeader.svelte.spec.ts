import { render, cleanup } from '@testing-library/svelte';
import { describe, it, expect, afterEach } from 'vitest';
import AlbumHeader from './AlbumHeader.svelte';
import type { Album } from '$lib/api/types';

describe('AlbumHeader', () => {
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
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z'
	};

	it('renders album name', () => {
		const { getByText } = render(AlbumHeader, { props: { album: mockAlbum, totalPictures: 10 } });
		expect(getByText('Test Album')).toBeTruthy();
	});

	it('renders album description when provided', () => {
		const { getByText } = render(AlbumHeader, { props: { album: mockAlbum, totalPictures: 10 } });
		expect(getByText('A test album description')).toBeTruthy();
	});

	it('does not render description when null', () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { description: _desc, ...albumWithoutDesc } = mockAlbum;
		const { queryByText } = render(AlbumHeader, {
			props: { album: albumWithoutDesc, totalPictures: 10 }
		});
		expect(queryByText('A test album description')).toBeFalsy();
	});

	it('renders photo count with plural', () => {
		const { getByText } = render(AlbumHeader, { props: { album: mockAlbum, totalPictures: 10 } });
		expect(getByText('10 photos')).toBeTruthy();
	});

	it('renders photo count with singular', () => {
		const { getByText } = render(AlbumHeader, { props: { album: mockAlbum, totalPictures: 1 } });
		expect(getByText('1 photo')).toBeTruthy();
	});

	it('shows loading skeleton when loading is true and album is null', () => {
		const { container } = render(AlbumHeader, {
			props: { album: null, totalPictures: 0, loading: true }
		});
		const skeleton = container.querySelector('.animate-pulse');
		expect(skeleton).toBeTruthy();
	});

	it('does not show loading skeleton when loading is false and album is null', () => {
		const { container } = render(AlbumHeader, {
			props: { album: null, totalPictures: 0, loading: false }
		});
		const skeleton = container.querySelector('.animate-pulse');
		expect(skeleton).toBeFalsy();
	});

	it('shows album content when album is provided, even if loading is true', () => {
		const { getByText } = render(AlbumHeader, {
			props: { album: mockAlbum, totalPictures: 10, loading: true }
		});
		expect(getByText('Test Album')).toBeTruthy();
	});
});
