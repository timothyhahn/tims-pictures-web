<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import ScrollToTopButton from '$lib/components/ScrollToTopButton.svelte';
	import type { PageData } from './$types';
	import type { Picture } from '$lib/api/types';

	let { data }: { data: PageData } = $props();

	let pictures = $state<Picture[]>([]);
	let album = $state<any>(null);
	let totalPictures = $state(0);
	let y = $state(0);
	let page = $state(1);
	let loading = $state(false);
	let done = $state(false);
	let initialLoad = $state(false);

	const PER_PAGE = 50;

	// Load album and pictures from promises
	$effect(() => {
		if (!initialLoad) {
			data.album.then((loadedAlbum) => {
				album = loadedAlbum;
			});

			data.picturesData.then(({ pictures: loadedPictures, totalPictures: total }) => {
				pictures = loadedPictures;
				totalPictures = total;
				initialLoad = true;

				// Check if we got less than a full page, meaning we're done
				if (loadedPictures.length < PER_PAGE) {
					done = true;
				}

				// Check for saved state after pictures load
				const savedState = sessionStorage.getItem('albumState');
				if (savedState) {
					try {
						const state = JSON.parse(savedState);
						// Check if data is fresh (less than 5 minutes old) and same album
						if (Date.now() - state.timestamp < 5 * 60 * 1000 && state.albumId === album?.id) {
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

	$effect(() => {
		if (y && y + window.innerHeight >= document.body.scrollHeight - 100) {
			if (!loading && !done && initialLoad) {
				loadNextPage();
			}
		}
	});

	function handlePhotoClick(picture: Picture) {
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
</script>

<svelte:window bind:scrollY={y} />

<div class="container mx-auto p-6">
	<!-- Album Header -->
	{#if album}
		<div class="mb-8">
			<h1 class="mb-2 text-4xl font-bold">{album.name}</h1>
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
					<img
						src="{picture.image_url}?class=thumbnail"
						alt={picture.description || 'Photo'}
						class="w-full cursor-pointer transition-transform duration-300 group-hover:scale-105"
						loading="lazy"
						onclick={() => handlePhotoClick(picture)}
					/>
				</div>
			{/each}
		</div>
	{:else if album}
		<div class="py-16 text-center">
			<p class="text-xl text-gray-400">Loading pictures...</p>
		</div>
	{/if}
</div>

<ScrollToTopButton show={y > 300} {scrollToTop} />
