import { simulateGridLayout } from './simulation';
import { detectGaps } from './gaps';
import type { SizeOverride } from './types';

/**
 * Creates size overrides to fix visual gaps in the entire grid
 *
 * This function applies a multi-step strategy to eliminate visual gaps:
 *
 * Step 1: Detect and fix gaps in middle rows (caused by tall items)
 * Step 2: Flatten big/tall items in last 3 rows
 * Step 3: Handle last 2 rows together for perfect tiling
 * Step 4: Fallback single-row fixups for remaining cases
 *
 * @param photoCount - Total number of photos
 * @param patternIndex - Current pattern index
 * @param numColumns - Number of columns in the grid
 * @returns Map of index -> size overrides
 */
export function createComprehensiveFixups(
	photoCount: number,
	patternIndex: number,
	numColumns: number
): Map<number, SizeOverride> {
	const overrides = new Map<number, SizeOverride>();

	// Get full layout
	const extendedLayout = simulateGridLayout(photoCount, patternIndex, numColumns);
	let { allItems, lastRowItems, emptySlots, totalRows } = extendedLayout;

	if (lastRowItems.length === 0) {
		return overrides;
	}

	// ============================================================================
	// STEP 1: Detect and fix gaps in middle rows
	// ============================================================================
	// Problem: Tall items create gaps when the next item is too wide to fit
	//
	// Before (item 17 is tall 2x1):
	//        ┌──┬──┬──┐
	// Row 6: │14│15│16│
	//        ├──┼──┼──┤
	// Row 7: │17│18│ ?│  ← Gap in row 7 (not last row!)
	//        │  ├──┼──┤     Item 17 is tall (spans rows 7-8)
	// Row 8: │  │19│19│  ← Item 19 is wide, couldn't fit in gap above
	//        └──┴──┴──┘
	//
	// Step 1 flattens item 17 (tall item spanning into gap row).
	// Remaining gaps are fixed by later steps (e.g., also flattening item 19).
	// ============================================================================

	const { hasGaps, gapRows } = detectGaps(allItems, totalRows, numColumns);

	if (hasGaps) {
		// Find all tall items that span into gap rows
		for (const item of allItems) {
			if (item.rowSpan === 2) {
				// Check if this tall item spans into a gap row
				const spansIntoGapRow = gapRows.has(item.row) || gapRows.has(item.row + 1);

				if (spansIntoGapRow) {
					// Flatten this tall item
					overrides.set(item.index, { tall: false, wide: item.colSpan === 2 });
				}
			}
		}

		// Re-simulate with overrides to see if gaps are fixed
		const reSimulated = simulateGridLayout(photoCount, patternIndex, numColumns, overrides);
		const { hasGaps: stillHasGaps } = detectGaps(
			reSimulated.allItems,
			reSimulated.totalRows,
			numColumns
		);

		// Update variables from re-simulated layout
		allItems = reSimulated.allItems;
		lastRowItems = reSimulated.lastRowItems;
		emptySlots = reSimulated.emptySlots;
		totalRows = reSimulated.totalRows;

		// If gaps are fixed and last row is perfect, we're done
		if (!stillHasGaps && emptySlots === 0) {
			return overrides;
		}
	}

	// ============================================================================
	// STEP 2: Flatten big/tall items in last 3 rows
	// ============================================================================
	// Problem: Big/tall items near the end cause unpredictable flow and extra rows
	//
	// Before (item 72 is big 2x2):  After (items 72-77 flattened):
	// Row 31: ┌────────┬──┐         Row 31: ┌──┬──┬──┐
	//         │   72   │76│                 │74│75│76│
	// Row 32: │        ├──┤         Row 32: ├──┼──┼──┤
	//         │        │77│   =>            │77│ ?│ ?│
	// Row 33: ├────────┼──┤                 └──┴──┴──┘
	//         │   75   │ ?│  Gap!
	//         └────────┴──┘
	//
	// Before: Big item causes 4 rows (31-33) with gap in row 33
	// After:  Clean 2 rows (31-32), predictable flow
	// Note:   Items 73-74 were pushed earlier due to big item at 72
	// ============================================================================

	if (totalRows >= 3) {
		const lastThreeRows = [totalRows - 3, totalRows - 2, totalRows - 1];
		const itemsInLastThreeRows = allItems.filter((item) => lastThreeRows.includes(item.row));
		const bigOrTallItems = itemsInLastThreeRows.filter(
			(item) => item.rowSpan > 1 || item.colSpan > 1
		);

		if (bigOrTallItems.length > 0) {
			// Flatten all big/tall items in last 3 rows
			bigOrTallItems.forEach((item) => {
				overrides.set(item.index, { tall: false, wide: false });
			});

			// Re-simulate to get clean layout
			const cleanSim = simulateGridLayout(photoCount, patternIndex, numColumns, overrides);
			allItems = cleanSim.allItems;
			lastRowItems = cleanSim.lastRowItems;
			emptySlots = cleanSim.emptySlots;
			totalRows = cleanSim.totalRows;
		}
	}

	// ============================================================================
	// STEP 3: Handle last 2 rows together for perfect tiling (3-column grids)
	// ============================================================================
	// Problem: Last row alone might not fill perfectly, but last 2 rows together can
	//
	// Example: 3 items in last 2 rows with 3 empty slots
	//
	// Before:              After:
	// ┌──┬──┬──┐          ┌────┬────┬────┐
	// │ A│? │? │          │  A │  B │  C │  <- All wide (1x2)
	// ├──┼──┼──┤   =>     │    │    │    │
	// │ B│ C│? │          └────┴────┴────┘
	// └──┴──┴──┘
	//
	// By making all 3 items wide, we fill 6 slots perfectly
	// ============================================================================

	if (totalRows >= 2 && numColumns === 3) {
		const secondToLastRow = totalRows - 2;
		const secondToLastRowItems = allItems.filter((item) => item.row === secondToLastRow);
		const secondToLastRowSlotsFilled = secondToLastRowItems.reduce(
			(sum, item) => sum + item.colSpan,
			0
		);
		const secondToLastRowEmpty = numColumns - secondToLastRowSlotsFilled;

		const lastRowSlotsFilled = lastRowItems.reduce((sum, item) => sum + item.colSpan, 0);
		const totalSlotsInLastTwoRows = secondToLastRowSlotsFilled + lastRowSlotsFilled;
		const totalAvailableSlots = numColumns * 2; // 2 rows
		const totalEmptyInLastTwoRows = totalAvailableSlots - totalSlotsInLastTwoRows;

		if (totalEmptyInLastTwoRows > 0) {
			const allLastTwoRowsItems = [...secondToLastRowItems, ...lastRowItems].sort((a, b) => {
				if (a.row !== b.row) return a.row - b.row;
				return a.col - b.col;
			});

			const totalItems = allLastTwoRowsItems.length;

			// 3 items, 3 empty: make all wide (3 × 2 = 6 slots ✓)
			if (totalItems === 3 && totalEmptyInLastTwoRows === 3) {
				allLastTwoRowsItems.forEach((item) => {
					overrides.set(item.index, { wide: true, tall: false });
				});
				return overrides;
			}

			// 4 items, 2 empty: make first 2 wide (2×2 + 2×1 = 6 slots ✓)
			else if (totalItems === 4 && totalEmptyInLastTwoRows === 2) {
				allLastTwoRowsItems.slice(0, 2).forEach((item) => {
					overrides.set(item.index, { wide: true, tall: false });
				});
				allLastTwoRowsItems.slice(2).forEach((item) => {
					overrides.set(item.index, { wide: false, tall: false });
				});
				return overrides;
			}

			// 4 items, 1 empty: make 1 wide (4×1 + 1×2 = 6 slots ✓)
			else if (totalItems === 4 && totalEmptyInLastTwoRows === 1) {
				if (secondToLastRowEmpty === 0) {
					// Second-to-last row full, expand last row item
					const lastItem = lastRowItems[lastRowItems.length - 1];
					if (lastItem) {
						overrides.set(lastItem.index, { wide: true, tall: false });
					}
				} else {
					// Distribute: one wide in each row
					const secondToLastItem = secondToLastRowItems[secondToLastRowItems.length - 1];
					if (secondToLastItem) {
						overrides.set(secondToLastItem.index, { wide: true, tall: false });
					}
					const firstLastRowItem = lastRowItems[0];
					if (firstLastRowItem) {
						overrides.set(firstLastRowItem.index, { wide: true, tall: false });
					}
				}
				return overrides;
			}

			// 5 items, 1 empty: make first wide (1×2 + 4×1 = 6 slots ✓)
			else if (totalItems === 5 && totalEmptyInLastTwoRows === 1) {
				const firstItem = allLastTwoRowsItems[0];
				if (firstItem) {
					overrides.set(firstItem.index, { wide: true, tall: false });
				}
				allLastTwoRowsItems.slice(1).forEach((item) => {
					overrides.set(item.index, { wide: false, tall: false });
				});
				return overrides;
			}
		}
	}

	// ============================================================================
	// STEP 4: Fallback single-row fixups
	// ============================================================================

	// Case A: Single item in last row - expand to full width
	// Before:          After:
	// ┌──┬──┬──┐      ┌─────────┐
	// │ A│? │? │  =>  │    A    │
	// └──┴──┴──┘      └─────────┘

	if (lastRowItems.length === 1) {
		const item = lastRowItems[0];
		if (!item) return overrides;

		if (item.colSpan < numColumns) {
			if (numColumns === 2) {
				// 2-column: 1x1 → 1x2 (wide)
				overrides.set(item.index, { wide: true, tall: false });
			} else if (numColumns === 3) {
				// 3-column: 1x1 or 1x2 → 1x3 (fullWidth)
				overrides.set(item.index, { fullWidth: true, tall: false });
			}
		}
		return overrides;
	}

	// Case B: Two items in last row
	// If both normal (1x1), make one tall for visual interest
	// If any are tall/wide, flatten to prevent gaps

	if (lastRowItems.length === 2) {
		const bothNormal =
			lastRowItems.every((item) => item.rowSpan === 1 && item.colSpan === 1) && emptySlots === 0;

		if (bothNormal) {
			// Two 1x1 items - make the first one tall for visual interest
			const firstItem = lastRowItems[0];
			if (!firstItem) return overrides;
			overrides.set(firstItem.index, { tall: true, wide: false });
			return overrides;
		}

		// Any tall/wide items with 2 items creates gaps - flatten everything
		const hasNonNormal = lastRowItems.some((item) => item.rowSpan !== 1 || item.colSpan !== 1);
		if (hasNonNormal) {
			for (const item of lastRowItems) {
				overrides.set(item.index, { tall: false, wide: false });
			}
			// Re-simulate to get updated emptySlots count
			const reSimAfterFlatten = simulateGridLayout(photoCount, patternIndex, numColumns, overrides);
			lastRowItems = reSimAfterFlatten.lastRowItems;
			emptySlots = reSimAfterFlatten.emptySlots;
			// Don't return - continue to Case C to handle any remaining empty slots
		}
	}

	// Case C: Last row with empty slots - expand to fill

	if (emptySlots > 0 && lastRowItems.length > 0) {
		// For 2-column grids with 1 empty slot
		if (numColumns === 2 && emptySlots === 1) {
			const lastItem = lastRowItems[lastRowItems.length - 1];
			if (lastItem) {
				overrides.set(lastItem.index, { wide: true, tall: false });
			}
			return overrides;
		}

		// For 3-column grids
		if (numColumns === 3) {
			if (emptySlots === 2 && lastRowItems.length === 1) {
				// Single item, 2 empty slots - make it full width (1x3)
				const item = lastRowItems[0];
				if (!item) return overrides;
				overrides.set(item.index, { fullWidth: true, tall: false });
				return overrides;
			}

			if (emptySlots === 1 && lastRowItems.length > 0) {
				// One empty slot
				if (lastRowItems.length === 1) {
					// Single item with 1 empty - make it wide (1x2)
					const item = lastRowItems[0];
					if (!item) return overrides;
					overrides.set(item.index, { wide: true, tall: false });
				} else {
					// Multiple items with 1 empty - make last item full width
					const lastItem = lastRowItems[lastRowItems.length - 1];
					if (!lastItem) return overrides;
					overrides.set(lastItem.index, { fullWidth: true, tall: false });
				}
				return overrides;
			}
		}
	}

	// Case D: Tall items in last row can create overflow - flatten them
	const hasTallItems = lastRowItems.some((item) => item.rowSpan === 2);
	if (hasTallItems) {
		for (const item of lastRowItems) {
			overrides.set(item.index, { tall: false, wide: item.colSpan === 2 });
		}
	}

	return overrides;
}
