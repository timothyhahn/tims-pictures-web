/**
 * Checks if a mouse event is a primary click (left click without modifiers)
 * that should trigger navigation. Right-clicks and modifier+clicks are allowed
 * to pass through for "open in new tab" functionality.
 */
export function isPrimaryClick(event: MouseEvent): boolean {
	return event.button === 0 && !event.ctrlKey && !event.metaKey;
}

/**
 * Higher-order function that wraps a click handler to only execute on primary clicks.
 * Automatically prevents default for primary clicks.
 *
 * @param handler - The function to execute on primary clicks
 * @returns A click event handler
 */
export function handlePrimaryClick<T>(
	handler: (event: MouseEvent, ...args: T[]) => void
): (event: MouseEvent, ...args: T[]) => void {
	return (event: MouseEvent, ...args: T[]) => {
		if (isPrimaryClick(event)) {
			event.preventDefault();
			handler(event, ...args);
		}
	};
}
