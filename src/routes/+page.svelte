<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import PhotoGrid from '$lib/components/PhotoGrid.svelte';
	import ScrollToTopButton from '$lib/components/ScrollToTopButton.svelte';
	import { saveHomeState, loadHomeState } from '$lib/utils/navigationState';
	import type { Picture } from '$lib/api/types';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let pictures = $state<Picture[]>([]);
	let initialPicturesLoaded = $state(false);
	let restoredFromCache = $state(false);

	let y = $state(0);
	let page = $state(1);
	let loading = $state(false);
	let done = $state(false);

	const MAX_PICTURES = 48;
	const PER_PAGE = 12;

	onMount(() => {
		const savedState = loadHomeState();
		if (savedState) {
			pictures = savedState.pictures;
			page = savedState.page;
			done = savedState.done;
			restoredFromCache = true;
			initialPicturesLoaded = true;

			setTimeout(() => {
				window.scrollTo(0, savedState.scrollY);
			}, 0);
		}
	});

	// Handle initial pictures promise - only if not restored from cache
	$effect(() => {
		if (!initialPicturesLoaded && !restoredFromCache) {
			data.pictures.then((loadedPictures) => {
				pictures = loadedPictures;
				initialPicturesLoaded = true;
			});
		}
	});

	function handlePhotoClick(picture: Picture) {
		// Save state for returning to home
		saveHomeState(pictures, page, done, y);

		// For home page, we don't save pictureNavState since pictures are from different albums
		// Navigation will use the API data instead

		goto(`/pictures/${picture.id}?back=home`);
	}

	function scrollToTop() {
		window.scrollTo({ top: 0, behavior: 'smooth' });
	}

	async function loadNextPage() {
		if (done || loading || pictures.length >= MAX_PICTURES) {
			return;
		}
		loading = true;

		try {
			const response = await fetch(`/api/v1/pictures/recent?page=${page + 1}&per_page=${PER_PAGE}`);
			if (!response.ok) {
				throw new Error('Failed to fetch pictures');
			}
			const newData = await response.json();

			if (newData.data.length === 0 || pictures.length + newData.data.length >= MAX_PICTURES) {
				done = true;
			}

			pictures = [...pictures, ...newData.data.slice(0, MAX_PICTURES - pictures.length)];
			page++;
		} catch (error) {
			console.error('Failed to load more pictures:', error);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		if (y && y + window.innerHeight >= document.body.scrollHeight - 100) {
			if (!loading && !done && pictures.length < MAX_PICTURES) {
				loadNextPage();
			}
		}
	});
</script>

<svelte:window bind:scrollY={y} />

<svelte:head>
	<title>Tim's Pictures</title>
</svelte:head>

<div class="container mx-auto">
	<!-- Loading State -->
	{#if !initialPicturesLoaded}
		<div class="p-6 text-center">
			<div class="text-gray-400">Loading pictures...</div>
		</div>
	{/if}

	<!-- Photo Grid -->
	<PhotoGrid {pictures} onPhotoClick={handlePhotoClick} />
</div>

<ScrollToTopButton show={y > 300} {scrollToTop} />
