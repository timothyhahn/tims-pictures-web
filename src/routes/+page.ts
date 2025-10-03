import type { PageLoad } from './$types';

export const load: PageLoad = ({ fetch }) => {
	const picturesPromise = fetch('/api/v1/pictures/recent?page=1&per_page=12')
		.then((response) => {
			if (!response.ok) {
				throw new Error('Failed to fetch pictures');
			}
			return response.json();
		})
		.then((data) => data.data)
		.catch((error) => {
			console.error('Failed to load recent pictures:', error);
			return [];
		});

	return {
		pictures: picturesPromise
	};
};
