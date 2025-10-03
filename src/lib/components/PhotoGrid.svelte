<script lang="ts">
	import type { Picture } from '$lib/api/types';

	interface Props {
		pictures: Picture[];
		onPhotoClick?: (picture: Picture) => void;
	}

	let { pictures, onPhotoClick }: Props = $props();

	function handleClick(picture: Picture) {
		onPhotoClick?.(picture);
	}
</script>

<div class="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
	{#each pictures as picture (picture.id)}
		<div class="group relative overflow-hidden rounded-lg bg-gray-800">
			<img
				src="{picture.image_url}?class=thumbnail"
				alt={picture.description || 'Photo'}
				class="block h-auto w-full cursor-pointer object-cover transition-transform duration-300 group-hover:scale-105"
				style="aspect-ratio: 1;"
				loading="lazy"
				onclick={() => handleClick(picture)}
			/>
		</div>
	{/each}
</div>

{#if pictures.length === 0}
	<div class="py-16 text-center text-gray-400">
		<p class="text-xl">No pictures to display</p>
	</div>
{/if}
