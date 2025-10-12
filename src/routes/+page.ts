import type { PageLoad } from './$types';

export const load: PageLoad = ({ fetch }) => {
	const PER_PAGE = 12;

	const picturesPromise = fetch(`/api/v1/pictures/recent?page=1&per_page=${PER_PAGE}`)
		.then((response) => {
			if (!response.ok) {
				throw new Error(`Failed to fetch pictures: ${response.status} ${response.statusText}`);
			}
			return response.json();
		})
		.then((data) => data.data);

	return {
		pictures: picturesPromise
	};
};
