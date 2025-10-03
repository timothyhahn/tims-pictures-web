<script lang="ts">
	import { goto } from '$app/navigation';
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

	<!-- Photo layout - columns for small albums, grid for large albums -->
	{#if pictures.length > 0}
		<div class={useColumnsLayout ? 'columns-layout' : 'grid-layout'}>
			{#each pictures as picture (picture.id)}
				<div class="photo-item group mb-4 overflow-hidden {useColumnsLayout ? 'break-inside-avoid' : ''}">
					<a
						href="/pictures/{picture.id}?back=album"
						onclick={(e) => handlePhotoClick(e, picture)}
						data-sveltekit-preload-data="off"
					>
						<img
							src="{picture.image_url}?class=thumbnail"
							alt={picture.description || 'Photo'}
							class="w-full cursor-pointer"
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

<style>
	/* Fade in animation for new images */
	.photo-item {
		animation: fadeIn 0.3s ease-in;
		border-radius: 0.25rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		transition: box-shadow 0.2s ease, transform 0.2s ease;
	}

	.photo-item:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
		transform: translateY(-2px);
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* Columns layout for small albums - top to bottom, left to right */
	.columns-layout {
		columns: 1;
		gap: 1rem;
	}

	.columns-layout .photo-item {
		border-radius: 0.25rem;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		transition: box-shadow 0.2s ease, transform 0.2s ease;
	}

	.columns-layout .photo-item:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
		transform: translateY(-2px);
	}

	@media (min-width: 640px) {
		.columns-layout {
			columns: 2;
		}
	}

	@media (min-width: 1280px) {
		.columns-layout {
			columns: 3;
		}
	}

	/* Grid layout with faux masonry - complex repeating pattern */
	.grid-layout {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
		grid-auto-rows: 400px;
		gap: 1rem;
		grid-auto-flow: dense; /* Fill gaps optimally */
	}

	.grid-layout .photo-item {
		height: 100%;
	}

	.grid-layout img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	/* Create subtle pattern using larger primes - spreads tall items out more */
	/* Pattern repeats every 247 items (13 × 19) making it very non-obvious */
	.grid-layout .photo-item:nth-child(13n + 5),
	.grid-layout .photo-item:nth-child(19n + 11) {
		grid-row: span 2;
	}

	/* Responsive adjustments */
	@media (max-width: 1023px) {
		.grid-layout {
			grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
			grid-auto-rows: 350px;
		}
	}

	@media (max-width: 639px) {
		.grid-layout {
			grid-template-columns: 1fr;
			grid-auto-rows: 400px;
		}
	}
</style>
