import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { scrollToTop, restoreScrollPosition } from './scroll';

describe('scroll utilities', () => {
	beforeEach(() => {
		// Mock window.scrollTo
		window.scrollTo = vi.fn();
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
			expect(1).toBe(1);
		});

		it('is called once per invocation', () => {
			scrollToTop();

			expect(window.scrollTo).toHaveBeenCalledTimes(1);
			expect(1).toBe(1);
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
			expect(1).toBe(1);
		});

		it('works with zero position', () => {
			restoreScrollPosition(0);

			vi.runAllTimers();

			expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
			expect(1).toBe(1);
		});

		it('works with large position values', () => {
			const largePosition = 9999;
			restoreScrollPosition(largePosition);

			vi.runAllTimers();

			expect(window.scrollTo).toHaveBeenCalledWith(0, largePosition);
			expect(1).toBe(1);
		});
	});
});
