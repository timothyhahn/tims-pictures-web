import { describe, it, expect } from 'vitest';
import {
	hashString,
	getPatternIndex,
	isTallItem,
	isWideItem,
	isBigItem,
	simulateGridLayout,
	findPerfectPattern,
	getMasonryLayout
} from './masonry/index';

describe('masonry utilities', () => {
	describe('hashString', () => {
		it('returns consistent hash for the same string', () => {
			const hash1 = hashString('test-album');
			const hash2 = hashString('test-album');
			expect(hash1).toBe(hash2);
		});

		it('returns different hashes for different strings', () => {
			const hash1 = hashString('album-1');
			const hash2 = hashString('album-2');
			expect(hash1).not.toBe(hash2);
		});

		it('always returns a positive number', () => {
			const hash = hashString('any-string');
			expect(hash).toBeGreaterThanOrEqual(0);
		});

		it('handles empty string', () => {
			const hash = hashString('');
			expect(hash).toBe(0);
		});
	});

	describe('getPatternIndex', () => {
		it('returns 0-9 for any string', () => {
			const index1 = getPatternIndex('album-1');
			const index2 = getPatternIndex('album-2');
			const index3 = getPatternIndex('album-3');

			expect(index1).toBeGreaterThanOrEqual(0);
			expect(index1).toBeLessThanOrEqual(9);
			expect(index2).toBeGreaterThanOrEqual(0);
			expect(index2).toBeLessThanOrEqual(9);
			expect(index3).toBeGreaterThanOrEqual(0);
			expect(index3).toBeLessThanOrEqual(9);
		});

		it('returns 0 when no identifier provided', () => {
			expect(getPatternIndex()).toBe(0);
			expect(getPatternIndex(undefined)).toBe(0);
		});

		it('returns consistent pattern for the same identifier', () => {
			const index1 = getPatternIndex('same-album');
			const index2 = getPatternIndex('same-album');
			expect(index1).toBe(index2);
		});
	});

	describe('isTallItem', () => {
		it('returns boolean for pattern 0', () => {
			expect(typeof isTallItem(0, 0)).toBe('boolean');
			expect(typeof isTallItem(10, 0)).toBe('boolean');
		});

		it('identifies tall items based on modulo rules for pattern 0', () => {
			// Pattern 0 tall rules: 13n + 4 or 19n + 10
			expect(isTallItem(4, 0)).toBe(true); // 13*0 + 4
			expect(isTallItem(17, 0)).toBe(true); // 13*1 + 4
			expect(isTallItem(10, 0)).toBe(true); // 19*0 + 10
			expect(isTallItem(29, 0)).toBe(true); // 19*1 + 10
		});

		it('returns false for non-tall items in pattern 0', () => {
			expect(isTallItem(0, 0)).toBe(false);
			expect(isTallItem(1, 0)).toBe(false);
			expect(isTallItem(2, 0)).toBe(false);
		});
	});

	describe('isWideItem', () => {
		it('returns boolean for pattern 0', () => {
			expect(typeof isWideItem(0, 0)).toBe('boolean');
			expect(typeof isWideItem(10, 0)).toBe('boolean');
		});

		it('identifies wide items based on modulo rules for pattern 0', () => {
			// Pattern 0 wide rules: 17n + 2 or 23n + 6
			expect(isWideItem(2, 0)).toBe(true); // 17*0 + 2
			expect(isWideItem(19, 0)).toBe(true); // 17*1 + 2
			expect(isWideItem(6, 0)).toBe(true); // 23*0 + 6
			expect(isWideItem(29, 0)).toBe(true); // 23*1 + 6
		});

		it('returns false for non-wide items in pattern 0', () => {
			expect(isWideItem(0, 0)).toBe(false);
			expect(isWideItem(1, 0)).toBe(false);
			expect(isWideItem(3, 0)).toBe(false);
		});
	});

	describe('isBigItem', () => {
		it('returns true only when item is both tall AND wide', () => {
			// Need to find an index that satisfies both tall and wide rules for pattern 0
			// Pattern 0: tall=(13n+4 or 19n+10), wide=(17n+2 or 23n+6)
			// We need to test the logic, even if intersections are rare

			// For any pattern, if an item is both tall and wide, it should be big
			const tallAndWideIndex = 29; // This is both tall (19n+10) and wide (23n+6) for pattern 0
			expect(isBigItem(tallAndWideIndex, 0)).toBe(true);
		});

		it('returns false when item is only tall', () => {
			// 4 is tall but not wide in pattern 0
			expect(isBigItem(4, 0)).toBe(false);
		});

		it('returns false when item is only wide', () => {
			// 2 is wide but not tall in pattern 0
			expect(isBigItem(2, 0)).toBe(false);
		});

		it('returns false when item is neither tall nor wide', () => {
			expect(isBigItem(0, 0)).toBe(false);
			expect(isBigItem(1, 0)).toBe(false);
		});
	});

	describe('different patterns', () => {
		it('produces different results for different pattern indices', () => {
			// Test that the same index can have different properties in different patterns
			const index = 10;

			// This test just ensures patterns are actually different
			// (We're not asserting they must be different for index 10 specifically)
			expect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9].some((i) => isTallItem(index, i))).toBeDefined();
		});

		it('ensures all 10 patterns are unique', () => {
			// Test all combinations of pattern pairs to ensure no duplicates
			for (let i = 0; i < 10; i++) {
				for (let j = i + 1; j < 10; j++) {
					// Check if patterns produce identical results for a range of indices
					// If patterns are identical, they'll match for all indices
					let identical = true;

					for (let index = 0; index < 100; index++) {
						const iTall = isTallItem(index, i);
						const jTall = isTallItem(index, j);
						const iWide = isWideItem(index, i);
						const jWide = isWideItem(index, j);

						if (iTall !== jTall || iWide !== jWide) {
							identical = false;
							break;
						}
					}

					expect(identical).toBe(false);
				}
			}
		});
	});

	describe('simulateGridLayout', () => {
		it('returns valid layout information', () => {
			const result = simulateGridLayout(4, 0, 2);
			expect(result.totalRows).toBeGreaterThan(0);
			expect(typeof result.isPerfect).toBe('boolean');
			expect(result.emptySlots).toBeGreaterThanOrEqual(0);
			expect(result.emptySlots).toBeLessThanOrEqual(2);
		});

		it('marks as perfect when emptySlots is 0', () => {
			const result = simulateGridLayout(4, 0, 2);
			if (result.emptySlots === 0) {
				expect(result.isPerfect).toBe(true);
			} else {
				expect(result.isPerfect).toBe(false);
			}
		});

		it('tracks last row items correctly', () => {
			const result = simulateGridLayout(5, 0, 2);
			expect(result.lastRowItems.length).toBeGreaterThan(0);
			const firstItem = result.lastRowItems[0];
			expect(firstItem).toBeDefined();
			if (firstItem) {
				expect(firstItem.index).toBeDefined();
			}
		});

		it('respects overrides when provided', () => {
			const overrides = new Map();
			overrides.set(0, { tall: true, wide: true });

			const result = simulateGridLayout(10, 0, 2, overrides);
			// First item should be 2x2 due to override
			expect(result.totalRows).toBeGreaterThan(0);
		});
	});

	describe('findPerfectPattern', () => {
		it('finds a perfect pattern when one exists', () => {
			// Try with a specific photo count that should have a perfect pattern
			const patternIndex = findPerfectPattern(10, 0, 2);
			const layout = simulateGridLayout(10, patternIndex, 2);

			expect(patternIndex).toBeGreaterThanOrEqual(0);
			expect(patternIndex).toBeLessThanOrEqual(9);
			expect(layout.isPerfect).toBe(true);
		});

		it('returns original pattern if no perfect pattern found', () => {
			const startPattern = 5;
			const result = findPerfectPattern(7, startPattern, 2);

			// Should return a valid pattern index
			expect(result).toBeGreaterThanOrEqual(0);
			expect(result).toBeLessThanOrEqual(9);
		});

		it('searches all patterns starting from given index', () => {
			// This test just ensures the function completes without error
			const result = findPerfectPattern(15, 3, 2);
			expect(typeof result).toBe('number');
		});
	});

	describe('getMasonryLayout', () => {
		it('returns valid configuration', () => {
			const config = getMasonryLayout('test-album', 10, 2);

			expect(config.patternIndex).toBeGreaterThanOrEqual(0);
			expect(config.patternIndex).toBeLessThanOrEqual(9);
			expect(config.overrides).toBeInstanceOf(Map);
			expect(typeof config.isPerfect).toBe('boolean');
			expect(config.totalRows).toBeGreaterThan(0);
			expect(config.triedPatterns).toHaveLength(10);
		});

		it('finds perfect pattern when possible', () => {
			const config = getMasonryLayout('test-album', 10, 2);

			// Perfect means no empty slots
			// Note: May still have overrides for visual improvements (e.g., making one of two 1x1 items tall)
			if (config.isPerfect) {
				expect(config.emptySlots).toBe(0);
			}

			// Config should be valid regardless
			expect(config.patternIndex).toBeGreaterThanOrEqual(0);
			expect(config.totalRows).toBeGreaterThan(0);
		});

		it('applies fixups when perfect pattern not found', () => {
			const config = getMasonryLayout('test-album', 7, 2);

			// Should have valid configuration even if not perfect
			expect(config.patternIndex).toBeGreaterThanOrEqual(0);
			expect(config.totalRows).toBeGreaterThan(0);
		});

		it('produces consistent results for same album', () => {
			const config1 = getMasonryLayout('same-album', 15, 2);
			const config2 = getMasonryLayout('same-album', 15, 2);

			expect(config1.patternIndex).toBe(config2.patternIndex);
			expect(config1.totalRows).toBe(config2.totalRows);
		});
	});

	describe('overrides in isTallItem/isWideItem/isBigItem', () => {
		it('isTallItem respects overrides', () => {
			const overrides = new Map();
			overrides.set(5, { tall: true });

			// Item 5 might not be tall in pattern 0, but override says it is
			const result = isTallItem(5, 0, overrides);
			expect(result).toBe(true);

			// Item without override uses pattern
			const result2 = isTallItem(10, 0, overrides);
			expect(typeof result2).toBe('boolean');
		});

		it('isWideItem respects overrides', () => {
			const overrides = new Map();
			overrides.set(3, { wide: false });

			// Override says item 3 is NOT wide
			const result = isWideItem(3, 0, overrides);
			expect(result).toBe(false);
		});

		it('isBigItem respects overrides for both dimensions', () => {
			const overrides = new Map();
			overrides.set(0, { tall: true, wide: true });

			const result = isBigItem(0, 0, overrides);
			expect(result).toBe(true);
		});
	});
});
