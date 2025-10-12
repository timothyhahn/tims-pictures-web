import type { PageLoad } from './$types';

export const load: PageLoad = ({ fetch }) => {
	const albumsPromise = fetch(
		'/api/v1/albums?visibility=public&sort_by=created_at&sort_order=desc&per_page=50'
	)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`Failed to fetch albums: ${response.status} ${response.statusText}`);
			}
			return response.json();
		})
		.then((data) => data.data);

	return {
		albums: albumsPromise
	};
};
