/**
 * Define 3 distinct masonry patterns using different prime numbers.
 * Each pattern has two sets of modulo checks for tall and wide items.
 * The intersection creates rare "big" items (2x2).
 */
const MASONRY_PATTERNS = [
	// Pattern 0: Original pattern
	{
		tall: [
			{ mod: 13, offset: 4 }, // 13n + 5 in 1-indexed
			{ mod: 19, offset: 10 } // 19n + 11 in 1-indexed
		],
		wide: [
			{ mod: 17, offset: 2 }, // 17n + 3 in 1-indexed
			{ mod: 23, offset: 6 } // 23n + 7 in 1-indexed
		]
	},
	// Pattern 1: Different primes for variety
	{
		tall: [
			{ mod: 11, offset: 3 }, // 11n + 4 in 1-indexed
			{ mod: 17, offset: 8 } // 17n + 9 in 1-indexed
		],
		wide: [
			{ mod: 13, offset: 5 }, // 13n + 6 in 1-indexed
			{ mod: 19, offset: 12 } // 19n + 13 in 1-indexed
		]
	},
	// Pattern 2: Yet another set
	{
		tall: [
			{ mod: 23, offset: 7 }, // 23n + 8 in 1-indexed
			{ mod: 29, offset: 14 } // 29n + 15 in 1-indexed
		],
		wide: [
			{ mod: 11, offset: 6 }, // 11n + 7 in 1-indexed
			{ mod: 13, offset: 9 } // 13n + 10 in 1-indexed
		]
	}
] as const;

/**
 * Simple string hash function to convert album identifier to a number
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
 * Select which masonry pattern to use based on album identifier
 * Falls back to pattern 0 if no identifier provided
 */
export function getPatternIndex(albumIdentifier?: string): number {
	return albumIdentifier ? hashString(albumIdentifier) % 3 : 0;
}

/**
 * Check if an item should be tall (span 2 rows) based on selected pattern
 */
export function isTallItem(index: number, patternIndex: number): boolean {
	const pattern = MASONRY_PATTERNS[patternIndex];
	return pattern.tall.some((rule) => index % rule.mod === rule.offset);
}

/**
 * Check if an item should be wide (span 2 columns) based on selected pattern
 */
export function isWideItem(index: number, patternIndex: number): boolean {
	const pattern = MASONRY_PATTERNS[patternIndex];
	return pattern.wide.some((rule) => index % rule.mod === rule.offset);
}

/**
 * Check if an item should be big (span 2 rows AND 2 columns)
 * This happens when an item matches both tall and wide patterns - rare!
 */
export function isBigItem(index: number, patternIndex: number): boolean {
	return isTallItem(index, patternIndex) && isWideItem(index, patternIndex);
}
