<script lang="ts">
	import { goto } from '$app/navigation';
	import ScrollToTopButton from '$lib/components/ScrollToTopButton.svelte';
	import AlbumHeader from '$lib/components/AlbumHeader.svelte';
	import MasonryPhotoGrid from '$lib/components/masonry-photo-grid/MasonryPhotoGrid.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import PageMetadata from '$lib/components/PageMetadata.svelte';
	import { saveAlbumState, loadAlbumState, savePictureNavState } from '$lib/utils/navigationState';
	import { useInfiniteScroll } from '$lib/composables/useInfiniteScroll.svelte';
	import { usePaginatedPictures } from '$lib/composables/usePaginatedPictures.svelte';
	import { handlePrimaryClick } from '$lib/utils/photoClick';
	import { scrollToTop, restoreScrollPosition } from '$lib/utils/scroll';
	import { PICTURES_PER_PAGE, COLUMN_LAYOUT_THRESHOLD } from '$lib/constants';
	import type { PageData } from './$types';
	import type { Picture } from '$lib/api/types';

	let { data }: { data: PageData } = $props();

	let initialLoad = $state(false);
	let loadError = $state<string | null>(null);

	// Album is loaded directly
	let album = $state(data.album);
	let currentAlbumId = $state(data.album.id);

	// Use masonry grid for most albums, columns only for very small ones
	let useColumnsLayout = $derived(data.album.picture_count <= COLUMN_LAYOUT_THRESHOLD);

	// Create pagination for current album
	let pagination = $state(
		usePaginatedPictures({
			endpoint: `/api/v1/albums/${data.album.id}/pictures`,
			perPage: PICTURES_PER_PAGE
		})
	);

	let scrollEnabled = $derived(!pagination.loading && !pagination.done && initialLoad);

	const scroll = useInfiniteScroll({
		onLoad: () => pagination.loadNextPage(),
		get enabled() {
			return scrollEnabled;
		},
		thresholdStrategy: 'viewport',
		threshold: 1.5,
		debounceMs: 100
	});

	// Reset when navigating to a different album
	$effect(() => {
		if (data.album.id !== currentAlbumId) {
			currentAlbumId = data.album.id;
			album = data.album;
			initialLoad = false;
			loadError = null;
			pagination = usePaginatedPictures({
				endpoint: `/api/v1/albums/${data.album.id}/pictures`,
				perPage: PICTURES_PER_PAGE
			});
		}
	});

	// Load pictures from promise
	$effect(() => {
		if (!initialLoad) {
			data.picturesData
				.then(({ pictures: loadedPictures }) => {
					pagination.setPictures(loadedPictures);
					pagination.setPage(1); // Mark that we've loaded page 1
					initialLoad = true;
					loadError = null;

					// Check if we've loaded all pictures
					if (loadedPictures.length >= data.album.picture_count) {
						pagination.setDone(true);
					}

					// Check for saved state after both album and pictures load
					const savedState = loadAlbumState(album.id);
					if (savedState) {
						pagination.setState(savedState);
						restoreScrollPosition(savedState.scrollY);
					}
				})
				.catch((error) => {
					console.error('[Album Page] Failed to load pictures:', error);
					loadError = error?.message || 'Failed to load pictures';
					initialLoad = true; // Prevent infinite loading state
				});
		}
	});

	const handlePhotoClick = handlePrimaryClick((_event: MouseEvent, picture: Picture) => {
		// Save state for returning to album
		saveAlbumState(
			pagination.pictures,
			album?.id,
			pagination.page,
			pagination.done,
			scroll.scrollY
		);

		// Save pictures for navigation in lightbox
		savePictureNavState(pagination.pictures, album?.id);

		goto(`/pictures/${picture.id}?back=album`);
	});
</script>

<svelte:window bind:scrollY={scroll.scrollY} />

<PageMetadata
	title={album?.name ? `${album.name} - Tim's Pictures` : "Tim's Pictures"}
	ogTitle={album?.name || "Tim's Pictures"}
	{...album?.cover_picture_url && { ogImage: album.cover_picture_url }}
	{...album?.description && { ogDescription: album.description }}
/>

<div class="container mx-auto p-6">
	<AlbumHeader {album} totalPictures={data.album.picture_count} loading={!album} />

	{#if loadError}
		<div class="py-16 text-center">
			<p class="mb-4 text-xl text-red-400">Failed to load pictures</p>
			<p class="text-gray-400">{loadError}</p>
			<button
				class="mt-4 rounded bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
				onclick={() => window.location.reload()}
			>
				Retry
			</button>
		</div>
	{:else}
		<MasonryPhotoGrid
			pictures={pagination.pictures}
			{useColumnsLayout}
			backLocation="album"
			albumIdentifier={album?.slug || album?.id?.toString()}
			totalPictureCount={data.album.picture_count}
			onPhotoClick={handlePhotoClick}
		/>

		<LoadingSpinner show={pagination.loading && pagination.pictures.length > 0} />
	{/if}
</div>

<ScrollToTopButton show={scroll.scrollY > 300} {scrollToTop} />
