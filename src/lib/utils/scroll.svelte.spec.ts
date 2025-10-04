import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	scrollToTop,
	restoreScrollPosition,
	getFirstVisiblePictureId,
	restoreScrollToPicture
} from './scroll';

describe('scroll utilities', () => {
	beforeEach(() => {
		// Mock window.scrollTo
		window.scrollTo = vi.fn();
		// Mock document.querySelector and querySelectorAll
		document.querySelector = vi.fn();
		document.querySelectorAll = vi.fn();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.useRealTimers();
	});

	describe('scrollToTop', () => {
		it('scrolls to top with smooth behavior', () => {
			scrollToTop();

			expect(window.scrollTo).toHaveBeenCalledWith({
				top: 0,
				behavior: 'smooth'
			});
		});

		it('is called once per invocation', () => {
			scrollToTop();

			expect(window.scrollTo).toHaveBeenCalledTimes(1);
		});
	});

	describe('restoreScrollPosition', () => {
		it('restores scroll position after timeout', () => {
			restoreScrollPosition(500);

			// Should not be called immediately
			expect(window.scrollTo).not.toHaveBeenCalled();

			// Fast-forward timeout
			vi.runAllTimers();

			expect(window.scrollTo).toHaveBeenCalledWith(0, 500);
		});

		it('works with zero position', () => {
			restoreScrollPosition(0);

			vi.runAllTimers();

			expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
		});

		it('works with large position values', () => {
			const largePosition = 9999;
			restoreScrollPosition(largePosition);

			vi.runAllTimers();

			expect(window.scrollTo).toHaveBeenCalledWith(0, largePosition);
		});
	});

	describe('getFirstVisiblePictureId', () => {
		beforeEach(() => {
			// Mock window properties
			Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
			Object.defineProperty(window, 'innerHeight', { value: 800, writable: true });
		});

		it('returns null when no picture elements exist', () => {
			(document.querySelectorAll as unknown as vi.Mock).mockReturnValue([]);

			const result = getFirstVisiblePictureId();
			expect(result).toBeNull();
		});

		it('returns ID of first visible picture element', () => {
			const mockElement = {
				getAttribute: vi.fn().mockReturnValue('picture-123'),
				getBoundingClientRect: vi.fn().mockReturnValue({
					top: 200, // Element is at scrollY + 200
					height: 300
				})
			};

			(document.querySelectorAll as unknown as vi.Mock).mockReturnValue([mockElement]);

			const result = getFirstVisiblePictureId();
			expect(result).toBe('picture-123');
		});

		it('skips invisible elements and returns first visible one', () => {
			const invisibleElement = {
				getAttribute: vi.fn().mockReturnValue('picture-invisible'),
				getBoundingClientRect: vi.fn().mockReturnValue({
					top: -500, // Above viewport
					height: 200
				})
			};

			const visibleElement = {
				getAttribute: vi.fn().mockReturnValue('picture-visible'),
				getBoundingClientRect: vi.fn().mockReturnValue({
					top: 300, // Visible in viewport
					height: 200
				})
			};

			(document.querySelectorAll as unknown as vi.Mock).mockReturnValue([
				invisibleElement,
				visibleElement
			]);

			const result = getFirstVisiblePictureId();
			expect(result).toBe('picture-visible');
		});
	});

	describe('restoreScrollToPicture', () => {
		it('scrolls to picture element when found', () => {
			const mockElement = {
				getBoundingClientRect: vi.fn().mockReturnValue({
					top: 300
				})
			};

			(document.querySelector as unknown as vi.Mock).mockReturnValue(mockElement);
			Object.defineProperty(window, 'scrollY', { value: 100, writable: true });

			restoreScrollToPicture('picture-123', 500);
			vi.runAllTimers();

			expect(document.querySelector).toHaveBeenCalledWith('[data-picture-id="picture-123"]');
			expect(window.scrollTo).toHaveBeenCalledWith(0, 300); // 100 + 300 - 100 offset
		});

		it('falls back to Y position when picture not found', () => {
			(document.querySelector as unknown as vi.Mock).mockReturnValue(null);

			restoreScrollToPicture('picture-not-found', 500);
			vi.runAllTimers();

			expect(window.scrollTo).toHaveBeenCalledWith(0, 500);
		});

		it('falls back to Y position when pictureId is null', () => {
			restoreScrollToPicture(null, 500);
			vi.runAllTimers();

			expect(window.scrollTo).toHaveBeenCalledWith(0, 500);
			expect(document.querySelector).not.toHaveBeenCalled();
		});

		it('handles element at top of page correctly', () => {
			const mockElement = {
				getBoundingClientRect: vi.fn().mockReturnValue({
					top: 50 // Very close to top
				})
			};

			(document.querySelector as unknown as vi.Mock).mockReturnValue(mockElement);
			Object.defineProperty(window, 'scrollY', { value: 0, writable: true });

			restoreScrollToPicture('picture-top', 500);
			vi.runAllTimers();

			expect(window.scrollTo).toHaveBeenCalledWith(0, 0); // Math.max(0, 0 + 50 - 100)
		});
	});
});
