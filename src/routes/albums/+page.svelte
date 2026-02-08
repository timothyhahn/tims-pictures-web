<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import AlbumCard from '$lib/components/album-card/AlbumCard.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import { clearSidebarContext } from '$lib/stores/sidebarContext';
	import { computeAlbumGridLayout } from '$lib/utils/albumGridLayout';
	import type { Album } from '$lib/api/types';
	import type { PageData } from './$types';

	function getTier(album: Album): 'large' | 'medium' | 'small' {
		return album.picture_count >= 75 ? 'large' : album.picture_count >= 30 ? 'medium' : 'small';
	}

	let { data }: { data: PageData } = $props();

	onMount(() => {
		clearSidebarContext();
	});

	function retryLoad() {
		window.location.reload();
	}
</script>

<svelte:head>
	<title>Albums - Tim's Pictures</title>
</svelte:head>

<div class="container mx-auto p-6">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="title-reveal mb-2 text-6xl font-thin">Albums</h1>
	</div>

	<!-- Albums Grid -->
	{#await data.albums}
		<div out:fade={{ duration: 200 }} class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each Array(6) as _}
				<div class="overflow-hidden rounded bg-gray-800">
					<div class="aspect-video w-full animate-pulse bg-gray-700/50"></div>
					<div class="p-4">
						<div class="mb-2 h-5 w-32 animate-pulse rounded bg-gray-700"></div>
						<div class="h-3 w-16 animate-pulse rounded bg-gray-700"></div>
					</div>
				</div>
			{/each}
		</div>
	{:then albums}
		{#if albums.length > 0}
			{@const items = albums.map((a: Album) => ({
				pictureCount: a.picture_count,
				tier: getTier(a)
			}))}
			{@const smLayout = computeAlbumGridLayout(items, 2)}
			{@const lgLayout = computeAlbumGridLayout(items, 3)}
			<div in:fade={{ duration: 300, delay: 100 }} class="album-grid">
				{#each albums as album, i (album.slug)}
					<AlbumCard
						{album}
						tier={getTier(album)}
						smColSpan={smLayout[i]?.colSpan ?? 1}
						smRowSpan={smLayout[i]?.rowSpan ?? 1}
						lgColSpan={lgLayout[i]?.colSpan ?? 1}
						lgRowSpan={lgLayout[i]?.rowSpan ?? 1}
					/>
				{/each}
			</div>
		{:else}
			<div class="py-16 text-center">
				<p class="text-xl text-gray-400">No albums found</p>
			</div>
		{/if}
	{:catch error}
		<ErrorState
			message="Failed to load albums"
			details={error?.message}
			onRetry={retryLoad}
			size="large"
		/>
	{/await}
</div>

<style>
	.title-reveal {
		animation: title-reveal 0.6s ease-out 0.3s both;
	}

	@keyframes title-reveal {
		from {
			clip-path: inset(0 100% 0 0);
		}
		to {
			clip-path: inset(0 0 0 0);
		}
	}

	.album-grid {
		display: grid;
		grid-template-columns: repeat(1, 1fr);
		grid-auto-flow: dense;
		gap: 1.5rem;
	}

	@media (min-width: 640px) {
		.album-grid {
			grid-template-columns: repeat(2, 1fr);
			grid-auto-rows: 18rem;
		}

		.album-grid > :global(*) {
			grid-column: span var(--sm-col, 1);
			grid-row: span var(--sm-row, 1);
		}
	}

	@media (min-width: 1024px) {
		.album-grid {
			grid-template-columns: repeat(3, 1fr);
			grid-auto-rows: 20rem;
		}

		.album-grid > :global(*) {
			grid-column: span var(--lg-col, 1);
			grid-row: span var(--lg-row, 1);
		}
	}
</style>
