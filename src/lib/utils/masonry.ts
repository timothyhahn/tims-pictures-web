/**
 * Masonry Layout Pattern System
 *
 * This system creates visually distinct masonry layouts by using prime number modulo arithmetic
 * to determine which items should span 2 rows (tall), 2 columns (wide), or both (big).
 *
 * Theory:
 * - Each pattern uses 2 prime modulo rules for tall items and 2 for wide items
 * - Items matching any tall rule span 2 rows; items matching any wide rule span 2 columns
 * - Items matching BOTH tall AND wide rules become rare "big" items (2x2)
 * - Prime numbers ensure pseudo-random but deterministic distribution
 * - Different primes create different visual rhythms and densities
 *
 * Key Considerations:
 * - Smaller primes (11, 13) = more frequent special items, denser layouts
 * - Larger primes (29, 31, 37) = rarer special items, sparser layouts
 * - Offset values control which specific positions match (think phase shift)
 * - Mixing small + large primes in the same pattern creates varied pacing
 * - Big items are intentionally rare (intersection of tall & wide conditions)
 * - Each album gets a deterministic pattern via hashing, ensuring consistency
 *
 * Pattern Selection:
 * - 10 curated patterns provide visual variety without overwhelming similarity
 * - Patterns chosen to feel distinct: some dense, some sparse, varying rhythms
 * - Album identifier is hashed to select pattern index (mod pattern count)
 *
 * Pattern Structure:
 * Each pattern contains:
 * - tall: Array of rules determining which items span 2 rows
 * - wide: Array of rules determining which items span 2 columns
 *
 * Each rule has:
 * - mod: The prime modulo divisor (e.g., 13 means "every 13th item in a cycle")
 * - offset: The remainder to match (e.g., offset 4 means "when index % mod === 4")
 *
 * Example: { mod: 13, offset: 4 } matches indices: 4, 17, 30, 43, 56...
 *          (i.e., items where index % 13 === 4)
 *
 * An item is tall if it matches ANY tall rule (OR logic)
 * An item is wide if it matches ANY wide rule (OR logic)
 * An item is big if it matches BOTH a tall AND wide rule (AND logic - rare!)
 */
const MASONRY_PATTERNS = [
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
	return albumIdentifier ? hashString(albumIdentifier) % MASONRY_PATTERNS.length : 0;
}

/**
 * Check if an item should be tall (span 2 rows) based on selected pattern
 */
export function isTallItem(index: number, patternIndex: number): boolean {
	const pattern = MASONRY_PATTERNS[patternIndex];
	if (!pattern) return false;
	return pattern.tall.some((rule) => index % rule.mod === rule.offset);
}

/**
 * Check if an item should be wide (span 2 columns) based on selected pattern
 */
export function isWideItem(index: number, patternIndex: number): boolean {
	const pattern = MASONRY_PATTERNS[patternIndex];
	if (!pattern) return false;
	return pattern.wide.some((rule) => index % rule.mod === rule.offset);
}

/**
 * Check if an item should be big (span 2 rows AND 2 columns)
 * This happens when an item matches both tall and wide patterns - rare!
 */
export function isBigItem(index: number, patternIndex: number): boolean {
	return isTallItem(index, patternIndex) && isWideItem(index, patternIndex);
}
