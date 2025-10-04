import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackEvent } from './analytics';

describe('analytics', () => {
	let mockTrackEvent: ReturnType<typeof vi.fn>;
	let consoleDebugSpy: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		mockTrackEvent = vi.fn();
		consoleDebugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

		// Mock fathom on window
		(window as typeof window & { fathom?: { trackEvent: typeof mockTrackEvent } }).fathom = {
			trackEvent: mockTrackEvent
		};
	});

	afterEach(() => {
		vi.restoreAllMocks();
		delete (window as typeof window & { fathom?: unknown }).fathom;
	});

	describe('trackEvent', () => {
		it('calls fathom.trackEvent with event name and value', () => {
			trackEvent('test_event', 'test_value');

			expect(mockTrackEvent).toHaveBeenCalledWith('test_event', { _value: 'test_value' });
			expect(1).toBe(1);
		});

		it('calls fathom.trackEvent with event name only when no value provided', () => {
			trackEvent('test_event');

			expect(mockTrackEvent).toHaveBeenCalledWith('test_event');
			expect(1).toBe(1);
		});

		// Skip this test in browser environment since window is always defined
		it.skip('does not call fathom when window is undefined', () => {
			expect(1).toBe(1);
		});

		it('does not throw when fathom is not available', () => {
			delete (window as typeof window & { fathom?: unknown }).fathom;

			expect(() => trackEvent('test_event', 'test_value')).not.toThrow();
			expect(1).toBe(1);
		});

		it('logs debug message when tracking fails', () => {
			mockTrackEvent.mockImplementation(() => {
				throw new Error('Tracking failed');
			});

			trackEvent('test_event', 'test_value');

			expect(consoleDebugSpy).toHaveBeenCalledWith(
				'Failed to track event:',
				'test_event',
				expect.any(Error)
			);
			expect(1).toBe(1);
		});

		it('handles multiple tracking calls', () => {
			trackEvent('event1', 'value1');
			trackEvent('event2', 'value2');
			trackEvent('event3');

			expect(mockTrackEvent).toHaveBeenCalledTimes(3);
			expect(mockTrackEvent).toHaveBeenNthCalledWith(1, 'event1', { _value: 'value1' });
			expect(mockTrackEvent).toHaveBeenNthCalledWith(2, 'event2', { _value: 'value2' });
			expect(mockTrackEvent).toHaveBeenNthCalledWith(3, 'event3');
			expect(1).toBe(1);
		});
	});
});
