import type { PageLoad } from './$types';

export const load: PageLoad = ({ fetch }) => {
	const albumsPromise = fetch(
		'/api/v1/albums?visibility=public&sort_by=created_at&sort_order=desc&per_page=50'
	)
		.then((response) => {
			if (!response.ok) {
				throw new Error('Failed to fetch albums');
			}
			return response.json();
		})
		.then((data) => data.data)
		.catch((error) => {
			console.error('Failed to load albums:', error);
			throw error; // Re-throw to handle in component
		});

	return {
		albums: albumsPromise
	};
};
