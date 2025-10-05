import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createTouchGestureHandler } from './touchGestures';

// Mock window object for Node environment
Object.defineProperty(globalThis, 'window', {
	value: {
		innerWidth: 1000
	},
	writable: true
});

// Mock TouchEvent for Node environment
global.TouchEvent = class TouchEvent extends Event {
	touches: Touch[];
	changedTouches: Touch[];

	constructor(type: string, eventInitDict: { touches?: Touch[]; changedTouches?: Touch[] } = {}) {
		super(type);
		this.touches = eventInitDict.touches || [];
		this.changedTouches = eventInitDict.changedTouches || [];
	}
} as typeof TouchEvent;

describe('createTouchGestureHandler', () => {
	let onSwipe: ReturnType<typeof vi.fn>;
	let handler: ReturnType<typeof createTouchGestureHandler>;

	beforeEach(() => {
		onSwipe = vi.fn();
		handler = createTouchGestureHandler({ onSwipe });
	});

	describe('single touch swipe detection', () => {
		it('detects right swipe when swiping right beyond threshold', () => {
			// Start touch at x=100
			const startEvent = new TouchEvent('touchstart', {
				touches: [{ clientX: 100, clientY: 200 } as Touch]
			});
			handler.handleTouchStart(startEvent);

			// End touch at x=300 (200px right = 20% of 1000px viewport)
			const endEvent = new TouchEvent('touchend', {
				changedTouches: [{ clientX: 300, clientY: 200 } as Touch]
			});
			handler.handleTouchEnd(endEvent);

			expect(onSwipe).toHaveBeenCalledWith('right', 200);
		});

		it('detects left swipe when swiping left beyond threshold', () => {
			// Start touch at x=300
			const startEvent = new TouchEvent('touchstart', {
				touches: [{ clientX: 300, clientY: 200 } as Touch]
			});
			handler.handleTouchStart(startEvent);

			// End touch at x=100 (200px left)
			const endEvent = new TouchEvent('touchend', {
				changedTouches: [{ clientX: 100, clientY: 200 } as Touch]
			});
			handler.handleTouchEnd(endEvent);

			expect(onSwipe).toHaveBeenCalledWith('left', -200);
		});

		it('does not trigger swipe when horizontal movement is below threshold', () => {
			// Default threshold is 15% of viewport = 150px for 1000px viewport
			const startEvent = new TouchEvent('touchstart', {
				touches: [{ clientX: 100, clientY: 200 } as Touch]
			});
			handler.handleTouchStart(startEvent);

			// Move only 100px (below 150px threshold)
			const endEvent = new TouchEvent('touchend', {
				changedTouches: [{ clientX: 200, clientY: 200 } as Touch]
			});
			handler.handleTouchEnd(endEvent);

			expect(onSwipe).not.toHaveBeenCalled();
		});

		it('does not trigger swipe when vertical movement is greater than horizontal', () => {
			const startEvent = new TouchEvent('touchstart', {
				touches: [{ clientX: 100, clientY: 100 } as Touch]
			});
			handler.handleTouchStart(startEvent);

			// Move more vertically than horizontally (scroll-like gesture)
			const endEvent = new TouchEvent('touchend', {
				changedTouches: [{ clientX: 200, clientY: 350 } as Touch]
			});
			handler.handleTouchEnd(endEvent);

			expect(onSwipe).not.toHaveBeenCalled();
		});
	});

	describe('multi-touch gesture prevention', () => {
		it('does not trigger swipe when multi-touch is detected at start', () => {
			// Start with two touches (pinch gesture)
			const startEvent = new TouchEvent('touchstart', {
				touches: [{ clientX: 100, clientY: 200 } as Touch, { clientX: 200, clientY: 200 } as Touch]
			});
			handler.handleTouchStart(startEvent);

			// End with single touch that would normally trigger swipe
			const endEvent = new TouchEvent('touchend', {
				changedTouches: [{ clientX: 300, clientY: 200 } as Touch]
			});
			handler.handleTouchEnd(endEvent);

			expect(onSwipe).not.toHaveBeenCalled();
		});

		it('does not trigger swipe when multi-touch is detected during move', () => {
			// Start with single touch
			const startEvent = new TouchEvent('touchstart', {
				touches: [{ clientX: 100, clientY: 200 } as Touch]
			});
			handler.handleTouchStart(startEvent);

			// Add second touch during move (user started pinching)
			const moveEvent = new TouchEvent('touchmove', {
				touches: [{ clientX: 120, clientY: 200 } as Touch, { clientX: 180, clientY: 200 } as Touch]
			});
			handler.handleTouchMove(moveEvent);

			// End with movement that would normally trigger swipe
			const endEvent = new TouchEvent('touchend', {
				changedTouches: [{ clientX: 300, clientY: 200 } as Touch]
			});
			handler.handleTouchEnd(endEvent);

			expect(onSwipe).not.toHaveBeenCalled();
		});

		it('tracks multi-touch state correctly', () => {
			// Start with single touch
			const startEvent = new TouchEvent('touchstart', {
				touches: [{ clientX: 100, clientY: 200 } as Touch]
			});
			handler.handleTouchStart(startEvent);

			const state = handler.getGestureState();
			expect(state?.isMultiTouch).toBe(false);

			// Add second touch
			const moveEvent = new TouchEvent('touchmove', {
				touches: [{ clientX: 120, clientY: 200 } as Touch, { clientX: 180, clientY: 200 } as Touch]
			});
			handler.handleTouchMove(moveEvent);

			const updatedState = handler.getGestureState();
			expect(updatedState?.isMultiTouch).toBe(true);
		});
	});

	describe('configuration options', () => {
		it('respects custom swipe threshold', () => {
			const customHandler = createTouchGestureHandler({
				onSwipe,
				swipeThreshold: 0.1 // 10% threshold = 100px for 1000px viewport
			});

			const startEvent = new TouchEvent('touchstart', {
				touches: [{ clientX: 100, clientY: 200 } as Touch]
			});
			customHandler.handleTouchStart(startEvent);

			// Move 120px (above 100px threshold)
			const endEvent = new TouchEvent('touchend', {
				changedTouches: [{ clientX: 220, clientY: 200 } as Touch]
			});
			customHandler.handleTouchEnd(endEvent);

			expect(onSwipe).toHaveBeenCalledWith('right', 120);
		});

		it('does not call onSwipe when enabled is false', () => {
			const disabledHandler = createTouchGestureHandler({
				onSwipe,
				enabled: false
			});

			const startEvent = new TouchEvent('touchstart', {
				touches: [{ clientX: 100, clientY: 200 } as Touch]
			});
			disabledHandler.handleTouchStart(startEvent);

			const endEvent = new TouchEvent('touchend', {
				changedTouches: [{ clientX: 300, clientY: 200 } as Touch]
			});
			disabledHandler.handleTouchEnd(endEvent);

			expect(onSwipe).not.toHaveBeenCalled();
		});

		it('does not process gestures when onSwipe is not provided', () => {
			const noCallbackHandler = createTouchGestureHandler({});

			const startEvent = new TouchEvent('touchstart', {
				touches: [{ clientX: 100, clientY: 200 } as Touch]
			});

			// Should not throw error even without onSwipe callback
			expect(() => {
				noCallbackHandler.handleTouchStart(startEvent);
				const endEvent = new TouchEvent('touchend', {
					changedTouches: [{ clientX: 300, clientY: 200 } as Touch]
				});
				noCallbackHandler.handleTouchEnd(endEvent);
			}).not.toThrow();
		});
	});

	describe('edge cases', () => {
		it('handles missing touch data gracefully', () => {
			const startEvent = new TouchEvent('touchstart', { touches: [] });

			expect(() => {
				handler.handleTouchStart(startEvent);
			}).not.toThrow();

			expect(handler.getGestureState()).toBeNull();
		});

		it('handles touchend without touchstart', () => {
			const endEvent = new TouchEvent('touchend', {
				changedTouches: [{ clientX: 300, clientY: 200 } as Touch]
			});

			expect(() => {
				handler.handleTouchEnd(endEvent);
			}).not.toThrow();

			expect(onSwipe).not.toHaveBeenCalled();
		});

		it('resets state on touchcancel', () => {
			const startEvent = new TouchEvent('touchstart', {
				touches: [{ clientX: 100, clientY: 200 } as Touch]
			});
			handler.handleTouchStart(startEvent);

			expect(handler.getGestureState()).not.toBeNull();

			handler.handleTouchCancel();

			expect(handler.getGestureState()).toBeNull();
		});

		it('rejects swipes that take too long', () => {
			// Mock Date.now to simulate slow gesture
			const originalNow = Date.now;
			let mockTime = 1000;
			Date.now = vi.fn(() => mockTime);

			const startEvent = new TouchEvent('touchstart', {
				touches: [{ clientX: 100, clientY: 200 } as Touch]
			});
			handler.handleTouchStart(startEvent);

			// Simulate 2 seconds passing (over 1 second limit)
			mockTime = 3000;

			const endEvent = new TouchEvent('touchend', {
				changedTouches: [{ clientX: 300, clientY: 200 } as Touch]
			});
			handler.handleTouchEnd(endEvent);

			expect(onSwipe).not.toHaveBeenCalled();

			// Restore original Date.now
			Date.now = originalNow;
		});
	});

	describe('utility methods', () => {
		it('provides access to gesture state for testing', () => {
			expect(handler.getGestureState()).toBeNull();

			const startEvent = new TouchEvent('touchstart', {
				touches: [{ clientX: 100, clientY: 200 } as Touch]
			});
			handler.handleTouchStart(startEvent);

			const state = handler.getGestureState();
			expect(state).not.toBeNull();
			expect(state?.startX).toBe(100);
			expect(state?.startY).toBe(200);
			expect(state?.isMultiTouch).toBe(false);
		});

		it('can reset gesture state', () => {
			const startEvent = new TouchEvent('touchstart', {
				touches: [{ clientX: 100, clientY: 200 } as Touch]
			});
			handler.handleTouchStart(startEvent);

			expect(handler.getGestureState()).not.toBeNull();

			handler.reset();

			expect(handler.getGestureState()).toBeNull();
		});
	});
});
