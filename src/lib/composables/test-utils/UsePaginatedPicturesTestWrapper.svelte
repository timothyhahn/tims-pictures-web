<script lang="ts">
	import { usePaginatedPictures } from '../usePaginatedPictures.svelte';
	import { mockPicturesResponse } from '$lib/test-utils/api-mocks';

	interface Props {
		endpoint: string;
		perPage: number;
		maxItems?: number;
		totalCount?: number;
	}

	let { endpoint, perPage, maxItems, totalCount }: Props = $props();

	const pagination = usePaginatedPictures({
		endpoint,
		perPage,
		...(maxItems !== undefined && { maxItems }),
		...(totalCount !== undefined && { totalCount })
	});
</script>

<div>
	<div data-testid="pictures-count">{pagination.pictures.length}</div>
	<div data-testid="page">{pagination.page}</div>
	<div data-testid="loading">{pagination.loading}</div>
	<div data-testid="done">{pagination.done}</div>

	<button onclick={() => pagination.loadNextPage()}>Load Next</button>
	<button onclick={() => pagination.setPictures(mockPicturesResponse.data)}>Set Pictures</button>
	<button onclick={() => pagination.setPage(5)}>Set Page 5</button>
	<button onclick={() => pagination.setDone(true)}>Set Done</button>
	<button
		onclick={() =>
			pagination.setState({
				pictures: mockPicturesResponse.data,
				page: 3,
				done: true
			})}
	>
		Set State
	</button>
</div>
