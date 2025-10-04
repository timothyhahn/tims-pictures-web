/**
 * Type definitions for the masonry layout system
 */

/**
 * Represents an item in the grid layout
 */
export interface GridItem {
	index: number;
	row: number;
	col: number;
	rowSpan: number;
	colSpan: number;
}

/**
 * Override for an item's size
 */
export interface SizeOverride {
	tall?: boolean;
	wide?: boolean;
	fullWidth?: boolean;
}

/**
 * Result of simulating a grid layout
 */
export interface GridLayoutResult {
	totalRows: number;
	lastRowItems: GridItem[];
	emptySlots: number;
	isPerfect: boolean;
	allItems: GridItem[];
}

/**
 * Result of the masonry layout optimization
 */
export interface MasonryLayoutConfig {
	patternIndex: number;
	overrides: Map<number, SizeOverride>;
	isPerfect: boolean;
	totalRows: number;
	emptySlots: number;
	triedPatterns: number[];
}
