import { MASONRY_PATTERNS, isTallItem, isWideItem } from './patterns';
import { isTrulyPerfect } from './gaps';
import type { GridItem, GridLayoutResult, SizeOverride } from './types';

/**
 * Simulates CSS Grid auto-placement with grid-auto-flow: dense
 *
 * This function simulates how CSS Grid places items with varying spans,
 * matching the "dense" packing algorithm that backfills gaps.
 *
 * @param photoCount - Total number of photos in the album
 * @param patternIndex - Which masonry pattern to use (0-9)
 * @param numColumns - Number of columns in the grid (typically 2 or 3)
 * @param overrides - Optional map of index-specific size overrides
 * @returns Layout information including all items, rows, and perfection status
 */
export function simulateGridLayout(
	photoCount: number,
	patternIndex: number,
	numColumns: number,
	overrides?: Map<number, SizeOverride>
): GridLayoutResult {
	const items: GridItem[] = [];

	// Track occupied cells in a 2D grid (sparse array)
	const grid: Map<number, Set<number>> = new Map(); // row -> Set of occupied columns

	function isOccupied(row: number, col: number): boolean {
		return grid.get(row)?.has(col) ?? false;
	}

	function markOccupied(row: number, col: number, rowSpan: number, colSpan: number): void {
		for (let r = 0; r < rowSpan; r++) {
			const targetRow = row + r;
			if (!grid.has(targetRow)) {
				grid.set(targetRow, new Set());
			}
			for (let c = 0; c < colSpan; c++) {
				grid.get(targetRow)!.add(col + c);
			}
		}
	}

	function findNextAvailablePosition(
		rowSpan: number,
		colSpan: number,
		startRow: number = 0
	): { row: number; col: number } {
		let row = startRow;
		while (true) {
			// Try each column in current row
			for (let col = 0; col <= numColumns - colSpan; col++) {
				// Check if item fits at this position
				let fits = true;
				for (let r = 0; r < rowSpan && fits; r++) {
					for (let c = 0; c < colSpan && fits; c++) {
						if (isOccupied(row + r, col + c)) {
							fits = false;
						}
					}
				}
				if (fits) {
					return { row, col };
				}
			}
			// Didn't fit in current row, try next row
			row++;
		}
	}

	for (let i = 0; i < photoCount; i++) {
		// Check for overrides first
		const override = overrides?.get(i);
		const isTall = override?.tall ?? isTallItem(i, patternIndex);
		const isWide = override?.wide ?? isWideItem(i, patternIndex);
		const isFullWidth = override?.fullWidth ?? false;

		const rowSpan = isTall ? 2 : 1;
		const colSpan = isFullWidth ? numColumns : isWide ? 2 : 1;

		// With grid-auto-flow: dense, always search from row 0 to backfill gaps
		const { row, col } = findNextAvailablePosition(rowSpan, colSpan, 0);

		// Place item
		items.push({
			index: i,
			row,
			col,
			rowSpan,
			colSpan
		});

		// Mark cells as occupied
		markOccupied(row, col, rowSpan, colSpan);
	}

	// Calculate last row information
	const maxRow = items.length > 0 ? Math.max(...items.map((item) => item.row)) : 0;
	const totalRows = maxRow + 1;
	const lastRowItems = items.filter((item) => item.row === maxRow);
	const lastRowSlotsFilled = lastRowItems.reduce((sum, item) => sum + item.colSpan, 0);
	const emptySlots = numColumns - lastRowSlotsFilled;
	const isPerfect = emptySlots === 0;

	return {
		totalRows,
		lastRowItems,
		emptySlots,
		isPerfect,
		allItems: items
	};
}

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
		const layout = simulateGridLayout(photoCount, patternIndex, numColumns);

		if (
			isTrulyPerfect(
				layout.allItems,
				layout.totalRows,
				layout.lastRowItems,
				numColumns,
				layout.emptySlots
			)
		) {
			return patternIndex;
		}
	}

	// No truly perfect pattern found, return original
	return startPatternIndex;
}
