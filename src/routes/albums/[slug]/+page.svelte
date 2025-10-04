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

	let totalPictures = $state(0);
	let initialLoad = $state(false);

	// Use masonry grid for most albums, columns only for very small ones
	let useColumnsLayout = $derived(totalPictures <= COLUMN_LAYOUT_THRESHOLD);

	// Album is loaded directly
	let album = $derived(data.album);

	// Create pagination with dynamic endpoint
	const pagination = $derived(
		album
			? usePaginatedPictures({
					endpoint: `/api/v1/albums/${album.id}/pictures`,
					perPage: PICTURES_PER_PAGE,
					...(totalPictures && { totalCount: totalPictures })
				})
			: null
	);

	let scrollEnabled = $derived(
		pagination ? !pagination.loading && !pagination.done && initialLoad : false
	);

	const scroll = useInfiniteScroll({
		onLoad: () => pagination?.loadNextPage(),
		get enabled() {
			return scrollEnabled;
		},
		thresholdStrategy: 'viewport',
		threshold: 1.5,
		debounceMs: 100
	});

	// Load pictures from promise
	$effect(() => {
		if (!initialLoad && pagination) {
			data.picturesData
				.then(({ pictures: loadedPictures, totalPictures: total }) => {
					pagination.setPictures(loadedPictures);
					totalPictures = total;
					initialLoad = true;

					// Check if we've loaded all pictures
					if (loadedPictures.length >= total) {
						pagination.setDone(true);
					}

					// Check for saved state after both album and pictures load
					const savedState = loadAlbumState(album.id);
					if (savedState) {
						pagination.setState(savedState);
						restoreScrollPosition(savedState.scrollY);
					}
				})
				.catch(() => {
					// Errors will be caught by the {#await} block
				});
		}
	});

	const handlePhotoClick = handlePrimaryClick((_event: MouseEvent, picture: Picture) => {
		if (!pagination) return;

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
	<AlbumHeader {album} {totalPictures} loading={!album} />

	<MasonryPhotoGrid
		pictures={pagination?.pictures || []}
		{useColumnsLayout}
		backLocation="album"
		albumIdentifier={album?.slug || album?.id?.toString()}
		onPhotoClick={handlePhotoClick}
	/>

	<LoadingSpinner show={!!(pagination?.loading && pagination.pictures.length > 0)} />
</div>

<ScrollToTopButton show={scroll.scrollY > 300} {scrollToTop} />
