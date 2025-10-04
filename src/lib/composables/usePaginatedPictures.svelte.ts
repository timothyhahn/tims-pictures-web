import type { Picture } from '$lib/api/types';

interface PaginationOptions {
	/**
	 * The base URL to fetch from (without query params)
	 * @example '/api/v1/pictures/recent'
	 * @example '/api/v1/albums/123/pictures'
	 */
	endpoint: string;

	/**
	 * Number of items per page
	 */
	perPage: number;

	/**
	 * Optional maximum number of items to load
	 */
	maxItems?: number;

	/**
	 * Optional total count of items available (for albums)
	 */
	totalCount?: number;
}

interface PaginationState {
	pictures: Picture[];
	page: number;
	loading: boolean;
	done: boolean;
}

export function usePaginatedPictures(options: PaginationOptions) {
	const { endpoint, perPage, maxItems, totalCount } = options;

	let pictures = $state<Picture[]>([]);
	let page = $state(0); // Start at 0 since we haven't loaded any pages yet
	let loading = $state(false);
	let done = $state(false);

	async function loadNextPage() {
		// Check if we should load more
		if (done || loading) {
			return;
		}

		// Check against max items if specified
		if (maxItems !== undefined && pictures.length >= maxItems) {
			done = true;
			return;
		}

		loading = true;

		try {
			const nextPage = page + 1;
			const url = `${endpoint}?page=${nextPage}&per_page=${perPage}`;

			const response = await fetch(url);

			if (!response.ok) {
				throw new Error(`Failed to fetch pictures: ${response.status} ${response.statusText}`);
			}

			const data = await response.json();
			const newPictures: Picture[] = data.data || [];

			// If we got no data, we're done
			if (newPictures.length === 0) {
				done = true;
				return;
			}

			// If max items specified, slice to not exceed it
			const availableSlots = maxItems !== undefined ? maxItems - pictures.length : Infinity;
			const picturesToAdd = newPictures.slice(0, availableSlots);

			pictures = [...pictures, ...picturesToAdd];
			page++;

			// Check if we're done based on various conditions
			if (
				newPictures.length === 0 ||
				(maxItems !== undefined && pictures.length >= maxItems) ||
				(totalCount !== undefined && pictures.length >= totalCount)
			) {
				done = true;
			}
		} catch (error) {
			console.error('[Pagination] Failed to load more pictures:', error);
			done = true;
		} finally {
			loading = false;
		}
	}

	function setPictures(newPictures: Picture[]) {
		pictures = newPictures;
	}

	function setPage(newPage: number) {
		page = newPage;
	}

	function setDone(isDone: boolean) {
		done = isDone;
	}

	function setState(state: Partial<PaginationState>) {
		if (state.pictures !== undefined) pictures = state.pictures;
		if (state.page !== undefined) page = state.page;
		if (state.loading !== undefined) loading = state.loading;
		if (state.done !== undefined) done = state.done;
	}

	return {
		get pictures() {
			return pictures;
		},
		get page() {
			return page;
		},
		get loading() {
			return loading;
		},
		get done() {
			return done;
		},
		loadNextPage,
		setPictures,
		setPage,
		setDone,
		setState
	};
}
