<script lang="ts">
	import { goto } from '$app/navigation';
	import ScrollToTopButton from '$lib/components/ScrollToTopButton.svelte';
	import AlbumHeader from '$lib/components/AlbumHeader.svelte';
	import MasonryPhotoGrid from '$lib/components/MasonryPhotoGrid.svelte';
	import LoadingSpinner from '$lib/components/LoadingSpinner.svelte';
	import { saveAlbumState, loadAlbumState, savePictureNavState } from '$lib/utils/navigationState';
	import type { PageData } from './$types';
	import type { Picture } from '$lib/api/types';
	import { page as pageStore } from '$app/stores';

	let { data }: { data: PageData } = $props();

	let pictures = $state<Picture[]>([]);
	let totalPictures = $state(0);
	let y = $state(0);
	let page = $state(1);
	let loading = $state(false);
	let done = $state(false);
	let initialLoad = $state(false);

	const PER_PAGE = 30;

	// Use masonry grid for most albums, columns only for very small ones
	let useColumnsLayout = $derived(totalPictures <= 3); // One row or less on desktop

	// Derive OpenGraph URL from page store without query params
	let ogUrl = $derived($pageStore.url.origin + $pageStore.url.pathname);

	// Album is loaded directly
	let album = $derived(data.album);

	// Load pictures from promise
	$effect(() => {
		if (!initialLoad) {
			data.picturesData
				.then(({ pictures: loadedPictures, totalPictures: total }) => {
					pictures = loadedPictures;
					totalPictures = total;
					initialLoad = true;

					// Check if we've loaded all pictures
					if (loadedPictures.length >= total) {
						done = true;
					}

					// Check for saved state after both album and pictures load
					const savedState = loadAlbumState(album.id);
					if (savedState) {
						pictures = savedState.pictures;
						page = savedState.page;
						done = savedState.done;

						setTimeout(() => {
							window.scrollTo(0, savedState.scrollY);
						}, 0);
					}
				})
				.catch(() => {
					// Errors will be caught by the {#await} block
				});
		}
	});

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	async function loadNextPage() {
		if (done || loading || !album) {
			return;
		}
		loading = true;

		try {
			const response = await fetch(
				`/api/v1/albums/${album.id}/pictures?page=${page + 1}&per_page=${PER_PAGE}`
			);
			if (!response.ok) {
				throw new Error('Failed to fetch pictures');
			}
			const newData = await response.json();

			// If we got no data, we're definitely done
			if (!newData.data || newData.data.length === 0) {
				done = true;
				return;
			}

			pictures = [...pictures, ...newData.data];
			page++;

			// Check if we've loaded all pictures based on total count
			if (pictures.length >= totalPictures) {
				done = true;
			}
		} catch (error) {
			console.error('Failed to load more pictures:', error);
			done = true;
		} finally {
			loading = false;
		}
	}

	// Debounced scroll handler to prevent blocking
	let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
	$effect(() => {
		// Guard against undefined y (race condition during initialization)
		if (typeof y !== 'number' || y < 0) {
			return;
		}

		// Check if we're near the bottom of the page - trigger earlier to preload
		// Use 1.5x viewport height as threshold so it works on all screen sizes
		const scrollHeight = document.documentElement.scrollHeight;
		const windowHeight = window.innerHeight;
		const scrollPosition = y;
		const threshold = windowHeight * 1.5;
		const nearBottom = scrollPosition + windowHeight >= scrollHeight - threshold;

		if (nearBottom && !loading && !done && initialLoad) {
			// Clear any existing timeout
			if (scrollTimeout) {
				clearTimeout(scrollTimeout);
			}
			// Debounce the load to prevent excessive calls
			scrollTimeout = setTimeout(() => {
				loadNextPage();
			}, 100);
		}

		// Cleanup function to prevent memory leaks and race conditions
		return () => {
			if (scrollTimeout) {
				clearTimeout(scrollTimeout);
				scrollTimeout = null;
			}
		};
	});

	function handlePhotoClick(event: MouseEvent, picture: Picture) {
		// Only prevent default for left clicks (not right-click or cmd+click)
		if (event.button === 0 && !event.ctrlKey && !event.metaKey) {
			event.preventDefault();

			// Save state for returning to album
			saveAlbumState(pictures, album?.id, page, done, y);

			// Save pictures for navigation in lightbox
			savePictureNavState(pictures, album?.id);

			goto(`/pictures/${picture.id}?back=album`);
		}
	}
</script>

<svelte:window bind:scrollY={y} />

<svelte:head>
	<title>{album?.name ? `${album.name} - Tim's Pictures` : "Tim's Pictures"}</title>
	<meta property="og:title" content={album?.name || "Tim's Pictures"} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={ogUrl} />
	{#if album?.cover_picture_url}
		<meta property="og:image" content={album.cover_picture_url} />
	{/if}
	{#if album?.description}
		<meta property="og:description" content={album.description} />
	{/if}
</svelte:head>

<div class="container mx-auto p-6">
	<AlbumHeader {album} {totalPictures} loading={!album} />

	<MasonryPhotoGrid
		{pictures}
		{useColumnsLayout}
		backLocation="album"
		onPhotoClick={handlePhotoClick}
	/>

	<LoadingSpinner show={loading && pictures.length > 0} />
</div>

<ScrollToTopButton show={y > 300} {scrollToTop} />
