/**
 * Masonry Layout Pattern System
 *
 * This system creates visually distinct masonry layouts by using prime number modulo arithmetic
 * to determine which items should span 2 rows (tall), 2 columns (wide), or both (big).
 *
 * Perfect Tiling Strategy:
 * ========================
 * The goal is to create layouts that tile perfectly (no empty spaces in the final row) while
 * maintaining visual variety across different albums.
 *
 * 1. Pattern Selection:
 *    - Hash the album identifier to get a starting pattern (deterministic)
 *    - Try all 10 patterns starting from that index
 *    - Select the first pattern that creates perfect tiling
 *    - If none perfect, use the original hash-based pattern
 *
 * 2. Grid Simulation:
 *    - Simulate CSS Grid auto-placement algorithm
 *    - Track exact item positions (row, col, rowSpan, colSpan)
 *    - Calculate total rows, last row items, and empty slots
 *
 * 3. Last Row Fixups:
 *    Applied to all layouts (both perfect and imperfect):
 *    - Single empty slot: Expand last item to fill width
 *    - Two empty slots (3-col): Make last item wide
 *    - Two items in last row: Flatten to 1x1 (prevents visual gaps from tall/wide combos)
 *    - Tall items in last row: Flatten to prevent overflow
 *
 * 4. Performance:
 *    - O(10 × N) worst case (10 patterns × N photos)
 *    - Runs once per album (uses total photo count)
 *    - Sub-millisecond for typical albums (<200 photos)
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
 *
 * @param index - The item index
 * @param patternIndex - The pattern to use
 * @param overrides - Optional map of size overrides (for last-row fixups)
 * @returns true if item should be tall
 */
export function isTallItem(
	index: number,
	patternIndex: number,
	overrides?: Map<number, { tall?: boolean; wide?: boolean }>
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
	overrides?: Map<number, { tall?: boolean; wide?: boolean }>
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
	overrides?: Map<number, { tall?: boolean; wide?: boolean }>
): boolean {
	return isTallItem(index, patternIndex, overrides) && isWideItem(index, patternIndex, overrides);
}

/**
 * Represents an item in the grid layout
 */
interface GridItem {
	index: number;
	row: number;
	col: number;
	rowSpan: number;
	colSpan: number;
}

/**
 * Result of simulating a grid layout
 */
interface GridLayoutResult {
	totalRows: number;
	lastRowItems: GridItem[];
	emptySlots: number;
	isPerfect: boolean;
}

/**
 * Simulates CSS Grid auto-placement to calculate exact grid layout
 *
 * This function simulates how CSS Grid would place items with varying spans,
 * allowing us to determine if a layout tiles perfectly and calculate overflow.
 *
 * @param photoCount - Total number of photos in the album
 * @param patternIndex - Which masonry pattern to use (0-9)
 * @param numColumns - Number of columns in the grid (typically 2 or 3)
 * @param overrides - Optional map of index-specific size overrides
 * @returns Layout information including rows, last row items, and whether it tiles perfectly
 */
export function simulateGridLayout(
	photoCount: number,
	patternIndex: number,
	numColumns: number,
	overrides?: Map<number, { tall?: boolean; wide?: boolean }>
): GridLayoutResult {
	const items: GridItem[] = [];
	let currentRow = 0;
	let currentCol = 0;

	for (let i = 0; i < photoCount; i++) {
		// Check for overrides first
		const override = overrides?.get(i);
		const isTall = override?.tall ?? isTallItem(i, patternIndex);
		const isWide = override?.wide ?? isWideItem(i, patternIndex);

		const rowSpan = isTall ? 2 : 1;
		const colSpan = isWide ? 2 : 1;

		// If item doesn't fit in current row, move to next row
		if (currentCol + colSpan > numColumns) {
			currentRow++;
			currentCol = 0;
		}

		// Place item
		items.push({
			index: i,
			row: currentRow,
			col: currentCol,
			rowSpan,
			colSpan
		});

		// Advance cursor
		currentCol += colSpan;

		// If we've filled the row, move to next row
		if (currentCol >= numColumns) {
			currentRow++;
			currentCol = 0;
		}
	}

	// Calculate last row information
	const totalRows = currentRow + (currentCol > 0 ? 1 : 0);
	const lastRowItems = items.filter((item) => item.row === totalRows - 1);
	const lastRowSlotsFilled = lastRowItems.reduce((sum, item) => sum + item.colSpan, 0);
	const emptySlots = numColumns - lastRowSlotsFilled;
	const isPerfect = emptySlots === 0;

	return {
		totalRows,
		lastRowItems,
		emptySlots,
		isPerfect
	};
}

/**
 * Finds a pattern that creates perfect tiling, if one exists
 *
 * Starting from the hash-based pattern index, loops through all patterns
 * to find one that tiles perfectly. If none found, returns the original.
 *
 * @param photoCount - Total number of photos in the album
 * @param startPatternIndex - The hash-based pattern to start from
 * @param numColumns - Number of columns in the grid
 * @returns Pattern index that tiles perfectly, or the original if none found
 */
