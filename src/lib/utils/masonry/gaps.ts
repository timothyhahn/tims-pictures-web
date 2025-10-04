import type { GridItem } from './types';

/**
 * Detects visual gaps in the entire grid layout
 *
 * Gaps occur when:
 * 1. Tall items create empty spaces in subsequent rows
 * 2. Last row doesn't fill completely
 * 3. Items are arranged in visually unbalanced ways
 */
export function detectGaps(
	allItems: GridItem[],
	totalRows: number,
	numColumns: number
): { hasGaps: boolean; gapRows: Set<number> } {
	const gapRows = new Set<number>();

	// Build a 2D grid representation to detect gaps
	const grid: (GridItem | null)[][] = [];
	for (let r = 0; r < totalRows; r++) {
		grid[r] = new Array(numColumns).fill(null);
	}

	// Fill the grid with items (accounting for spans)
	for (const item of allItems) {
		for (let r = 0; r < item.rowSpan; r++) {
			for (let c = 0; c < item.colSpan; c++) {
				const row = item.row + r;
				const col = item.col + c;
				if (row < totalRows && col < numColumns && grid[row]) {
					grid[row][col] = item;
				}
			}
		}
	}

	// Check each row for gaps
	for (let r = 0; r < totalRows; r++) {
		let hasEmptySlot = false;
		let hasFilledSlot = false;

		const currentRow = grid[r];
		if (!currentRow) continue;

		for (let c = 0; c < numColumns; c++) {
			if (currentRow[c] === null) {
				hasEmptySlot = true;
			} else {
				hasFilledSlot = true;
			}
		}

		// If a row has both empty and filled slots, it's a gap
		// (Exception: last row is allowed to be partial)
		if (hasEmptySlot && hasFilledSlot && r < totalRows - 1) {
			gapRows.add(r);
		}
	}

	return {
		hasGaps: gapRows.size > 0,
		gapRows
	};
}

/**
 * Checks if a layout is truly perfect (no visual gaps anywhere)
 *
 * A layout can be "perfect" (emptySlots === 0) but still have visual gaps.
 * This function checks the ENTIRE grid for gaps, not just the last row.
 */
export function isTrulyPerfect(
	allItems: GridItem[],
	totalRows: number,
	lastRowItems: GridItem[],
	numColumns: number,
	emptySlots: number
): boolean {
	// Must have no empty slots in last row
	if (emptySlots !== 0) {
		return false;
	}

	// Check for gaps in the entire grid
	const { hasGaps } = detectGaps(allItems, totalRows, numColumns);
	if (hasGaps) {
		return false;
	}

	// Single item in last row that doesn't span full width = not perfect
	if (lastRowItems.length === 1) {
		const item = lastRowItems[0];
		if (!item) return false;
		if (item.colSpan !== numColumns) {
			return false;
		}
	}

	// Two items with any tall/wide = creates visual gaps
	if (lastRowItems.length === 2) {
		const hasNonNormal = lastRowItems.some((item) => item.rowSpan !== 1 || item.colSpan !== 1);
		if (hasNonNormal) {
			return false;
		}
	}

	return true;
}
