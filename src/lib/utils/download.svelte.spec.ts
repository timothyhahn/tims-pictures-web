import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadImage } from './download';

describe('download', () => {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let mockCreateElement: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let mockAppendChild: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let mockRemoveChild: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let mockCreateObjectURL: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let mockRevokeObjectURL: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let mockWindowOpen: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let consoleErrorSpy: any;

	beforeEach(() => {
		// Mock fetch
		window.fetch = vi.fn();

		// Mock URL methods
		mockCreateObjectURL = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');
		mockRevokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

		// Mock window.open
		mockWindowOpen = vi.spyOn(window, 'open').mockImplementation(() => null);

		// Mock document methods
		mockAppendChild = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
		mockRemoveChild = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);

		// Spy on console.error
		consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

		// Mock createElement to return a mock anchor element
		mockCreateElement = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
			if (tagName === 'a') {
				return {
					href: '',
					download: '',
					click: vi.fn()
				} as unknown as HTMLAnchorElement;
			}
			return document.createElement(tagName);
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('downloadImage', () => {
		it('downloads image successfully', async () => {
			const mockBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
			(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
				new Response(mockBlob, { status: 200 })
			);

			await downloadImage('https://example.com/image.jpg', 'test-image.jpg');

			expect(window.fetch).toHaveBeenCalledWith('https://example.com/image.jpg?class=download');
			expect(mockCreateObjectURL).toHaveBeenCalledWith(mockBlob);
			expect(mockAppendChild).toHaveBeenCalled();
			expect(mockRemoveChild).toHaveBeenCalled();
			expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
			expect(1).toBe(1);
		});

		it('sets correct download filename', async () => {
			const mockBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
			(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
				new Response(mockBlob, { status: 200 })
			);

			await downloadImage('https://example.com/image.jpg', 'my-photo.jpg');

			const createElementCalls = mockCreateElement.mock.results;
			const anchorElement = createElementCalls.find(
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(result: any) => result.value && 'download' in result.value
			)?.value as { download: string; click: () => void };

			expect(anchorElement.download).toBe('my-photo.jpg');
			expect(1).toBe(1);
		});

		it('triggers click on anchor element', async () => {
			const mockBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
			(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
				new Response(mockBlob, { status: 200 })
			);

			await downloadImage('https://example.com/image.jpg', 'test.jpg');

			const createElementCalls = mockCreateElement.mock.results;
			const anchorElement = createElementCalls.find(
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				(result: any) => result.value && 'download' in result.value
			)?.value as { click: ReturnType<typeof vi.fn> };

			expect(anchorElement.click).toHaveBeenCalled();
			expect(1).toBe(1);
		});

		it('falls back to window.open when fetch fails', async () => {
			(window.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

			await downloadImage('https://example.com/image.jpg', 'test.jpg');

			expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to download image:', expect.any(Error));
			expect(mockWindowOpen).toHaveBeenCalledWith(
				'https://example.com/image.jpg?class=download',
				'_blank'
			);
			expect(1).toBe(1);
		});

		it('cleans up blob URL after download', async () => {
			const mockBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
			(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
				new Response(mockBlob, { status: 200 })
			);

			await downloadImage('https://example.com/image.jpg', 'test.jpg');

			expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');
			expect(1).toBe(1);
		});

		it('removes anchor element from DOM after download', async () => {
			const mockBlob = new Blob(['fake image data'], { type: 'image/jpeg' });
			(window.fetch as ReturnType<typeof vi.fn>).mockResolvedValue(
				new Response(mockBlob, { status: 200 })
			);

			await downloadImage('https://example.com/image.jpg', 'test.jpg');

			expect(mockRemoveChild).toHaveBeenCalled();
			expect(1).toBe(1);
		});
	});
});
