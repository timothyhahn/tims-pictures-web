<script lang="ts">
	import type { Picture } from '$lib/api/types';
	import {
		getPatternIndex,
		isTallItem as checkTallItem,
		isWideItem as checkWideItem,
		isBigItem as checkBigItem
	} from '$lib/utils/masonry';

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
</script>

{#if pictures.length > 0}
	<div class={useColumnsLayout ? 'columns-1 gap-4 sm:columns-2 xl:columns-3' : 'grid-layout'}>
		{#each pictures as picture, index (picture.id)}
			<div
				class="photo-item group relative mb-4 overflow-hidden rounded shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-[box-shadow,transform] duration-200 ease-in hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)] {useColumnsLayout
					? 'break-inside-avoid'
					: ''} {!useColumnsLayout && isBigItem(index)
					? 'big-item'
					: !useColumnsLayout && isTallItem(index)
						? 'tall-item'
						: !useColumnsLayout && isWideItem(index)
							? 'wide-item'
							: ''}"
			>
				<!-- Pulsing placeholder -->
				<div class="absolute inset-0 animate-pulse bg-gray-700/50"></div>

				<a
					href="/pictures/{picture.id}?back={backLocation}"
					onclick={(e) => onPhotoClick?.(e, picture)}
					data-sveltekit-preload-data="off"
				>
					<img
						src="{picture.image_url}?class={getImageClass(index)}"
						alt={picture.description || 'Photo'}
						class="image-fade-in relative w-full cursor-pointer {useColumnsLayout
							? ''
							: 'h-full object-cover'}"
						loading="lazy"
						onload={(e) => e.currentTarget.classList.add('loaded')}
					/>
				</a>
			</div>
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

	.grid-layout .photo-item {
		height: 100%;
	}

	/* Mobile: single column, natural aspect ratio (no masonry) */
	@media (max-width: 639px) {
		.grid-layout {
			grid-template-columns: 1fr;
			grid-auto-rows: auto;
		}

		.grid-layout .photo-item {
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
		.grid-layout .tall-item {
			grid-row: span 2;
		}

		/* Wide items span 2 columns */
		.grid-layout .wide-item {
			grid-column: span 2;
		}

		/* Big items span 2 rows AND 2 columns */
		.grid-layout .big-item {
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
		.grid-layout .tall-item {
			grid-row: span 2;
		}

		/* Wide items span 2 columns */
		.grid-layout .wide-item {
			grid-column: span 2;
		}

		/* Big items span 2 rows AND 2 columns */
		.grid-layout .big-item {
			grid-row: span 2;
			grid-column: span 2;
		}
	}
</style>
