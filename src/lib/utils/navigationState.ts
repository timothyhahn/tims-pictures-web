import type { Picture } from '$lib/api/types';
import { NAVIGATION_STATE_EXPIRY_MS } from '$lib/constants';

interface AlbumState {
	pictures: Picture[];
	albumId: number;
	page: number;
	done: boolean;
	scrollY: number;
	timestamp: number;
}

interface HomeState {
	pictures: Picture[];
	page: number;
	done: boolean;
	scrollY: number;
	timestamp: number;
}

interface PictureNavState {
	pictures: Picture[];
	albumId?: number;
	timestamp: number;
}

/**
 * Saves album browsing state to session storage for restoration on back navigation.
 *
 * @param pictures - Array of pictures loaded so far
 * @param albumId - ID of the album being viewed
 * @param page - Current pagination page number
 * @param done - Whether all pictures have been loaded
 * @param scrollY - Current scroll position in pixels
 */
export function saveAlbumState(
	pictures: Picture[],
	albumId: number | undefined,
	page: number,
	done: boolean,
	scrollY: number
): void {
	if (!albumId) return;

	const albumState: AlbumState = {
		pictures,
		albumId,
		page,
		done,
		scrollY,
		timestamp: Date.now()
	};
	sessionStorage.setItem('albumState', JSON.stringify(albumState));
}

/**
 * Loads previously saved album state from session storage.
 *
 * Validates that:
 * - State exists and is valid JSON
 * - State is less than 5 minutes old
 * - Album ID matches the requested album
 *
 * @param albumId - ID of the album to load state for
 * @returns Saved album state or null if not found/expired/invalid
 */
export function loadAlbumState(albumId: number): AlbumState | null {
	const savedState = sessionStorage.getItem('albumState');
	if (!savedState) return null;

	try {
		const state: AlbumState = JSON.parse(savedState);
		// Check if data is fresh and matches the current album
		if (Date.now() - state.timestamp < NAVIGATION_STATE_EXPIRY_MS && state.albumId === albumId) {
			sessionStorage.removeItem('albumState');
			return state;
		}
		sessionStorage.removeItem('albumState');
		return null;
	} catch {
		sessionStorage.removeItem('albumState');
		return null;
	}
}

/**
 * Saves home page browsing state to session storage.
 *
 * @param pictures - Array of recent pictures loaded so far
 * @param page - Current pagination page number
 * @param done - Whether all pictures have been loaded
 * @param scrollY - Current scroll position in pixels
 */
export function saveHomeState(
	pictures: Picture[],
	page: number,
	done: boolean,
	scrollY: number
): void {
	const homeState: HomeState = {
		pictures,
		page,
		done,
		scrollY,
		timestamp: Date.now()
	};
	sessionStorage.setItem('homeState', JSON.stringify(homeState));
}

/**
 * Loads previously saved home page state from session storage.
 *
 * @returns Saved home state or null if not found/expired/invalid
 */
export function loadHomeState(): HomeState | null {
	const savedState = sessionStorage.getItem('homeState');
	if (!savedState) return null;

	try {
		const state: HomeState = JSON.parse(savedState);
		// Check if data is fresh
		if (Date.now() - state.timestamp < NAVIGATION_STATE_EXPIRY_MS) {
			sessionStorage.removeItem('homeState');
			return state;
		}
		sessionStorage.removeItem('homeState');
		return null;
	} catch {
		sessionStorage.removeItem('homeState');
		return null;
	}
}

/**
 * Saves picture navigation state for keyboard navigation between photos.
 *
 * @param pictures - Array of all pictures in the current context (album or home)
 * @param albumId - Optional album ID if navigating within an album
 */
export function savePictureNavState(pictures: Picture[], albumId?: number): void {
	const navState: PictureNavState = {
		pictures,
		...(albumId !== undefined && { albumId }),
		timestamp: Date.now()
	};
	sessionStorage.setItem('pictureNavState', JSON.stringify(navState));
}

/**
 * Loads picture navigation state for keyboard navigation.
 *
 * @returns Saved navigation state or null if not found/expired/invalid
 */
export function loadPictureNavState(): PictureNavState | null {
	const savedState = sessionStorage.getItem('pictureNavState');
	if (!savedState) return null;

	try {
		const state: PictureNavState = JSON.parse(savedState);
		// Check if data is fresh
		if (Date.now() - state.timestamp < NAVIGATION_STATE_EXPIRY_MS) {
			return state;
		}
		sessionStorage.removeItem('pictureNavState');
		return null;
	} catch {
		sessionStorage.removeItem('pictureNavState');
		return null;
	}
}
