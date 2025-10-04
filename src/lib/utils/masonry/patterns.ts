/**
 * Masonry Pattern System
 *
 * Pattern definitions, selection, and item size determination using prime number modulo arithmetic.
 */

import type { SizeOverride } from './types';

/**
 * Masonry pattern constants using prime number modulo arithmetic.
 *
 * Each pattern uses 4 rules (2 for tall, 2 for wide) to create pseudo-random
 * but deterministic distributions of special items.
 *
 * Pattern Structure:
 * - tall: Rules determining which items span 2 rows
 * - wide: Rules determining which items span 2 columns
 *
 * Each rule: { mod: prime, offset: remainder }
 * Example: { mod: 13, offset: 4 } matches indices 4, 17, 30, 43, 56...
 *
 * Design:
 * - Small primes (11, 13) = frequent special items, dense layouts
 * - Large primes (29, 31, 37) = rare special items, sparse layouts
 * - Big items (tall AND wide) are intentionally rare
 */
export const MASONRY_PATTERNS = [
	{
		tall: [
			{ mod: 13, offset: 4 },
			{ mod: 19, offset: 10 }
		],
		wide: [
			{ mod: 17, offset: 2 },
			{ mod: 23, offset: 6 }
		]
	},
	{
		tall: [
			{ mod: 11, offset: 3 },
			{ mod: 17, offset: 8 }
		],
		wide: [
			{ mod: 13, offset: 5 },
			{ mod: 19, offset: 12 }
		]
	},
	{
		tall: [
			{ mod: 23, offset: 7 },
			{ mod: 29, offset: 14 }
		],
		wide: [
			{ mod: 11, offset: 6 },
			{ mod: 13, offset: 9 }
		]
	},
	{
		tall: [
			{ mod: 17, offset: 5 },
			{ mod: 23, offset: 11 }
		],
		wide: [
			{ mod: 19, offset: 7 },
			{ mod: 29, offset: 15 }
		]
	},
	{
		tall: [
			{ mod: 11, offset: 2 },
			{ mod: 31, offset: 18 }
		],
		wide: [
			{ mod: 13, offset: 7 },
			{ mod: 23, offset: 14 }
		]
	},
	{
		tall: [
			{ mod: 19, offset: 6 },
			{ mod: 31, offset: 22 }
		],
		wide: [
			{ mod: 17, offset: 9 },
			{ mod: 29, offset: 19 }
		]
	},
	{
		tall: [
			{ mod: 13, offset: 8 },
			{ mod: 29, offset: 12 }
		],
		wide: [
			{ mod: 11, offset: 4 },
			{ mod: 31, offset: 20 }
		]
	},
	{
		tall: [
			{ mod: 23, offset: 3 },
			{ mod: 37, offset: 25 }
		],
		wide: [
			{ mod: 13, offset: 6 },
			{ mod: 17, offset: 11 }
		]
	},
	{
		tall: [
			{ mod: 11, offset: 7 },
			{ mod: 19, offset: 15 }
		],
		wide: [
			{ mod: 23, offset: 9 },
			{ mod: 31, offset: 16 }
		]
	},
	{
		tall: [
			{ mod: 17, offset: 12 },
			{ mod: 29, offset: 21 }
		],
		wide: [
			{ mod: 19, offset: 8 },
			{ mod: 37, offset: 28 }
		]
	}
] as const;

/**
 * Hash string to number for pattern selection
 */
export function hashString(str: string): number {
	let hash = 0;
	for (let i = 0; i < str.length; i++) {
		const char = str.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash = hash & hash; // Convert to 32-bit integer
	}
	return Math.abs(hash);
}

/**
 * Select pattern index based on album identifier
 */
export function getPatternIndex(albumIdentifier?: string): number {
	return albumIdentifier ? hashString(albumIdentifier) % MASONRY_PATTERNS.length : 0;
}

/**
 * Check if an item should be tall (span 2 rows)
 */
export function isTallItem(
	index: number,
	patternIndex: number,
	overrides?: Map<number, SizeOverride>
): boolean {
	const override = overrides?.get(index);
	if (override?.tall !== undefined) {
		return override.tall;
	}

	const pattern = MASONRY_PATTERNS[patternIndex];
	if (!pattern) return false;
	return pattern.tall.some((rule) => index % rule.mod === rule.offset);
}

/**
 * Check if an item should be wide (span 2 columns)
 */
export function isWideItem(
	index: number,
	patternIndex: number,
	overrides?: Map<number, SizeOverride>
): boolean {
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
 * Only set via overrides for last-row fixups in 3+ column grids
 */
export function isFullWidthItem(index: number, overrides?: Map<number, SizeOverride>): boolean {
	const override = overrides?.get(index);
	return override?.fullWidth ?? false;
}
