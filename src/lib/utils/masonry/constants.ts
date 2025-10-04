/**
 * Masonry Pattern Constants
 *
 * Each pattern uses prime number modulo arithmetic to create pseudo-random
 * but deterministic distributions of tall and wide items.
 *
 * Pattern Structure:
 * - tall: Array of rules determining which items span 2 rows
 * - wide: Array of rules determining which items span 2 columns
 *
 * Each rule has:
 * - mod: The prime modulo divisor (e.g., 13 means "every 13th item in a cycle")
 * - offset: The remainder to match (e.g., offset 4 means "when index % mod === 4")
 *
 * Example: { mod: 13, offset: 4 } matches indices: 4, 17, 30, 43, 56...
 *
 * An item is tall if it matches ANY tall rule (OR logic)
 * An item is wide if it matches ANY wide rule (OR logic)
 * An item is big if it matches BOTH a tall AND wide rule (AND logic - rare!)
 *
 * Design Notes:
 * - Smaller primes (11, 13) = more frequent special items, denser layouts
 * - Larger primes (29, 31, 37) = rarer special items, sparser layouts
 * - Offset values control which specific positions match (think phase shift)
 * - Mixing small + large primes in the same pattern creates varied pacing
 * - Big items are intentionally rare (intersection of tall & wide conditions)
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
