import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import type { Picture } from '$lib/api/types';
import { browser } from '$app/environment';

export const load: PageLoad = async ({ params, fetch }) => {
	// Check for cached navigation state in browser
	let cachedNavState = null;
	if (browser) {
		const navState = sessionStorage.getItem('pictureNavState');
		if (navState) {
			try {
				const state = JSON.parse(navState);
				// Check if data is fresh (less than 5 minutes old)
				if (
					Date.now() - state.timestamp < 5 * 60 * 1000 &&
					state.pictures &&
					state.pictures.length > 0
				) {
					cachedNavState = state;
				}
			} catch {
				sessionStorage.removeItem('pictureNavState');
			}
		}
	}

	// Fetch the picture first - AWAIT for OpenGraph tags
	const picture = await fetch(`/api/v1/pictures/${params.id}`).then((response) => {
		if (!response.ok) {
			throw error(404, 'Picture not found');
		}
		return response.json();
	});

	// After getting the picture, fetch album metadata - stream this
	const albumDataPromise = fetch(`/api/v1/albums/${picture.album_id}`)
		.then((response) => {
			if (!response.ok) {
				throw error(500, 'Failed to load album');
			}
			return response.json();
		})
		.then((album) => {
			// If we have cached state for this album, use it for navigation
			if (cachedNavState && cachedNavState.albumId === picture.album_id) {
				const currentIndex = cachedNavState.pictures.findIndex((p: Picture) => p.id === params.id);
				return {
					albumSlug: album.slug,
					albumName: album.name,
					allPictures: cachedNavState.pictures,
					currentIndex
				};
			}

			// No cached state - return empty array (no prev/next navigation)
			return {
				albumSlug: album.slug,
				albumName: album.name,
				allPictures: [],
				currentIndex: -1
			};
		});

	return {
		picture,
		albumData: albumDataPromise
	};
};
