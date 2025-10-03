import type { Picture } from '$lib/api/types';

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

const STATE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

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

export function loadAlbumState(albumId: number): AlbumState | null {
	const savedState = sessionStorage.getItem('albumState');
	if (!savedState) return null;

	try {
		const state: AlbumState = JSON.parse(savedState);
		// Check if data is fresh and matches the current album
		if (Date.now() - state.timestamp < STATE_EXPIRY_MS && state.albumId === albumId) {
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

export function loadHomeState(): HomeState | null {
	const savedState = sessionStorage.getItem('homeState');
	if (!savedState) return null;

	try {
		const state: HomeState = JSON.parse(savedState);
		// Check if data is fresh (less than 5 minutes old)
		if (Date.now() - state.timestamp < STATE_EXPIRY_MS) {
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

export function savePictureNavState(pictures: Picture[], albumId?: number): void {
	const navState: PictureNavState = {
		pictures,
		albumId,
		timestamp: Date.now()
	};
	sessionStorage.setItem('pictureNavState', JSON.stringify(navState));
}

export function loadPictureNavState(): PictureNavState | null {
	const savedState = sessionStorage.getItem('pictureNavState');
	if (!savedState) return null;

	try {
		const state: PictureNavState = JSON.parse(savedState);
		// Check if data is fresh (less than 5 minutes old)
		if (Date.now() - state.timestamp < STATE_EXPIRY_MS) {
			return state;
		}
		sessionStorage.removeItem('pictureNavState');
		return null;
	} catch {
		sessionStorage.removeItem('pictureNavState');
		return null;
	}
}
