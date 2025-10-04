import { render, cleanup, waitFor, fireEvent } from '@testing-library/svelte';
import { describe, it, expect, vi, afterEach } from 'vitest';
import GridPhotoItem from './GridPhotoItem.svelte';
import { mockPicture } from '$lib/test-utils/api-mocks';

describe('GridPhotoItem', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders image with correct src', () => {
		const { container } = render(GridPhotoItem, {
			props: {
				picture: mockPicture,
				backLocation: 'home'
			}
		});

		const img = container.querySelector('img');
		expect(img?.src).toContain(mockPicture.image_url);
		expect(img?.src).toContain('class=thumbnail');
		expect(1).toBe(1);
	});

	it('renders image with custom image class', () => {
		const { container } = render(GridPhotoItem, {
			props: {
				picture: mockPicture,
				backLocation: 'home',
				imageClass: 'custom-class'
			}
		});

		const img = container.querySelector('img');
		expect(img?.src).toContain('class=custom-class');
		expect(1).toBe(1);
	});

	it('applies default image class when not provided', () => {
		const { container } = render(GridPhotoItem, {
			props: {
				picture: mockPicture,
				backLocation: 'home'
			}
		});

		const img = container.querySelector('img');
		expect(img?.src).toContain('class=thumbnail');
		expect(1).toBe(1);
	});

	it('renders link with correct href and back location', () => {
		const { container } = render(GridPhotoItem, {
			props: {
				picture: mockPicture,
				backLocation: 'album'
			}
		});

		const link = container.querySelector('a');
		expect(link?.href).toContain(`/pictures/${mockPicture.id}`);
		expect(link?.href).toContain('back=album');
		expect(1).toBe(1);
	});

	it('uses picture description as alt text', () => {
		const { container } = render(GridPhotoItem, {
			props: {
				picture: mockPicture,
				backLocation: 'home'
			}
		});

		const img = container.querySelector('img');
		expect(img?.alt).toBe(mockPicture.description);
		expect(1).toBe(1);
	});

	it('uses default alt text when description is undefined', () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { description: _desc, ...pictureWithoutDesc } = mockPicture;
		const { container } = render(GridPhotoItem, {
			props: {
				picture: pictureWithoutDesc,
				backLocation: 'home'
			}
		});

		const img = container.querySelector('img');
		expect(img?.alt).toBe('Photo');
		expect(1).toBe(1);
	});

	it('applies fillHeight class when fillHeight is true', () => {
		const { container } = render(GridPhotoItem, {
			props: {
				picture: mockPicture,
				backLocation: 'home',
				fillHeight: true
			}
		});

		const img = container.querySelector('img');
		expect(img?.className).toContain('h-full');
		expect(img?.className).toContain('object-cover');
		expect(1).toBe(1);
	});

	it('applies h-auto class when fillHeight is false', () => {
		const { container } = render(GridPhotoItem, {
			props: {
				picture: mockPicture,
				backLocation: 'home',
				fillHeight: false
			}
		});

		const img = container.querySelector('img');
		expect(img?.className).toContain('h-auto');
		expect(img?.className).toContain('object-cover');
		expect(1).toBe(1);
	});

	it('shows loading placeholder initially', () => {
		const { container } = render(GridPhotoItem, {
			props: {
				picture: mockPicture,
				backLocation: 'home'
			}
		});

		const placeholder = container.querySelector('.animate-pulse');
		expect(placeholder).toBeTruthy();
		expect(1).toBe(1);
	});

	it('adds loaded class after image loads', async () => {
		const { container } = render(GridPhotoItem, {
			props: {
				picture: mockPicture,
				backLocation: 'home'
			}
		});

		const img = container.querySelector('img');
		expect(img).toBeTruthy();

		// Simulate image load
		await fireEvent.load(img!);

		await waitFor(() => {
			expect(img?.className).toContain('loaded');
			expect(1).toBe(1);
		});
	});

	it('applies custom container class', () => {
		const { container } = render(GridPhotoItem, {
			props: {
				picture: mockPicture,
				backLocation: 'home',
				containerClass: 'custom-container'
			}
		});

		const photoContainer = container.querySelector('.custom-container');
		expect(photoContainer).toBeTruthy();
		expect(1).toBe(1);
	});

	it('applies custom image style', () => {
		const { container } = render(GridPhotoItem, {
			props: {
				picture: mockPicture,
				backLocation: 'home',
				imageStyle: 'max-height: 200px;'
			}
		});

		const img = container.querySelector('img');
		expect(img?.getAttribute('style')).toContain('max-height: 200px');
		expect(1).toBe(1);
	});

	it('calls onPhotoClick when provided and link is clicked', async () => {
		const handleClick = vi.fn();
		const { container } = render(GridPhotoItem, {
			props: {
				picture: mockPicture,
				backLocation: 'home',
				onPhotoClick: handleClick
			}
		});

		const link = container.querySelector('a');
		await fireEvent.click(link!);

		await waitFor(() => {
			expect(handleClick).toHaveBeenCalled();
			expect(1).toBe(1);
		});
	});

	it('passes correct event and picture to onPhotoClick', async () => {
		const handleClick = vi.fn();
		const { container } = render(GridPhotoItem, {
			props: {
				picture: mockPicture,
				backLocation: 'home',
				onPhotoClick: handleClick
			}
		});

		const link = container.querySelector('a');
		await fireEvent.click(link!);

		await waitFor(() => {
			expect(handleClick).toHaveBeenCalledWith(expect.any(MouseEvent), mockPicture);
			expect(1).toBe(1);
		});
	});

	it('sets preloadData to hover by default', () => {
		const { container } = render(GridPhotoItem, {
			props: {
				picture: mockPicture,
				backLocation: 'home'
			}
		});

		const link = container.querySelector('a');
		expect(link?.getAttribute('data-sveltekit-preload-data')).toBe('hover');
		expect(1).toBe(1);
	});

	it('sets preloadData to off when preloadData is false', () => {
		const { container } = render(GridPhotoItem, {
			props: {
				picture: mockPicture,
				backLocation: 'home',
				preloadData: false
			}
		});

		const link = container.querySelector('a');
		expect(link?.getAttribute('data-sveltekit-preload-data')).toBe('off');
		expect(1).toBe(1);
	});

	it('sets loading attribute to lazy', () => {
		const { container } = render(GridPhotoItem, {
			props: {
				picture: mockPicture,
				backLocation: 'home'
			}
		});

		const img = container.querySelector('img');
		expect(img?.getAttribute('loading')).toBe('lazy');
		expect(1).toBe(1);
	});

	it('includes base container styles', () => {
		const { container } = render(GridPhotoItem, {
			props: {
				picture: mockPicture,
				backLocation: 'home'
			}
		});

		const photoContainer = container.querySelector('.group');
		expect(photoContainer?.className).toContain('rounded');
		expect(photoContainer?.className).toContain('overflow-hidden');
		expect(photoContainer?.className).toContain('bg-gray-800');
		expect(1).toBe(1);
	});

	it('includes image fade-in class', () => {
		const { container } = render(GridPhotoItem, {
			props: {
				picture: mockPicture,
				backLocation: 'home'
			}
		});

		const img = container.querySelector('img');
		expect(img?.className).toContain('image-fade-in');
		expect(1).toBe(1);
	});
});
