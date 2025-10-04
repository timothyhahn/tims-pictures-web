/**
 * Track an event with Fathom Analytics
 * Silently fails if Fathom is not available
 */
export function trackEvent(eventName: string, value?: string): void {
	if (typeof window === 'undefined' || !('fathom' in window)) {
		return;
	}

	try {
		const windowWithFathom = window as typeof window & {
			fathom: { trackEvent: (name: string, data?: { _value: string }) => void };
		};

		if (value) {
			windowWithFathom.fathom.trackEvent(eventName, { _value: value });
		} else {
			windowWithFathom.fathom.trackEvent(eventName);
		}
	} catch (err) {
		console.debug('Failed to track event:', eventName, err);
	}
}
