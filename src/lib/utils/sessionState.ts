import { NAVIGATION_STATE_EXPIRY_MS } from '$lib/constants';

interface BaseState {
	timestamp: number;
}

interface StateOptions<T extends BaseState> {
	/**
	 * Optional validator function to check if loaded state is valid
	 * Returns true if state is valid, false otherwise
	 */
	validator?: (state: T) => boolean;

	/**
	 * Whether to remove the state from storage after loading (default: true)
	 */
	removeAfterLoad?: boolean;
}

/**
 * Generic function to save state to session storage
 *
 * @param key - Storage key to use
 * @param state - State object to save (must include timestamp)
 */
export function saveSessionState<T extends BaseState>(key: string, state: T): void {
	try {
		sessionStorage.setItem(key, JSON.stringify(state));
	} catch (error) {
		console.error(`Failed to save session state for ${key}:`, error);
	}
}

/**
 * Generic function to load state from session storage
 *
 * @param key - Storage key to load from
 * @param options - Optional configuration
 * @returns Loaded state or null if not found/expired/invalid
 */
export function loadSessionState<T extends BaseState>(
	key: string,
	options: StateOptions<T> = {}
): T | null {
	const { validator, removeAfterLoad = true } = options;

	const savedState = sessionStorage.getItem(key);
	if (!savedState) return null;

	try {
		const state: T = JSON.parse(savedState);

		// Check if data is fresh (within expiry time)
		const isExpired = Date.now() - state.timestamp >= NAVIGATION_STATE_EXPIRY_MS;
		if (isExpired) {
			sessionStorage.removeItem(key);
			return null;
		}

		// Run custom validator if provided
		if (validator && !validator(state)) {
			sessionStorage.removeItem(key);
			return null;
		}

		// Remove from storage after successful load if configured
		if (removeAfterLoad) {
			sessionStorage.removeItem(key);
		}

		return state;
	} catch (error) {
		console.error(`Failed to load session state for ${key}:`, error);
		sessionStorage.removeItem(key);
		return null;
	}
}

/**
 * Remove state from session storage
 *
 * @param key - Storage key to remove
 */
export function clearSessionState(key: string): void {
	sessionStorage.removeItem(key);
}
