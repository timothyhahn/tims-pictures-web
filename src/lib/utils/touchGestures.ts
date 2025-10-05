/**
 * Touch gesture handler composable that distinguishes between single-touch swipes
 * and multi-touch gestures (like pinch-to-zoom).
 */

export interface SwipeGestureOptions {
	/** Callback when a valid swipe is detected */
	onSwipe?: (direction: 'left' | 'right', deltaX: number) => void;
	/** Minimum horizontal distance for a swipe (as fraction of viewport width, default: 0.15) */
	swipeThreshold?: number;
	/** Whether to enable gesture detection (default: true) */
	enabled?: boolean;
}

export interface TouchGestureState {
	startX: number;
	startY: number;
	startTime: number;
	isMultiTouch: boolean;
}

/**
 * Creates touch gesture handlers that can detect swipes while avoiding interference
 * with multi-touch gestures like pinch-to-zoom.
 */
export function createTouchGestureHandler(options: SwipeGestureOptions = {}) {
	const {
		onSwipe,
		swipeThreshold = 0.15, // Reduced from 0.2 (20%) to 0.15 (15%)
		enabled = true
	} = options;

	let gestureState: TouchGestureState | null = null;

	function handleTouchStart(event: TouchEvent): void {
		if (!enabled || !onSwipe) return;

		const touches = event.touches;
		const touch = touches[0];
		if (!touch) return;

		gestureState = {
			startX: touch.clientX,
			startY: touch.clientY,
			startTime: Date.now(),
			isMultiTouch: touches.length > 1
		};

		// If we detect multi-touch immediately, mark it as such
		if (touches.length > 1) {
			gestureState.isMultiTouch = true;
		}
	}

	function handleTouchMove(event: TouchEvent): void {
		if (!enabled || !gestureState) return;

		// If we see multiple touches during the gesture, mark as multi-touch
		if (event.touches.length > 1) {
			gestureState.isMultiTouch = true;
		}
	}

	function handleTouchEnd(event: TouchEvent): void {
		if (!enabled || !gestureState || !onSwipe) return;

		// Don't process swipes if this was a multi-touch gesture
		if (gestureState.isMultiTouch) {
			gestureState = null;
			return;
		}

		const touch = event.changedTouches[0];
		if (!touch) {
			gestureState = null;
			return;
		}

		const endX = touch.clientX;
		const endY = touch.clientY;
		const deltaX = endX - gestureState.startX;
		const deltaY = endY - gestureState.startY;
		const deltaTime = Date.now() - gestureState.startTime;

		// Calculate threshold in pixels
		const thresholdPx = window.innerWidth * swipeThreshold;

		// Only trigger swipe if:
		// 1. Horizontal movement is more significant than vertical
		// 2. Horizontal movement exceeds threshold
		// 3. Gesture completed in reasonable time (< 1 second)
		// 4. This was not a multi-touch gesture
		const isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
		const exceedsThreshold = Math.abs(deltaX) > thresholdPx;
		const isReasonableTime = deltaTime < 1000;

		if (isHorizontalSwipe && exceedsThreshold && isReasonableTime) {
			const direction = deltaX > 0 ? 'right' : 'left';
			onSwipe(direction, deltaX);
		}

		gestureState = null;
	}

	function handleTouchCancel(): void {
		gestureState = null;
	}

	return {
		handleTouchStart,
		handleTouchMove,
		handleTouchEnd,
		handleTouchCancel,
		/** Get current gesture state (for testing) */
		getGestureState: () => gestureState,
		/** Reset gesture state */
		reset: () => {
			gestureState = null;
		}
	};
}

/**
 * Svelte action for adding touch gesture detection to an element
 */
export function touchGestures(node: HTMLElement, options: SwipeGestureOptions = {}) {
	const handler = createTouchGestureHandler(options);

	node.addEventListener('touchstart', handler.handleTouchStart, { passive: true });
	node.addEventListener('touchmove', handler.handleTouchMove, { passive: true });
	node.addEventListener('touchend', handler.handleTouchEnd, { passive: true });
	node.addEventListener('touchcancel', handler.handleTouchCancel, { passive: true });

	return {
		update(newOptions: SwipeGestureOptions) {
			// For updates, we'd need to recreate the handler with new options
			// For now, this is a simple implementation
			void newOptions; // Suppress unused parameter warning
		},
		destroy() {
			node.removeEventListener('touchstart', handler.handleTouchStart);
			node.removeEventListener('touchmove', handler.handleTouchMove);
			node.removeEventListener('touchend', handler.handleTouchEnd);
			node.removeEventListener('touchcancel', handler.handleTouchCancel);
		}
	};
}
