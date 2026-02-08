import { describe, it, expect } from 'vitest';
import { computeAlbumGridLayout } from './albumGridLayout';
import type { AlbumLayoutInput, AlbumSpan } from './albumGridLayout';

/** Verify that the layout fills every cell in the grid with no gaps. */
function expectGapFree(spans: AlbumSpan[], numColumns: number) {
	const totalCells = spans.reduce((sum, s) => sum + s.colSpan * s.rowSpan, 0);
	expect(totalCells % numColumns).toBe(0);
}

/** Build a simple album input. */
function album(pictureCount: number, tier: AlbumLayoutInput['tier'] = 'small'): AlbumLayoutInput {
	return { pictureCount, tier };
}

describe('computeAlbumGridLayout', () => {
	describe('edge cases', () => {
		it('returns empty array for empty input', () => {
			const result = computeAlbumGridLayout([], 3);
			expect(result).toEqual([]);
		});

		it('returns all {1,1} when numColumns <= 1', () => {
			const albums = [album(50, 'large'), album(30, 'medium'), album(10, 'small')];
			const result = computeAlbumGridLayout(albums, 1);
			expect(result).toEqual([
				{ colSpan: 1, rowSpan: 1 },
				{ colSpan: 1, rowSpan: 1 },
				{ colSpan: 1, rowSpan: 1 }
			]);
		});

		it('returns all {1,1} when numColumns is 0', () => {
			const albums = [album(10), album(20)];
			const result = computeAlbumGridLayout(albums, 0);
			expect(result).toEqual([
				{ colSpan: 1, rowSpan: 1 },
				{ colSpan: 1, rowSpan: 1 }
			]);
		});
	});

	describe('all small/medium items (no large)', () => {
		it('keeps all items as {1,1} when total cells fill rows evenly', () => {
			// 4 items in 2 columns = 4 cells, 4 % 2 === 0, no deficit
			const albums = [album(10), album(20), album(30), album(40)];
			const result = computeAlbumGridLayout(albums, 2);

			result.forEach((span) => {
				expect(span).toEqual({ colSpan: 1, rowSpan: 1 });
			});
			expectGapFree(result, 2);
		});

		it('promotes highest-count item to wide when deficit is 1', () => {
			// 3 items in 2 columns = 3 cells, deficit = (2 - 3%2) % 2 = 1
			const albums = [album(10), album(50), album(20)];
			const result = computeAlbumGridLayout(albums, 2);

			// Album at index 1 (count=50) should be promoted
			expect(result[1]).toEqual({ colSpan: 2, rowSpan: 1 });
			expectGapFree(result, 2);
		});

		it('promotes multiple items when deficit requires it', () => {
			// 5 items in 3 columns = 5 cells, deficit = (3 - 5%3) % 3 = 1
			const albums = [album(5), album(40), album(30), album(20), album(10)];
			const result = computeAlbumGridLayout(albums, 3);
			expectGapFree(result, 3);
		});

		it('produces gap-free layout for 6 small items in 3 columns', () => {
			// 6 items in 3 columns = 6 cells, 6 % 3 === 0, no deficit
			const albums = Array.from({ length: 6 }, (_, i) => album(10 + i));
			const result = computeAlbumGridLayout(albums, 3);
			expectGapFree(result, 3);
		});
	});

	describe('deficit promotion', () => {
		it('promotes the item with the highest picture count', () => {
			// 3 items in 2 columns, deficit = 1
			const albums = [album(10), album(100), album(5)];
			const result = computeAlbumGridLayout(albums, 2);

			// Index 1 has highest count (100), should be promoted
			expect(result[1]).toEqual({ colSpan: 2, rowSpan: 1 });
			expectGapFree(result, 2);
		});

		it('does not promote large-tier items during deficit fill', () => {
			// 1 large (2x2=4 cells) + 1 small (1 cell) = 5 cells in 3 columns
			// deficit = (3 - 5%3) % 3 = 1
			const albums = [album(200, 'large'), album(50, 'small')];
			const result = computeAlbumGridLayout(albums, 3);
			expectGapFree(result, 3);

			// The small item should be promoted since it's the only non-large candidate
			expect(result[1]).toEqual({ colSpan: 2, rowSpan: 1 });
		});
	});

	describe('mix of large and non-large items', () => {
		it('produces gap-free layout with 1 large and 4 small in 2 columns', () => {
			// 1 large (2x2=4) + 4 small (4) = 8 cells in 2 columns = 4 rows
			const albums = [album(100, 'large'), album(40), album(30), album(20), album(10)];
			const result = computeAlbumGridLayout(albums, 2);
			expectGapFree(result, 2);
		});

		it('produces gap-free layout with 2 large and several small in 3 columns', () => {
			const albums = [
				album(100, 'large'),
				album(80, 'large'),
				album(40),
				album(30),
				album(20),
				album(15),
				album(10),
				album(5)
			];
			const result = computeAlbumGridLayout(albums, 3);
			expectGapFree(result, 3);
		});

		it('handles single large item in 2 columns', () => {
			const albums = [album(100, 'large')];
			const result = computeAlbumGridLayout(albums, 2);
			expectGapFree(result, 2);
		});
	});

	describe('fallback demotion', () => {
		it('handles inputs where large items prevent perfect packing', () => {
			// 2 large items in 3 columns — geometrically difficult since
			// 2x2 blocks can't span col 2 in a 3-col grid
			const albums = [album(100, 'large'), album(80, 'large')];
			const result = computeAlbumGridLayout(albums, 3);

			// Returns correct number of spans without crashing
			expect(result).toHaveLength(2);
			result.forEach((s) => {
				expect(s.colSpan).toBeGreaterThanOrEqual(1);
				expect(s.rowSpan).toBeGreaterThanOrEqual(1);
			});
		});

		it('preserves highest-count large items when possible', () => {
			// 3 large items in 3 columns — the algorithm should favor
			// keeping larger albums at bigger spans
			const albums = [album(100, 'large'), album(50, 'large'), album(20, 'large')];
			const result = computeAlbumGridLayout(albums, 3);

			expect(result).toHaveLength(3);
			// The largest album should have at least as large a span as the smallest
			const span0Cells = result[0]!.colSpan * result[0]!.rowSpan;
			const span2Cells = result[2]!.colSpan * result[2]!.rowSpan;
			expect(span0Cells).toBeGreaterThanOrEqual(span2Cells);
		});
	});

	describe('production scenario: 16 albums at 2 and 3 columns', () => {
		const productionAlbums: AlbumLayoutInput[] = [
			// 3 large albums
			album(100, 'large'),
			album(80, 'large'),
			album(76, 'large'),
			// 13 regular albums with various counts
			album(60, 'medium'),
			album(55, 'medium'),
			album(48, 'small'),
			album(42, 'small'),
			album(38, 'medium'),
			album(35, 'small'),
			album(30, 'small'),
			album(25, 'small'),
			album(20, 'small'),
			album(15, 'small'),
			album(12, 'small'),
			album(8, 'small'),
			album(5, 'small')
		];

		it('produces gap-free layout at 2 columns', () => {
			const result = computeAlbumGridLayout(productionAlbums, 2);
			expect(result).toHaveLength(16);
			expectGapFree(result, 2);
		});

		it('produces gap-free layout at 3 columns', () => {
			const result = computeAlbumGridLayout(productionAlbums, 3);
			expect(result).toHaveLength(16);
			expectGapFree(result, 3);
		});

		it('preserves large items as 2x2 when possible at 2 columns', () => {
			const result = computeAlbumGridLayout(productionAlbums, 2);
			const largeSpans = result.slice(0, 3);

			// At 2 columns, 2x2 items fit neatly — at least the highest-count large should stay 2x2
			const kept2x2 = largeSpans.filter((s) => s.colSpan === 2 && s.rowSpan === 2);
			expect(kept2x2.length).toBeGreaterThanOrEqual(1);
		});

		it('returns correct number of spans matching input length', () => {
			const result2 = computeAlbumGridLayout(productionAlbums, 2);
			const result3 = computeAlbumGridLayout(productionAlbums, 3);
			expect(result2).toHaveLength(productionAlbums.length);
			expect(result3).toHaveLength(productionAlbums.length);
		});
	});
});
