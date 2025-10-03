<script lang="ts">
	import type { Picture } from '$lib/api/types';

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

	// ============================================================================
	// MASONRY PATTERN SYSTEM
	// ============================================================================
	// We use 3 different masonry patterns based on album identifier to make the
	// repeating pattern virtually undetectable. Each pattern uses different prime
	// numbers to determine tall/wide/big items.
	//
	// Pattern selection: Hash the album identifier and mod 3 to get 0, 1, or 2
	// ============================================================================

	/**
	 * Define 3 distinct masonry patterns using different prime numbers.
	 * Each pattern has two sets of modulo checks for tall and wide items.
	 * The intersection creates rare "big" items (2x2).
	 */
	const MASONRY_PATTERNS = [
		// Pattern 0: Original pattern
		{
			tall: [
				{ mod: 13, offset: 4 }, // 13n + 5 in 1-indexed
				{ mod: 19, offset: 10 } // 19n + 11 in 1-indexed
			],
			wide: [
				{ mod: 17, offset: 2 }, // 17n + 3 in 1-indexed
				{ mod: 23, offset: 6 } // 23n + 7 in 1-indexed
			]
		},
		// Pattern 1: Different primes for variety
		{
			tall: [
				{ mod: 11, offset: 3 }, // 11n + 4 in 1-indexed
				{ mod: 17, offset: 8 } // 17n + 9 in 1-indexed
			],
			wide: [
				{ mod: 13, offset: 5 }, // 13n + 6 in 1-indexed
				{ mod: 19, offset: 12 } // 19n + 13 in 1-indexed
			]
		},
		// Pattern 2: Yet another set
		{
			tall: [
				{ mod: 23, offset: 7 }, // 23n + 8 in 1-indexed
				{ mod: 29, offset: 14 } // 29n + 15 in 1-indexed
			],
			wide: [
				{ mod: 11, offset: 6 }, // 11n + 7 in 1-indexed
				{ mod: 13, offset: 9 } // 13n + 10 in 1-indexed
			]
		}
	] as const;

	/**
	 * Simple string hash function to convert album identifier to a number
	 */
	function hashString(str: string): number {
		let hash = 0;
		for (let i = 0; i < str.length; i++) {
			const char = str.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash; // Convert to 32-bit integer
		}
		return Math.abs(hash);
	}

	/**
	 * Select which masonry pattern to use based on album identifier
	 * Falls back to pattern 0 if no identifier provided
	 */
	const patternIndex = albumIdentifier ? hashString(albumIdentifier) % 3 : 0;
	const selectedPattern = MASONRY_PATTERNS[patternIndex];

	/**
	 * Check if an item should be tall (span 2 rows) based on selected pattern
	 */
	function isTallItem(index: number): boolean {
		return selectedPattern.tall.some((rule) => index % rule.mod === rule.offset);
	}

	/**
	 * Check if an item should be wide (span 2 columns) based on selected pattern
	 */
	function isWideItem(index: number): boolean {
		return selectedPattern.wide.some((rule) => index % rule.mod === rule.offset);
	}

	/**
	 * Check if an item should be big (span 2 rows AND 2 columns)
	 * This happens when an item matches both tall and wide patterns - rare!
	 */
	function isBigItem(index: number): boolean {
		return isTallItem(index) && isWideItem(index);
	}

	// ============================================================================
	// END MASONRY PATTERN SYSTEM
	// ============================================================================

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
				class="photo-item group relative mb-4 overflow-hidden rounded shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-[box-shadow,transform] duration-200 ease-in hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:-translate-y-0.5 {useColumnsLayout
					? 'break-inside-avoid'
					: ''} {!useColumnsLayout && isBigItem(index) ? 'big-item' : !useColumnsLayout && isTallItem(index) ? 'tall-item' : !useColumnsLayout && isWideItem(index) ? 'wide-item' : ''}"
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
						class="image-fade-in relative w-full cursor-pointer {useColumnsLayout ? '' : 'h-full object-cover'}"
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
