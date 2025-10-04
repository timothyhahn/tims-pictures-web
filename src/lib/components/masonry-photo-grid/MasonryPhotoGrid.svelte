<script lang="ts">
	import type { Picture } from '$lib/api/types';
	import {
		getPatternIndex,
		isTallItem as checkTallItem,
		isWideItem as checkWideItem,
		isBigItem as checkBigItem
	} from '$lib/utils/masonry';
	import PhotoItem from './PhotoItem.svelte';

	interface Props {
		pictures: Picture[];
		useColumnsLayout?: boolean;
		backLocation?: string;
		albumIdentifier?: string; // UUID or slug to determine pattern
		onPhotoClick?: (event: MouseEvent, picture: Picture) => void;
	}

	let {
		pictures,
		useColumnsLayout = false,
		backLocation = 'album',
		albumIdentifier,
		onPhotoClick
	}: Props = $props();

	// Select which masonry pattern to use based on album identifier
	const patternIndex = getPatternIndex(albumIdentifier);

	function isTallItem(index: number): boolean {
		return checkTallItem(index, patternIndex);
	}

	function isWideItem(index: number): boolean {
		return checkWideItem(index, patternIndex);
	}

	function isBigItem(index: number): boolean {
		return checkBigItem(index, patternIndex);
	}

	function getImageClass(index: number): string {
		// Only use special images for grid layout (not columns) on tablet+
		if (!useColumnsLayout) {
			if (isBigItem(index)) {
				return 'big';
			}
			if (isTallItem(index)) {
				return 'tall';
			}
			if (isWideItem(index)) {
				return 'wide';
			}
		}
		return 'thumbnail';
	}

	function getItemClass(index: number): string {
		if (useColumnsLayout) {
			return 'break-inside-avoid';
		}

		if (isBigItem(index)) {
			return 'big-item';
		}
		if (isTallItem(index)) {
			return 'tall-item';
		}
		if (isWideItem(index)) {
			return 'wide-item';
		}
		return '';
	}
</script>

{#if pictures.length > 0}
	<div class={useColumnsLayout ? 'columns-1 gap-4 sm:columns-2 xl:columns-3' : 'grid-layout'}>
		{#each pictures as picture, index (picture.id)}
			<PhotoItem
				{picture}
				imageClass={getImageClass(index)}
				itemClass={getItemClass(index)}
				{backLocation}
				{...onPhotoClick && { onPhotoClick }}
			/>
		{/each}
	</div>
{:else}
	<div class="py-16 text-center">
		<p class="text-xl text-gray-400">Loading pictures...</p>
	</div>
{/if}

<style>
	/* Grid layout with faux masonry - complex repeating pattern */
	.grid-layout {
		display: grid;
		gap: 1rem;
		grid-auto-flow: dense;
	}

	:global(.grid-layout .photo-item) {
		height: 100%;
	}

	/* Mobile: single column, natural aspect ratio (no masonry) */
	@media (max-width: 639px) {
		.grid-layout {
			grid-template-columns: 1fr;
			grid-auto-rows: auto;
		}

		:global(.grid-layout .photo-item) {
			height: auto;
		}
	}

	/* Tablet: 2-3 columns with masonry */
	@media (min-width: 640px) and (max-width: 1023px) {
		.grid-layout {
			grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
			grid-auto-rows: 350px;
		}

		/* Tall items span 2 rows */
		:global(.grid-layout .tall-item) {
			grid-row: span 2;
		}

		/* Wide items span 2 columns */
		:global(.grid-layout .wide-item) {
			grid-column: span 2;
		}

		/* Big items span 2 rows AND 2 columns */
		:global(.grid-layout .big-item) {
			grid-row: span 2;
			grid-column: span 2;
		}
	}

	/* Desktop: 3 columns with masonry */
	@media (min-width: 1024px) {
		.grid-layout {
			grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
			grid-auto-rows: 400px;
		}

		/* Tall items span 2 rows */
		:global(.grid-layout .tall-item) {
			grid-row: span 2;
		}

		/* Wide items span 2 columns */
		:global(.grid-layout .wide-item) {
			grid-column: span 2;
		}

		/* Big items span 2 rows AND 2 columns */
		:global(.grid-layout .big-item) {
			grid-row: span 2;
			grid-column: span 2;
		}
	}
</style>
