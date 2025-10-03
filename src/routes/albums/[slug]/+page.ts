import { error, redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	// Normalize slug to lowercase for case-insensitive matching
	const normalizedSlug = params.slug.toLowerCase();

	// If the URL slug is not lowercase, redirect to the normalized version
	if (params.slug !== normalizedSlug) {
		throw redirect(301, `/albums/${normalizedSlug}`);
	}

	// Fetch album - AWAIT for OpenGraph tags
	const album = await fetch(`/api/v1/albums/slug/${normalizedSlug}`).then((response) => {
		if (!response.ok) {
			throw error(404, 'Album not found');
		}
		return response.json();
	});

	// Fetch pictures - stream this
	const picturesPromise = fetch(`/api/v1/albums/${album.id}/pictures?per_page=20`)
		.then((response) => {
			if (!response.ok) {
				throw error(500, 'Failed to load pictures');
			}
			return response.json();
		})
		.then((data) => ({
			pictures: data.data,
			totalPictures: data.total
		}))
		.catch((err) => {
			console.error('Failed to load pictures:', err);
			return { pictures: [], totalPictures: 0 };
		});

	return {
		album,
		picturesData: picturesPromise
	};
};
