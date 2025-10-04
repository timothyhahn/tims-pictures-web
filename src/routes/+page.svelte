<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import PhotoGrid from '$lib/components/PhotoGrid.svelte';
	import ScrollToTopButton from '$lib/components/ScrollToTopButton.svelte';
	import PageMetadata from '$lib/components/PageMetadata.svelte';
	import { saveHomeState, loadHomeState } from '$lib/utils/navigationState';
	import { useInfiniteScroll } from '$lib/composables/useInfiniteScroll.svelte';
	import { usePaginatedPictures } from '$lib/composables/usePaginatedPictures.svelte';
	import { scrollToTop, restoreScrollPosition } from '$lib/utils/scroll';
	import type { Picture } from '$lib/api/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	const MAX_PICTURES = 48;
	const PER_PAGE = 12;

	const pagination = usePaginatedPictures({
		endpoint: '/api/v1/pictures/recent',
		perPage: PER_PAGE,
		maxItems: MAX_PICTURES
	});

	let initialPicturesLoaded = $state(false);
	let restoredFromCache = $state(false);

	let scrollEnabled = $derived(
		!pagination.loading && !pagination.done && pagination.pictures.length < MAX_PICTURES
	);

	const scroll = useInfiniteScroll({
		onLoad: pagination.loadNextPage,
		get enabled() {
			return scrollEnabled;
		},
		thresholdStrategy: 'fixed'
	});

	onMount(() => {
		const savedState = loadHomeState();
		if (savedState) {
			pagination.setState(savedState);
			restoredFromCache = true;
			initialPicturesLoaded = true;
			restoreScrollPosition(savedState.scrollY);
		}
	});

	// Handle initial pictures promise - only if not restored from cache
	$effect(() => {
		if (!initialPicturesLoaded && !restoredFromCache) {
			data.pictures.then((loadedPictures) => {
				pagination.setPictures(loadedPictures);
				initialPicturesLoaded = true;
			});
		}
	});

	function handlePhotoClick(picture: Picture) {
		// Save state for returning to home
		saveHomeState(pagination.pictures, pagination.page, pagination.done, scroll.scrollY);

		// For home page, we don't save pictureNavState since pictures are from different albums
		// Navigation will use the API data instead

		goto(`/pictures/${picture.id}?back=home`);
	}
</script>

<svelte:window bind:scrollY={scroll.scrollY} />

<PageMetadata title="Tim's Pictures" />

<div class="container mx-auto">
	<!-- Loading State -->
	{#if !initialPicturesLoaded}
		<div class="p-6 text-center">
			<div class="text-gray-400">Loading pictures...</div>
		</div>
	{/if}

	<!-- Photo Grid -->
	<PhotoGrid pictures={pagination.pictures} onPhotoClick={handlePhotoClick} />
</div>

<ScrollToTopButton show={scroll.scrollY > 300} {scrollToTop} />
