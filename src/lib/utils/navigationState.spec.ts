import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
	saveAlbumState,
	loadAlbumState,
	saveHomeState,
	loadHomeState,
	savePictureNavState,
	loadPictureNavState
} from './navigationState';
import type { Picture } from '$lib/api/types';

// Mock sessionStorage
const sessionStorageMock = (() => {
	let store: Record<string, string> = {};

	return {
		getItem: (key: string) => store[key] || null,
		setItem: (key: string, value: string) => {
			store[key] = value;
		},
		removeItem: (key: string) => {
			delete store[key];
		},
		clear: () => {
			store = {};
		}
	};
})();

Object.defineProperty(globalThis, 'sessionStorage', {
	value: sessionStorageMock
});

const mockPicture: Picture = {
	id: '1',
	album_id: '1',
	created_at: '2024-01-01T00:00:00Z',
	updated_at: '2024-01-01T00:00:00Z',
	image_url: 'https://example.com/image.jpg',
	description: 'Test picture',
	metadata: {}
};

describe('navigationState', () => {
	beforeEach(() => {
		sessionStorageMock.clear();
		vi.clearAllMocks();
	});

	describe('saveAlbumState', () => {
		it('saves album state to sessionStorage', () => {
			saveAlbumState([mockPicture], 1, 2, false, 100);

			const saved = sessionStorage.getItem('albumState');
			expect(saved).toBeTruthy();

			const parsed = JSON.parse(saved!);
			expect(parsed.albumId).toBe(1);
			expect(parsed.page).toBe(2);
			expect(parsed.done).toBe(false);
			expect(parsed.scrollY).toBe(100);
			expect(parsed.pictures).toHaveLength(1);
			expect(parsed.timestamp).toBeDefined();
		});

		it('does not save if albumId is undefined', () => {
			saveAlbumState([mockPicture], undefined, 2, false, 100);

			const saved = sessionStorage.getItem('albumState');
			expect(saved).toBeNull();
		});
	});

	describe('loadAlbumState', () => {
		it('loads fresh album state for matching albumId', () => {
			const now = Date.now();
			const state = {
				pictures: [mockPicture],
				albumId: 1,
				page: 2,
				done: false,
				scrollY: 100,
				timestamp: now
			};

			sessionStorage.setItem('albumState', JSON.stringify(state));

			const loaded = loadAlbumState(1);
			expect(loaded).toEqual(state);
		});

		it('returns null for different albumId', () => {
			const now = Date.now();
			const state = {
				pictures: [mockPicture],
				albumId: 1,
				page: 2,
				done: false,
				scrollY: 100,
				timestamp: now
			};

			sessionStorage.setItem('albumState', JSON.stringify(state));

			const loaded = loadAlbumState(2);
			expect(loaded).toBeNull();
		});

		it('returns null for expired state', () => {
			const fiveMinutesAgo = Date.now() - 6 * 60 * 1000; // 6 minutes ago
			const state = {
				pictures: [mockPicture],
				albumId: 1,
				page: 2,
				done: false,
				scrollY: 100,
				timestamp: fiveMinutesAgo
			};

			sessionStorage.setItem('albumState', JSON.stringify(state));

			const loaded = loadAlbumState(1);
			expect(loaded).toBeNull();
		});

		it('returns null if no state exists', () => {
			const loaded = loadAlbumState(1);
			expect(loaded).toBeNull();
		});

		it('returns null and clears invalid JSON', () => {
			sessionStorage.setItem('albumState', 'invalid json');

			const loaded = loadAlbumState(1);
			expect(loaded).toBeNull();
			expect(sessionStorage.getItem('albumState')).toBeNull();
		});

		it('removes state after loading', () => {
			const now = Date.now();
			const state = {
				pictures: [mockPicture],
				albumId: 1,
				page: 2,
				done: false,
				scrollY: 100,
				timestamp: now
			};

			sessionStorage.setItem('albumState', JSON.stringify(state));

			loadAlbumState(1);
			expect(sessionStorage.getItem('albumState')).toBeNull();
		});
	});

	describe('saveHomeState', () => {
		it('saves home state to sessionStorage', () => {
			saveHomeState([mockPicture], 2, false, 100);

			const saved = sessionStorage.getItem('homeState');
			expect(saved).toBeTruthy();

			const parsed = JSON.parse(saved!);
			expect(parsed.page).toBe(2);
			expect(parsed.done).toBe(false);
			expect(parsed.scrollY).toBe(100);
			expect(parsed.pictures).toHaveLength(1);
			expect(parsed.timestamp).toBeDefined();
		});
	});

	describe('loadHomeState', () => {
		it('loads fresh home state', () => {
			const now = Date.now();
			const state = {
				pictures: [mockPicture],
				page: 2,
				done: false,
				scrollY: 100,
				timestamp: now
			};

			sessionStorage.setItem('homeState', JSON.stringify(state));

			const loaded = loadHomeState();
			expect(loaded).toEqual(state);
		});

		it('returns null for expired state', () => {
			const sixMinutesAgo = Date.now() - 6 * 60 * 1000;
			const state = {
				pictures: [mockPicture],
				page: 2,
				done: false,
				scrollY: 100,
				timestamp: sixMinutesAgo
			};

			sessionStorage.setItem('homeState', JSON.stringify(state));

			const loaded = loadHomeState();
			expect(loaded).toBeNull();
		});

		it('returns null if no state exists', () => {
			const loaded = loadHomeState();
			expect(loaded).toBeNull();
		});

		it('removes state after loading', () => {
			const now = Date.now();
			const state = {
				pictures: [mockPicture],
				page: 2,
				done: false,
				scrollY: 100,
				timestamp: now
			};

			sessionStorage.setItem('homeState', JSON.stringify(state));

			loadHomeState();
			expect(sessionStorage.getItem('homeState')).toBeNull();
		});
	});

	describe('savePictureNavState', () => {
		it('saves picture nav state to sessionStorage', () => {
			savePictureNavState([mockPicture], 1);

			const saved = sessionStorage.getItem('pictureNavState');
			expect(saved).toBeTruthy();

			const parsed = JSON.parse(saved!);
			expect(parsed.pictures).toHaveLength(1);
			expect(parsed.albumId).toBe(1);
			expect(parsed.timestamp).toBeDefined();
		});

		it('saves without albumId', () => {
			savePictureNavState([mockPicture]);

			const saved = sessionStorage.getItem('pictureNavState');
			expect(saved).toBeTruthy();

			const parsed = JSON.parse(saved!);
			expect(parsed.pictures).toHaveLength(1);
			expect(parsed.albumId).toBeUndefined();
		});
	});

	describe('loadPictureNavState', () => {
		it('loads fresh picture nav state', () => {
			const now = Date.now();
			const state = {
				pictures: [mockPicture],
				albumId: 1,
				timestamp: now
			};

			sessionStorage.setItem('pictureNavState', JSON.stringify(state));

			const loaded = loadPictureNavState();
			expect(loaded).toEqual(state);
		});

		it('returns null for expired state', () => {
			const sixMinutesAgo = Date.now() - 6 * 60 * 1000;
			const state = {
				pictures: [mockPicture],
				albumId: 1,
				timestamp: sixMinutesAgo
			};

			sessionStorage.setItem('pictureNavState', JSON.stringify(state));

			const loaded = loadPictureNavState();
			expect(loaded).toBeNull();
		});

		it('returns null if no state exists', () => {
			const loaded = loadPictureNavState();
			expect(loaded).toBeNull();
		});

		it('does NOT remove state after loading (unlike album/home state)', () => {
			const now = Date.now();
			const state = {
				pictures: [mockPicture],
				albumId: 1,
				timestamp: now
			};

			sessionStorage.setItem('pictureNavState', JSON.stringify(state));

			loadPictureNavState();
			expect(sessionStorage.getItem('pictureNavState')).toBeTruthy();
		});
	});
});
