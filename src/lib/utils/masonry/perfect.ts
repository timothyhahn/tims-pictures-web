import { MASONRY_PATTERNS } from './constants';
import { simulateGridLayoutExtended } from './simulation';
import { isTrulyPerfect } from './gaps';

/**
 * Finds a pattern that creates perfect tiling, if one exists
 *
 * Starting from the hash-based pattern index, loops through all patterns
 * to find one that tiles perfectly with no visual gaps anywhere in the grid.
 * If none found, returns the original.
 *
 * @param photoCount - Total number of photos in the album
 * @param startPatternIndex - The hash-based pattern to start from
 * @param numColumns - Number of columns in the grid
 * @returns Pattern index that tiles perfectly, or the original if none found
 */
export function findPerfectPattern(
	photoCount: number,
	startPatternIndex: number,
	numColumns: number
): number {
	// Try all patterns starting from the hashed one
	for (let offset = 0; offset < MASONRY_PATTERNS.length; offset++) {
		const patternIndex = (startPatternIndex + offset) % MASONRY_PATTERNS.length;
		const extendedLayout = simulateGridLayoutExtended(photoCount, patternIndex, numColumns);

		if (
			isTrulyPerfect(
				extendedLayout.allItems,
				extendedLayout.totalRows,
				extendedLayout.lastRowItems,
				numColumns,
				extendedLayout.emptySlots
			)
		) {
			return patternIndex;
		}
	}

	// No truly perfect pattern found, return original
	return startPatternIndex;
}
