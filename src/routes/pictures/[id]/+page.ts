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
				if (Date.now() - state.timestamp < 5 * 60 * 1000 && state.pictures && state.pictures.length > 0) {
					cachedNavState = state;
				}
			} catch {
				sessionStorage.removeItem('pictureNavState');
			}
		}
	}

	// Fetch the picture first
	const picturePromise = fetch(`/api/v1/pictures/${params.id}`)
		.then((response) => {
			if (!response.ok) {
				throw error(404, 'Picture not found');
			}
			return response.json();
		})
		.catch((err) => {
			console.error('Failed to load picture:', err);
			throw err;
		});

	// After getting the picture, fetch album and all pictures in parallel
	const albumDataPromise = picturePromise.then((picture) => {
		// If we have cached state for this album, use it instead of fetching
		if (cachedNavState && cachedNavState.albumId === picture.album_id) {
			const currentIndex = cachedNavState.pictures.findIndex((p: Picture) => p.id === params.id);

			// Still fetch album metadata for slug and name
			return fetch(`/api/v1/albums/${picture.album_id}`)
				.then((response) => {
					if (!response.ok) {
						throw error(500, 'Failed to load album');
					}
					return response.json();
				})
				.then((album) => ({
					albumSlug: album.slug,
					albumName: album.name,
					allPictures: cachedNavState.pictures,
					currentIndex
				}))
				.catch((err) => {
					console.error('Failed to load album:', err);
					throw err;
				});
		}

		// No cached state, fetch everything
		const albumPromise = fetch(`/api/v1/albums/${picture.album_id}`)
			.then((response) => {
				if (!response.ok) {
					throw error(500, 'Failed to load album');
				}
				return response.json();
			})
			.catch((err) => {
				console.error('Failed to load album:', err);
				throw err;
			});

		const allPicturesPromise = fetch(`/api/v1/albums/${picture.album_id}/pictures?per_page=100`)
			.then((response) => {
				if (!response.ok) {
					throw error(500, 'Failed to load album pictures');
				}
				return response.json();
			})
			.then((data) => data.data)
			.catch((err) => {
				console.error('Failed to load album pictures:', err);
				return [];
			});

		return Promise.all([albumPromise, allPicturesPromise]).then(([album, allPictures]) => {
			const currentIndex = allPictures.findIndex((p: Picture) => p.id === params.id);
			return {
				albumSlug: album.slug,
				albumName: album.name,
				allPictures,
				currentIndex
			};
		});
	});

	return {
		picture: picturePromise,
		albumData: albumDataPromise
	};
};
