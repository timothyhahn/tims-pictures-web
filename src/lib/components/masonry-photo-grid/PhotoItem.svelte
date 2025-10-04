<script lang="ts">
	import type { Picture } from '$lib/api/types';
	import GridPhotoItem from '../shared/GridPhotoItem.svelte';

	interface Props {
		picture: Picture;
		imageClass: string;
		itemClass: string;
		backLocation: string;
		onPhotoClick?: (event: MouseEvent, picture: Picture) => void;
	}

	let { picture, imageClass, itemClass, backLocation, onPhotoClick }: Props = $props();

	// Determine if we should fill height based on layout type
	// Columns layout (break-inside-avoid) should use natural height
	// Masonry grid should fill the height
	const fillHeight = !itemClass.includes('break-inside-avoid');
</script>

<GridPhotoItem
	{picture}
	{backLocation}
	{imageClass}
	containerClass="photo-item mb-4 {itemClass}"
	{fillHeight}
	{...onPhotoClick && { onPhotoClick }}
	preloadData={false}
/>
