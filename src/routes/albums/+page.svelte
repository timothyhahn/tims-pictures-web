<script lang="ts">
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import AlbumCard from '$lib/components/album-card/AlbumCard.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import { clearSidebarContext } from '$lib/stores/sidebarContext';
	import type { PageData } from './$types';

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
		<h1 class="mb-2 text-6xl font-thin">Albums</h1>
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
			<div in:fade={{ duration: 300, delay: 100 }} class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
				{#each albums as album (album.slug)}
					<AlbumCard {album} />
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
