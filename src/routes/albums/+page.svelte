<script lang="ts">
	import AlbumCard from '$lib/components/AlbumCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="container mx-auto p-6">
	<!-- Header -->
	<div class="mb-8">
		<h1 class="mb-2 text-4xl font-bold">Albums</h1>
		<p class="text-gray-400">Browse all public photo albums</p>
	</div>

	<!-- Albums Grid -->
	{#await data.albums}
		<div class="py-16 text-center">
			<p class="text-gray-400">Loading albums...</p>
		</div>
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
		<div class="mb-6 rounded-lg border border-red-800 bg-red-900/20 p-4">
			<p class="text-red-400">Error loading albums</p>
		</div>
	{/await}
</div>
