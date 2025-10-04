<script lang="ts">
	import type { Picture } from '$lib/api/types';
	import { handlePrimaryClick } from '$lib/utils/photoClick';
	import GridPhotoItem from './shared/GridPhotoItem.svelte';

	interface Props {
		pictures: Picture[];
		onPhotoClick?: (picture: Picture) => void;
		backLocation?: string;
	}

	let { pictures, onPhotoClick, backLocation = 'home' }: Props = $props();

	const handleClick = handlePrimaryClick((_event: MouseEvent, picture: Picture) => {
		onPhotoClick?.(picture);
	});
</script>

<div class="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
	{#each pictures as picture (picture.id)}
		<GridPhotoItem
			{picture}
			{backLocation}
			imageStyle="aspect-ratio: 1;"
			onPhotoClick={handleClick}
		/>
	{/each}
</div>

{#if pictures.length === 0}
	<div class="py-16 text-center text-gray-400">
		<p class="text-xl">No pictures to display</p>
	</div>
{/if}
