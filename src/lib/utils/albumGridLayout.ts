import { simulateGridLayout } from '$lib/utils/masonry/simulation';
import type { GridItem, SizeOverride } from '$lib/utils/masonry/types';

export interface AlbumLayoutInput {
	pictureCount: number;
	tier: 'large' | 'medium' | 'small';
}

export interface AlbumSpan {
	colSpan: number;
	rowSpan: number;
}

/**
 * Computes gap-free grid spans for album cards.
 *
 * Uses the masonry simulation engine to place items with dense packing,
 * then promotes/demotes items to eliminate empty cells.
 */
export function computeAlbumGridLayout(
	albums: AlbumLayoutInput[],
	numColumns: number
): AlbumSpan[] {
	const n = albums.length;
	if (n === 0) return [];
	if (numColumns <= 1) return albums.map(() => ({ colSpan: 1, rowSpan: 1 }));

	// Step 1: Initial spans from tiers
	const spans: AlbumSpan[] = albums.map((a) =>
		a.tier === 'large' ? { colSpan: 2, rowSpan: 2 } : { colSpan: 1, rowSpan: 1 }
	);

	// Step 2: Calculate cell deficit
	const totalCells = spans.reduce((sum, s) => sum + s.colSpan * s.rowSpan, 0);
	const deficit = (numColumns - (totalCells % numColumns)) % numColumns;

	// Step 3: Promote highest-count non-large items to wide (1×2) to fill deficit
	if (deficit > 0) {
		const candidates = albums
			.map((a, i) => ({ index: i, pictureCount: a.pictureCount, tier: a.tier }))
			.filter((c) => c.tier !== 'large')
			.sort((a, b) => b.pictureCount - a.pictureCount);

		for (let i = 0; i < Math.min(deficit, candidates.length); i++) {
			const candidate = candidates[i];
			if (candidate) spans[candidate.index] = { colSpan: 2, rowSpan: 1 };
		}
	}

	// Step 4: Simulate and verify
	const overrides = buildOverrides(spans);
	const layout = simulateGridLayout(n, 0, numColumns, overrides);

	if (isLayoutGapFree(layout.allItems, numColumns)) {
		return spans;
	}

	// Step 5: Fallback — demote large items (smallest first) until gaps are gone
	const largeIndices = albums
		.map((a, i) => ({ index: i, pictureCount: a.pictureCount, tier: a.tier }))
		.filter((c) => c.tier === 'large')
		.sort((a, b) => a.pictureCount - b.pictureCount);

	for (const large of largeIndices) {
		// Snapshot current spans before mutating
		const snapshot = spans.map((s) => ({ ...s }));

		// Try demoting to wide-only (2×1)
		spans[large.index] = { colSpan: 2, rowSpan: 1 };
		const result = tryLayout(spans, n, numColumns);
		if (result.perfect) return spans;

		// Try demoting to 1×1
		spans[large.index] = { colSpan: 1, rowSpan: 1 };

		// Recalculate deficit and re-promote
		const newTotal = spans.reduce((sum, s) => sum + s.colSpan * s.rowSpan, 0);
		const newDeficit = (numColumns - (newTotal % numColumns)) % numColumns;
		if (newDeficit > 0) {
			const candidates = albums
				.map((a, i) => ({ index: i, pictureCount: a.pictureCount }))
				.filter((c) => {
					const s = spans[c.index];
					return s && s.colSpan === 1 && s.rowSpan === 1;
				})
				.sort((a, b) => b.pictureCount - a.pictureCount);

			for (let i = 0; i < Math.min(newDeficit, candidates.length); i++) {
				const candidate = candidates[i];
				if (candidate) spans[candidate.index] = { colSpan: 2, rowSpan: 1 };
			}
		}

		const result2 = tryLayout(spans, n, numColumns);
		if (result2.perfect) return spans;

		// Restore all spans from snapshot before trying next large item
		for (let i = 0; i < snapshot.length; i++) {
			spans[i] = snapshot[i]!;
		}
	}

	// Accept best effort
	return spans;
}

function buildOverrides(spans: AlbumSpan[]): Map<number, SizeOverride> {
	const overrides = new Map<number, SizeOverride>();
	spans.forEach((s, i) => {
		overrides.set(i, {
			tall: s.rowSpan > 1,
			wide: s.colSpan > 1
		});
	});
	return overrides;
}

function tryLayout(
	spans: AlbumSpan[],
	n: number,
	numColumns: number
): { perfect: boolean } {
	const overrides = buildOverrides(spans);
	const layout = simulateGridLayout(n, 0, numColumns, overrides);
	return { perfect: isLayoutGapFree(layout.allItems, numColumns) };
}

/**
 * Checks if a simulated layout has no empty cells.
 *
 * The simulation's built-in totalRows/emptySlots don't account for
 * items whose rowSpan extends beyond their starting row, so we
 * compute the actual grid bounds from item positions + spans.
 */
function isLayoutGapFree(items: GridItem[], numColumns: number): boolean {
	if (items.length === 0) return true;
	const actualMaxRow = items.reduce(
		(max, item) => Math.max(max, item.row + item.rowSpan - 1),
		0
	);
	const actualTotalRows = actualMaxRow + 1;
	const filledCells = items.reduce((sum, item) => sum + item.colSpan * item.rowSpan, 0);
	return filledCells === actualTotalRows * numColumns;
}
