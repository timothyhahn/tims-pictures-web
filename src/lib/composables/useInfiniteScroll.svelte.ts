import { SCROLL_LOAD_THRESHOLD_PX } from '$lib/constants';

interface InfiniteScrollOptions {
	/**
	 * The load function to call when the scroll threshold is reached
	 */
	onLoad: () => void | Promise<void>;

	/**
	 * Whether the scroll effect should be enabled
	 */
	enabled?: boolean;

	/**
	 * Threshold calculation strategy:
	 * - 'fixed': Use a fixed pixel threshold (SCROLL_LOAD_THRESHOLD_PX)
	 * - 'viewport': Use a multiplier of the viewport height
	 */
	thresholdStrategy?: 'fixed' | 'viewport';

	/**
	 * Threshold value:
	 * - For 'fixed': pixels from bottom
	 * - For 'viewport': multiplier of window height (e.g., 1.5 = 1.5x viewport height)
	 */
	threshold?: number;

	/**
	 * Debounce delay in milliseconds (0 = no debounce)
	 */
	debounceMs?: number;
}

export function useInfiniteScroll(options: InfiniteScrollOptions) {
	const {
		onLoad,
		thresholdStrategy = 'fixed',
		threshold = thresholdStrategy === 'fixed' ? SCROLL_LOAD_THRESHOLD_PX : 1.5,
		debounceMs = 0
	} = options;

	let y = $state(0);
	let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
	let lastTriggeredHeight = 0;

	function checkAndLoad() {
		// Access enabled from options directly to support getters/reactive values
		const isEnabled = options.enabled ?? true;

		// Guard against invalid scroll position
		if (typeof y !== 'number' || y < 0 || !isEnabled) {
			return;
		}

		// Calculate if we're near the bottom based on strategy
		const scrollHeight = document.documentElement.scrollHeight;
		const windowHeight = window.innerHeight;
		const scrollPosition = y;

		let nearBottom = false;

		if (thresholdStrategy === 'fixed') {
			nearBottom = scrollPosition + windowHeight >= scrollHeight - threshold;
		} else {
			// viewport strategy
			const thresholdPx = windowHeight * threshold;
			nearBottom = scrollPosition + windowHeight >= scrollHeight - thresholdPx;
		}

		// Only trigger if near bottom AND the page has grown since last trigger
		// This prevents infinite loops when the page is too short
		if (nearBottom && scrollHeight > lastTriggeredHeight) {
			lastTriggeredHeight = scrollHeight;

			// Clear any existing timeout
			if (scrollTimeout) {
				clearTimeout(scrollTimeout);
				scrollTimeout = null;
			}

			if (debounceMs > 0) {
				// Debounce the load
				scrollTimeout = setTimeout(() => {
					onLoad();
					scrollTimeout = null;
				}, debounceMs);
			} else {
				// Call immediately
				onLoad();
			}
		}
	}

	$effect(() => {
		// Track scroll position changes - accessing y makes this effect reactive to scroll
		void y;
		checkAndLoad();
	});

	return {
		get scrollY() {
			return y;
		},
		set scrollY(value: number) {
			y = value;
		}
	};
}
