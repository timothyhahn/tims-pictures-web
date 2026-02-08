<script lang="ts">
	import type { Album } from '$lib/api/types';

	interface Props {
		album: Album | null;
		totalPictures: number;
		loading?: boolean;
	}

	let { album, totalPictures, loading = false }: Props = $props();
</script>

{#if album}
	<div class="mb-8">
		<nav aria-label="Breadcrumb" class="mb-4 text-sm text-gray-500 md:hidden">
			<a href="/albums" class="transition-colors hover:text-white">Albums</a>
			<span class="mx-2">/</span>
			<span class="text-gray-300">{album.name}</span>
		</nav>
		<h1 class="mb-2 text-6xl font-extralight">{album.name}</h1>
		{#if album.description}
			<p class="text-lg text-gray-400 md:hidden">{album.description}</p>
		{/if}
		<p class="mt-2 text-sm text-gray-500 md:hidden">
			{totalPictures}
			{totalPictures === 1 ? 'photo' : 'photos'}
		</p>
	</div>
{:else if loading}
	<div class="mb-8">
		<div class="h-10 w-64 animate-pulse rounded bg-gray-700"></div>
	</div>
{/if}
