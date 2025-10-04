/**
 * Masonry Layout System
 *
 * Creates visually distinct photo grid layouts using prime number patterns
 * and intelligent gap-filling algorithms.
 *
 * See README.md for detailed documentation.
 */

import { getPatternIndex } from './hash';
import { findPerfectPattern } from './perfect';
import { simulateGridLayout } from './simulation';
import { createComprehensiveFixups } from './fixups';
import type { MasonryLayoutConfig } from './types';

// Re-export public API
export { hashString, getPatternIndex } from './hash';
export { isTallItem, isWideItem, isBigItem, isFullWidthItem } from './patterns';
export { simulateGridLayout } from './simulation';
export { findPerfectPattern } from './perfect';
export type { MasonryLayoutConfig, GridItem, GridLayoutResult, SizeOverride } from './types';

/**
 * Main orchestrator function for perfect tiling masonry layout
 *
 * This function:
 * 1. Hashes album ID to get starting pattern
 * 2. Searches for a pattern that tiles perfectly
 * 3. Applies comprehensive fixups to eliminate visual gaps
 * 4. Returns complete configuration for rendering
 *
 * @param albumId - Album identifier (for pattern selection)
 * @param photoCount - Total number of photos in the album
 * @param numColumns - Number of columns in the grid (default: 2)
 * @returns Complete masonry layout configuration
 */
export function getMasonryLayout(
	albumId: string,
	photoCount: number,
	numColumns: number = 2
): MasonryLayoutConfig {
	// Step 1: Get initial pattern from hash
	const initialPatternIndex = getPatternIndex(albumId);

	// Step 2: Try to find a perfect pattern
	const perfectPatternIndex = findPerfectPattern(photoCount, initialPatternIndex, numColumns);

	// Step 3: Simulate with the selected pattern
	let layout = simulateGridLayout(photoCount, perfectPatternIndex, numColumns);

	// Track which patterns we tried
	const triedPatterns: number[] = [];
	const patternCount = 10; // MASONRY_PATTERNS.length
	for (let i = 0; i < patternCount; i++) {
		triedPatterns.push((initialPatternIndex + i) % patternCount);
	}

	// Step 4: Apply comprehensive fixups (analyzes entire grid, not just last row)
	const overrides = createComprehensiveFixups(photoCount, perfectPatternIndex, numColumns);

	// Re-simulate with fixups to get accurate stats
	if (overrides.size > 0) {
		layout = simulateGridLayout(photoCount, perfectPatternIndex, numColumns, overrides);
	}

	return {
		patternIndex: perfectPatternIndex,
		overrides,
		isPerfect: layout.isPerfect,
		totalRows: layout.totalRows,
		emptySlots: layout.emptySlots,
		triedPatterns
	};
}
