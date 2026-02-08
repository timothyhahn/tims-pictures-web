<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import MasonryPhotoGrid from '$lib/components/masonry-photo-grid/MasonryPhotoGrid.svelte';
	import ScrollToTopButton from '$lib/components/ScrollToTopButton.svelte';
	import PageMetadata from '$lib/components/PageMetadata.svelte';
	import SkeletonGrid from '$lib/components/SkeletonGrid.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import { clearSidebarContext } from '$lib/stores/sidebarContext';
	import { saveHomeState, loadHomeState } from '$lib/utils/navigationState';
	import { useInfiniteScroll } from '$lib/composables/useInfiniteScroll.svelte';
	import { usePaginatedPictures } from '$lib/composables/usePaginatedPictures.svelte';
	import { isPrimaryClick, handlePrimaryClick } from '$lib/utils/photoClick';
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
	let loadError = $state<string | null>(null);

	// Hero image: pick a random index from the first 3 pictures, stable across re-renders
	let heroIndex = $state(Math.floor(Math.random() * 3));
	let heroPicture = $derived(
		pagination.pictures.length > 0 ? pagination.pictures[Math.min(heroIndex, pagination.pictures.length - 1)] : null
	);
	let gridPictures = $derived(
		heroPicture ? pagination.pictures.filter((p) => p.id !== heroPicture.id) : pagination.pictures
	);

	let scrollEnabled = $derived(initialPicturesLoaded && !pagination.loading && !pagination.done);

	const scroll = useInfiniteScroll({
		onLoad: pagination.loadNextPage,
		get enabled() {
			return scrollEnabled;
		},
		thresholdStrategy: 'fixed'
	});

	onMount(() => {
		clearSidebarContext();
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
			data.pictures
				.then((loadedPictures) => {
					pagination.setPictures(loadedPictures);
					pagination.setPage(1); // Mark that we've loaded page 1
					initialPicturesLoaded = true;
					loadError = null;
				})
				.catch((error) => {
					console.error('[Home Page] Failed to load pictures:', error);
					loadError = error?.message || 'Failed to load pictures';
					initialPicturesLoaded = true; // Stop showing loading state
				});
		}
	});

	function retryLoad() {
		loadError = null;
		initialPicturesLoaded = false;
		window.location.reload();
	}

	function handleHeroClick(picture: Picture) {
		saveHomeState(pagination.pictures, pagination.page, pagination.done, scroll.scrollY);
		goto(`/pictures/${picture.id}?back=home`);
	}

	const handleGridPhotoClick = handlePrimaryClick((_event: MouseEvent, picture: Picture) => {
		saveHomeState(pagination.pictures, pagination.page, pagination.done, scroll.scrollY);
		goto(`/pictures/${picture.id}?back=home`);
	});

	function handleHeroImageLoad(event: Event) {
		const img = event.target as HTMLImageElement;
		img.classList.add('loaded');
	}
</script>

<svelte:window bind:scrollY={scroll.scrollY} />

<PageMetadata title="Tim's Pictures" />

<div class="container mx-auto p-6">
	{#if !initialPicturesLoaded}
		<div out:fade={{ duration: 200 }}>
			<!-- Hero skeleton -->
			<div class="mb-6 aspect-video w-full animate-pulse rounded bg-gray-800"></div>
			<SkeletonGrid count={9} columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" aspectRatio="3/2" padding="" />
		</div>
	{:else if loadError}
		<ErrorState
			message="Failed to load pictures"
			details={loadError}
			onRetry={retryLoad}
			size="large"
		/>
	{:else}
		<div in:fade={{ duration: 300, delay: 100 }}>
			<!-- Hero Image -->
			{#if heroPicture}
				<a
					href="/pictures/{heroPicture.id}?back=home"
					onclick={(e) => {
						if (isPrimaryClick(e)) {
							e.preventDefault();
							handleHeroClick(heroPicture);
						}
					}}
					class="group relative mb-6 block overflow-hidden rounded"
				>
					<div class="relative">
						<div class="absolute inset-0 animate-pulse bg-gray-700/50"></div>
						<img
							src="{heroPicture.image_url}?class=full-width"
							alt={heroPicture.description || (heroPicture.album_name ? `Photo from ${heroPicture.album_name}` : 'Photo')}
							class="image-fade-in relative w-full max-h-[60vh] object-cover"
							style="view-transition-name: picture-{heroPicture.id};"
							onload={handleHeroImageLoad}
						/>
					</div>
					{#if heroPicture.album_name}
						<div class="pointer-events-none absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-4 pb-4 pt-8 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
							<span class="text-sm text-white/90">Album: {heroPicture.album_name}</span>
						</div>
					{/if}
				</a>
			{/if}

			<!-- Masonry Grid -->
			<MasonryPhotoGrid
				pictures={gridPictures}
				albumIdentifier="home-recent"
				totalPictureCount={MAX_PICTURES}
				backLocation="home"
				showAlbumBadge
				onPhotoClick={handleGridPhotoClick}
			/>
		</div>
	{/if}
</div>

<ScrollToTopButton show={scroll.scrollY > 300} {scrollToTop} />
