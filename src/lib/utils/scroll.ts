/**
 * Scrolls smoothly to the top of the page
 */
export function scrollToTop(): void {
	window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Restores scroll position with a setTimeout to ensure DOM is ready
 * Used when restoring state from navigation history
 */
export function restoreScrollPosition(y: number): void {
	setTimeout(() => {
		window.scrollTo(0, y);
	}, 0);
}
