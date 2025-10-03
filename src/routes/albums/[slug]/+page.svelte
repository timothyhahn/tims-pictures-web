<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import ScrollToTopButton from '$lib/components/ScrollToTopButton.svelte';
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

	const PER_PAGE = 20;

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

					// Check if we got less than a full page, meaning we're done
					if (loadedPictures.length < PER_PAGE) {
						done = true;
					}

					// Check for saved state after both album and pictures load
					const savedState = sessionStorage.getItem('albumState');
					if (savedState) {
						try {
							const state = JSON.parse(savedState);
							// Check if data is fresh (less than 5 minutes old) and same album
							if (Date.now() - state.timestamp < 5 * 60 * 1000 && state.albumId === album.id) {
								pictures = state.pictures;
								page = state.page;
								done = state.done;

								setTimeout(() => {
									window.scrollTo(0, state.scrollY);
								}, 0);
							}
							sessionStorage.removeItem('albumState');
						} catch {
							sessionStorage.removeItem('albumState');
						}
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

			if (newData.data.length === 0 || newData.data.length < PER_PAGE) {
				done = true;
			}

			pictures = [...pictures, ...newData.data];
			page++;
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

		// Check if we're near the bottom of the page
		const nearBottom = y + window.innerHeight >= document.body.scrollHeight - 100;

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
			const albumState = {
				pictures,
				albumId: album?.id,
				page,
				done,
				scrollY: y,
				timestamp: Date.now()
			};
			sessionStorage.setItem('albumState', JSON.stringify(albumState));

			// Save pictures for navigation in lightbox
			const navState = {
				pictures,
				albumId: album?.id,
				timestamp: Date.now()
			};
			sessionStorage.setItem('pictureNavState', JSON.stringify(navState));

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
	<!-- Album Header -->
	{#if album}
		<div class="mb-8">
			<h1 class="mb-2 text-6xl font-extralight">{album.name}</h1>
			{#if album.description}
				<p class="text-lg text-gray-400">{album.description}</p>
			{/if}
			<p class="mt-2 text-sm text-gray-500">
				{totalPictures}
				{totalPictures === 1 ? 'photo' : 'photos'}
			</p>
		</div>
	{:else}
		<div class="mb-8">
			<div class="h-10 w-64 animate-pulse rounded bg-gray-700"></div>
		</div>
	{/if}

	<!-- Masonry Grid - Using CSS columns for now -->
	{#if pictures.length > 0}
		<div class="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
			{#each pictures as picture (picture.id)}
				<div class="group mb-4 break-inside-avoid overflow-hidden rounded-lg">
					<a
						href="/pictures/{picture.id}?back=album"
						onclick={(e) => handlePhotoClick(e, picture)}
						data-sveltekit-preload-data="off"
					>
						<img
							src="{picture.image_url}?class=thumbnail"
							alt={picture.description || 'Photo'}
							class="w-full cursor-pointer transition-transform duration-300 group-hover:scale-105"
							loading="lazy"
						/>
					</a>
				</div>
			{/each}
		</div>
	{:else if album}
		<div class="py-16 text-center">
			<p class="text-xl text-gray-400">Loading pictures...</p>
		</div>
	{/if}

	<!-- Loading indicator for infinite scroll -->
	{#if loading && pictures.length > 0}
		<div class="flex justify-center py-8">
			<div class="flex space-x-2">
				<div class="h-3 w-3 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
				<div class="h-3 w-3 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
				<div class="h-3 w-3 animate-bounce rounded-full bg-gray-400"></div>
			</div>
		</div>
	{/if}
</div>

<ScrollToTopButton show={y > 300} {scrollToTop} />
