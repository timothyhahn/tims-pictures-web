import { MASONRY_PATTERNS } from './constants';
import type { SizeOverride } from './types';

/**
 * Check if an item should be tall (span 2 rows) based on selected pattern
 *
 * @param index - The item index
 * @param patternIndex - The pattern to use
 * @param overrides - Optional map of size overrides (for last-row fixups)
 * @returns true if item should be tall
 */
export function isTallItem(
	index: number,
	patternIndex: number,
	overrides?: Map<number, SizeOverride>
): boolean {
	// Check overrides first
	const override = overrides?.get(index);
	if (override?.tall !== undefined) {
		return override.tall;
	}

	const pattern = MASONRY_PATTERNS[patternIndex];
	if (!pattern) return false;
	return pattern.tall.some((rule) => index % rule.mod === rule.offset);
}

/**
 * Check if an item should be wide (span 2 columns) based on selected pattern
 *
 * @param index - The item index
 * @param patternIndex - The pattern to use
 * @param overrides - Optional map of size overrides (for last-row fixups)
 * @returns true if item should be wide
 */
export function isWideItem(
	index: number,
	patternIndex: number,
	overrides?: Map<number, SizeOverride>
): boolean {
	// Check overrides first
	const override = overrides?.get(index);
	if (override?.wide !== undefined) {
		return override.wide;
	}

	const pattern = MASONRY_PATTERNS[patternIndex];
	if (!pattern) return false;
	return pattern.wide.some((rule) => index % rule.mod === rule.offset);
}

/**
 * Check if an item should be big (span 2 rows AND 2 columns)
 * This happens when an item matches both tall and wide patterns - rare!
 *
 * @param index - The item index
 * @param patternIndex - The pattern to use
 * @param overrides - Optional map of size overrides (for last-row fixups)
 * @returns true if item should be big (both tall and wide)
 */
export function isBigItem(
	index: number,
	patternIndex: number,
	overrides?: Map<number, SizeOverride>
): boolean {
	return isTallItem(index, patternIndex, overrides) && isWideItem(index, patternIndex, overrides);
}

/**
 * Check if an item should span full width (all columns)
 * This is only set via overrides for last-row fixups in 3+ column grids
 *
 * @param index - The item index
 * @param overrides - Optional map of size overrides
 * @returns true if item should span full width
 */
export function isFullWidthItem(index: number, overrides?: Map<number, SizeOverride>): boolean {
	const override = overrides?.get(index);
	return override?.fullWidth ?? false;
}
