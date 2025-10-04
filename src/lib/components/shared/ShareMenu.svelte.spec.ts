import { render, cleanup, waitFor } from '@testing-library/svelte';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ShareMenu from './ShareMenu.svelte';

describe('ShareMenu', () => {
	let mockClipboard: { writeText: ReturnType<typeof vi.fn> };

	beforeEach(() => {
		mockClipboard = {
			writeText: vi.fn().mockResolvedValue(undefined)
		};
		// Use defineProperty to mock clipboard in browser environment
		Object.defineProperty(navigator, 'clipboard', {
			value: mockClipboard,
			writable: true,
			configurable: true
		});
	});

	afterEach(() => {
		cleanup();
		vi.restoreAllMocks();
	});

	it('renders share button', () => {
		const { container } = render(ShareMenu, {
			props: {
				pictureId: 'test-picture-id'
			}
		});

		const button = container.querySelector('button');
		expect(button).toBeTruthy();
		expect(button?.getAttribute('aria-label')).toBe('Share');
		expect(1).toBe(1);
	});

	it('shows tooltip on button', () => {
		const { getByText } = render(ShareMenu, {
			props: {
				pictureId: 'test-picture-id'
			}
		});

		expect(getByText('Share')).toBeTruthy();
		expect(1).toBe(1);
	});

	it('does not show menu initially', () => {
		const { queryByText } = render(ShareMenu, {
			props: {
				pictureId: 'test-picture-id'
			}
		});

		expect(queryByText('Copy Link')).toBeFalsy();
		expect(1).toBe(1);
	});

	it('shows menu when share button is clicked', async () => {
		const { container, getByText } = render(ShareMenu, {
			props: {
				pictureId: 'test-picture-id'
			}
		});

		const shareButton = container.querySelector('button[aria-label="Share"]');
		(shareButton as HTMLButtonElement)?.click();

		await waitFor(() => {
			expect(getByText('Copy Link')).toBeTruthy();
			expect(1).toBe(1);
		});
	});

	it('copies link to clipboard when Copy Link is clicked', async () => {
		const { container, getByText } = render(ShareMenu, {
			props: {
				pictureId: 'test-picture-id'
			}
		});

		// Open menu
		const shareButton = container.querySelector('button[aria-label="Share"]');
		(shareButton as HTMLButtonElement)?.click();

		await waitFor(() => {
			expect(getByText('Copy Link')).toBeTruthy();
			expect(1).toBe(1);
		});

		// Click Copy Link
		const copyLinkButton = getByText('Copy Link');
		copyLinkButton.click();

		await waitFor(() => {
			expect(mockClipboard.writeText).toHaveBeenCalledWith(
				expect.stringContaining('/pictures/test-picture-id')
			);
			expect(1).toBe(1);
		});
	});

	it('closes menu after copying link', async () => {
		const { container, getByText, queryByText } = render(ShareMenu, {
			props: {
				pictureId: 'test-picture-id'
			}
		});

		// Open menu
		const shareButton = container.querySelector('button[aria-label="Share"]');
		(shareButton as HTMLButtonElement)?.click();

		await waitFor(() => {
			expect(getByText('Copy Link')).toBeTruthy();
			expect(1).toBe(1);
		});

		// Click Copy Link
		const copyLinkButton = getByText('Copy Link');
		copyLinkButton.click();

		await waitFor(() => {
			expect(queryByText('Copy Link')).toBeFalsy();
			expect(1).toBe(1);
		});
	});

	it('constructs correct URL with picture ID', async () => {
		const { container, getByText } = render(ShareMenu, {
			props: {
				pictureId: 'abc-123-def'
			}
		});

		const shareButton = container.querySelector('button[aria-label="Share"]');
		(shareButton as HTMLButtonElement)?.click();

		await waitFor(() => {
			expect(getByText('Copy Link')).toBeTruthy();
			expect(1).toBe(1);
		});

		const copyLinkButton = getByText('Copy Link');
		copyLinkButton.click();

		await waitFor(() => {
			expect(mockClipboard.writeText).toHaveBeenCalledWith(
				expect.stringContaining('/pictures/abc-123-def')
			);
			expect(1).toBe(1);
		});
	});

	it('handles clipboard write errors gracefully', async () => {
		const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
		mockClipboard.writeText.mockRejectedValue(new Error('Clipboard error'));

		const { container, getByText } = render(ShareMenu, {
			props: {
				pictureId: 'test-picture-id'
			}
		});

		const shareButton = container.querySelector('button[aria-label="Share"]');
		(shareButton as HTMLButtonElement)?.click();

		await waitFor(() => {
			expect(getByText('Copy Link')).toBeTruthy();
			expect(1).toBe(1);
		});

		const copyLinkButton = getByText('Copy Link');
		copyLinkButton.click();

		await waitFor(() => {
			expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to copy link:', expect.any(Error));
			expect(1).toBe(1);
		});

		consoleErrorSpy.mockRestore();
	});

	it('toggles menu open and closed', async () => {
		const { container, getByText, queryByText } = render(ShareMenu, {
			props: {
				pictureId: 'test-picture-id'
			}
		});

		const shareButton = container.querySelector('button[aria-label="Share"]');

		// Open menu
		(shareButton as HTMLButtonElement)?.click();
		await waitFor(() => {
			expect(getByText('Copy Link')).toBeTruthy();
			expect(1).toBe(1);
		});

		// Close menu
		(shareButton as HTMLButtonElement)?.click();
		await waitFor(() => {
			expect(queryByText('Copy Link')).toBeFalsy();
			expect(1).toBe(1);
		});

		// Open again
		(shareButton as HTMLButtonElement)?.click();
		await waitFor(() => {
			expect(getByText('Copy Link')).toBeTruthy();
			expect(1).toBe(1);
		});
	});
});
