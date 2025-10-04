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

/**
 * Gets the ID of the first picture element that is currently visible in the viewport
 * Returns null if no picture elements are visible
 */
export function getFirstVisiblePictureId(): string | null {
	// Look for picture elements with data-picture-id attributes
	const pictureElements = document.querySelectorAll('[data-picture-id]');
	if (pictureElements.length === 0) return null;

	const viewportTop = window.scrollY;
	const viewportBottom = viewportTop + window.innerHeight;

	for (const element of pictureElements) {
		const rect = element.getBoundingClientRect();
		const elementTop = rect.top + window.scrollY;
		const elementBottom = elementTop + rect.height;

		// Check if element is at least partially visible in viewport
		if (elementBottom > viewportTop && elementTop < viewportBottom) {
			return element.getAttribute('data-picture-id');
		}
	}

	return null;
}

/**
 * Scrolls to a specific picture element by its ID
 * Falls back to the Y position if the element is not found
 *
 * @param pictureId - The ID of the picture to scroll to
 * @param fallbackY - Fallback Y position if picture is not found
 */
export function restoreScrollToPicture(pictureId: string | null, fallbackY: number): void {
	setTimeout(() => {
		if (pictureId) {
			const element = document.querySelector(`[data-picture-id="${pictureId}"]`);
			if (element) {
				// Scroll to the element, positioning it near the top of the viewport
				const elementTop = element.getBoundingClientRect().top + window.scrollY;
				// Position it slightly below the top to account for any potential headers/padding
				const offsetY = Math.max(0, elementTop - 100);
				window.scrollTo(0, offsetY);
				return;
			}
		}

		// Fallback to Y position if element not found
		window.scrollTo(0, fallbackY);
	}, 0);
}
