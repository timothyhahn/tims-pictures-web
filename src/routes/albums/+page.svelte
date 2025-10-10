<script lang="ts">
	import AlbumCard from '$lib/components/album-card/AlbumCard.svelte';
	import LoadingState from '$lib/components/LoadingState.svelte';
	import ErrorState from '$lib/components/ErrorState.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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
		<LoadingState message="Loading albums..." size="large" />
	{:then albums}
		{#if albums.length > 0}
			<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