export function findPerfectPattern(
	photoCount: number,
	startPatternIndex: number,
	numColumns: number
): number {
	// Try all patterns starting from the hashed one
	for (let offset = 0; offset < MASONRY_PATTERNS.length; offset++) {
		const patternIndex = (startPatternIndex + offset) % MASONRY_PATTERNS.length;
		const layout = simulateGridLayout(photoCount, patternIndex, numColumns);

		if (layout.isPerfect) {
			return patternIndex;
		}
	}

	// No perfect pattern found, return original
	return startPatternIndex;
}

/**
 * Creates size overrides to fix imperfect last row tiling
 *
 * Handles edge cases where the last row doesn't fill completely:
 * - 1 empty slot: Make last item span full width
 * - 2 empty slots (3-column): Make one item wide
 * - Tall items that would overflow: Force to normal height
 *
 * @param layout - The grid layout result from simulateGridLayout
 * @param numColumns - Number of columns in the grid
 * @returns Map of index -> size overrides
 */
export function createLastRowFixups(
	layout: GridLayoutResult,
	numColumns: number
): Map<number, { tall?: boolean; wide?: boolean }> {
	const overrides = new Map<number, { tall?: boolean; wide?: boolean }>();

	const { lastRowItems, emptySlots } = layout;

	if (lastRowItems.length === 0) {
		return overrides;
	}

	// Edge case: Last row with 2 items creates visual gaps with tall/wide/big items
	// Example: [tall(1x2), wide(2x1)] creates empty space
	// Solution: Flatten all items in last row to 1x1 when there are exactly 2 items
	if (numColumns === 2 && lastRowItems.length === 2) {
		const hasNonNormal = lastRowItems.some((item) => item.rowSpan !== 1 || item.colSpan !== 1);

		if (hasNonNormal) {
			// Flatten all items in the last row to 1x1
			for (const item of lastRowItems) {
				overrides.set(item.index, { tall: false, wide: false });
			}
			return overrides;
		}
	}

	// If perfect and no edge cases, no fixups needed
	if (layout.isPerfect) {
		return overrides;
	}

	// Case 1: One empty slot - make last item span full width
	if (emptySlots === 1 && lastRowItems.length > 0) {
		const lastItem = lastRowItems[lastRowItems.length - 1];
		if (lastItem) {
			overrides.set(lastItem.index, { wide: true, tall: false });
		}
		return overrides;
	}

	// Case 2: Two empty slots (only relevant for 3-column grid)
	if (emptySlots === 2 && numColumns === 3 && lastRowItems.length > 0) {
		// Make the last item wide
		const lastItem = lastRowItems[lastRowItems.length - 1];
		if (lastItem) {
			overrides.set(lastItem.index, { wide: true, tall: false });
		}
		return overrides;
	}

	// Case 3: Edge case - tall items in last row could overflow
	// Force all last row items to be normal height to prevent overflow
	const hasTallItems = lastRowItems.some((item) => item.rowSpan === 2);
	if (hasTallItems) {
		for (const item of lastRowItems) {
			overrides.set(item.index, { tall: false, wide: item.colSpan === 2 });
		}
	}

	return overrides;
}

/**
 * Result of the masonry layout optimization
 */
export interface MasonryLayoutConfig {
	patternIndex: number;
	overrides: Map<number, { tall?: boolean; wide?: boolean }>;
	isPerfect: boolean;
	totalRows: number;
	emptySlots: number;
	triedPatterns: number[];
}

/**
 * Main orchestrator function for perfect tiling masonry layout
 *
 * This function:
 * 1. Hashes album ID to get starting pattern
 * 2. Searches for a pattern that tiles perfectly
 * 3. If no perfect pattern found, applies last-row fixups to the original pattern
 * 4. Returns complete configuration for rendering
 *
 * @param albumId - Album identifier (for pattern selection)
 * @param photoCount - Total number of photos in the album
 * @param numColumns - Number of columns in the grid (default: 2)
 * @returns Complete masonry layout configuration
 */
export function getMasonryLayout(
	albumId: string,
	photoCount: number,
	numColumns: number = 2
): MasonryLayoutConfig {
	// Step 1: Get initial pattern from hash
	const initialPatternIndex = getPatternIndex(albumId);

	// Step 2: Try to find a perfect pattern
	const perfectPatternIndex = findPerfectPattern(photoCount, initialPatternIndex, numColumns);

	// Step 3: Simulate with the selected pattern
	let layout = simulateGridLayout(photoCount, perfectPatternIndex, numColumns);

	// Track which patterns we tried
	const triedPatterns: number[] = [];
	for (let i = 0; i < MASONRY_PATTERNS.length; i++) {
		triedPatterns.push((initialPatternIndex + i) % MASONRY_PATTERNS.length);
	}

	// Step 4: Apply fixups for edge cases (both perfect and imperfect layouts)
	const overrides = createLastRowFixups(layout, numColumns);

	// Re-simulate with fixups to get accurate stats
	if (overrides.size > 0) {
		layout = simulateGridLayout(photoCount, perfectPatternIndex, numColumns, overrides);
	}

	return {
		patternIndex: perfectPatternIndex,
		overrides,
		isPerfect: layout.isPerfect,
		totalRows: layout.totalRows,
		emptySlots: layout.emptySlots,
		triedPatterns
	};
}
