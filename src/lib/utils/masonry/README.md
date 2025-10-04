# Masonry Layout System

A sophisticated photo grid layout system that creates visually distinct patterns using prime number mathematics and intelligent gap-filling algorithms.

## Overview

This system generates masonry-style layouts where photos can span different numbers of rows and columns, creating a dynamic visual rhythm. Each album gets a unique but consistent pattern, and the system automatically fixes visual gaps to ensure clean, satisfying grids.

## Architecture

### Module Structure

```
masonry/
├── patterns.ts     # Pattern definitions, selection, and item sizing
├── simulation.ts   # CSS Grid simulation and perfect pattern search
├── gaps.ts         # Gap detection and validation
├── fixups.ts       # Comprehensive gap-fixing logic
├── types.ts        # TypeScript interfaces
├── index.ts        # Main API: getMasonryLayout()
└── README.md       # This file
```

## How It Works

### 1. Pattern Selection

Each pattern uses 4 prime modulo rules:

- 2 rules for tall items (span 2 rows)
- 2 rules for wide items (span 2 columns)

Example pattern:

```typescript
{
  tall: [
    { mod: 13, offset: 4 },  // Matches indices: 4, 17, 30, 43...
    { mod: 19, offset: 10 }  // Matches indices: 10, 29, 48, 67...
  ],
  wide: [
    { mod: 17, offset: 2 },  // Matches indices: 2, 19, 36, 53...
    { mod: 23, offset: 6 }   // Matches indices: 6, 29, 52, 75...
  ]
}
```

An item is:

- **Tall** if it matches ANY tall rule (OR logic)
- **Wide** if it matches ANY wide rule (OR logic)
- **Big** if it matches BOTH a tall AND wide rule (AND logic - rare!)
- **Normal** otherwise (1x1)

### 2. Layout Simulation

The system simulates CSS Grid's `auto-flow: dense` algorithm:

1. For each photo, determine its size based on the pattern
2. Find the first available position in the grid (starting from row 0)
3. Place the item and mark cells as occupied
4. Repeat for all photos

This matches exactly how the browser will render the grid.

### 3. Gap Detection & Fixing

The fixup system runs in 4 steps:

#### Step 1: Fix Middle Row Gaps

Tall items can create gaps when CSS Grid can't find items to fill them:

```
Before:          After:
┌──┬──┬──┐       ┌──┬──┬──┐
│T │A │B │       │A │B │C │
│A├──┼──┤       ├──┼──┼──┤
│L │? │C │  =>   │D │E │F │  (Flatten the tall item)
│L├──┼──┤       ├──┼──┼──┤
│  │D │E │       │G │H │I │
└──┴──┴──┘       └──┴──┴──┘
```

#### Step 2: Flatten Last 3 Rows

Big/tall items near the end cause unpredictable flow:

```
Before:                After:
┌────┬──┐            ┌──┬──┬──┐
│ BIG│74│            │72│73│74│
│    ├──┤            ├──┼──┼──┤
│    │75│      =>    │75│76│77│
├────┼──┤            └──┴──┴──┘
│ 76 │77│
└────┴──┘
```

#### Step 3: Perfect Tiling (Last 2 Rows)

For 3-column grids, optimize last 2 rows together:

```
Before:              After:
┌──┬──┬──┐          ┌────┬────┬────┐
│ A│? │? │          │  A │  B │  C │
├──┼──┼──┤   =>     │    │    │    │
│ B│ C│? │          └────┴────┴────┘
└──┴──┴──┘
```

#### Step 4: Fallback Fixups

Handle remaining edge cases:

- Single item in last row: expand to full width
- Two normal items: make one tall for visual interest
- Remaining gaps: expand items to fill

## Usage

### Basic Usage

```typescript
import { getMasonryLayout } from '$lib/utils/masonry';

const layout = getMasonryLayout(
	'album-uuid-or-slug', // Album identifier
	77, // Total photo count
	3 // Number of columns
);

// Use the layout configuration to render photos
photos.forEach((photo, index) => {
	const isTall = isTallItem(index, layout.patternIndex, layout.overrides);
	const isWide = isWideItem(index, layout.patternIndex, layout.overrides);
	const isBig = isBigItem(index, layout.patternIndex, layout.overrides);
	const isFullWidth = isFullWidthItem(index, layout.overrides);

	// Apply appropriate CSS classes based on size
});
```

### Layout Configuration

The returned `MasonryLayoutConfig` contains:

```typescript
{
  patternIndex: number;        // Which of the 10 patterns was selected
  overrides: Map<number, {     // Size overrides for specific photos
    tall?: boolean;
    wide?: boolean;
    fullWidth?: boolean;
  }>;
  isPerfect: boolean;          // Whether last row fills completely
  totalRows: number;           // Total number of rows in the grid
  emptySlots: number;          // Empty slots in last row (0 if perfect)
  triedPatterns: number[];     // All patterns that were considered
}
```

## Performance

- **Time Complexity**: O(10 × N) worst case
  - 10 patterns to try
  - N photos to simulate per pattern
- **Typical Albums**: Sub-millisecond (<1ms for 200 photos)
- **Large Albums**: ~2-3ms for 1000 photos
- **Runs Once**: Calculated using total photo count, not recalculated during infinite scroll

## Prime Number Theory

### Why Prime Numbers?

1. **Pseudo-Random Distribution**: Prime modulo creates patterns that feel random but are deterministic
2. **Minimal Collisions**: Different primes rarely align, keeping "big" items rare
3. **Varied Rhythms**: Small primes (11, 13) create dense patterns, large primes (29, 31, 37) create sparse ones

### Pattern Design

Each pattern balances:

- **Density**: How often special items appear
- **Rhythm**: The visual pacing of tall/wide items
- **Uniqueness**: Patterns feel distinct from each other

## CSS Integration

The system works with CSS Grid:

```css
.grid-layout {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(450px, 1fr));
	grid-auto-rows: 400px;
	grid-auto-flow: dense; /* Critical: must match simulation */
	gap: 1rem;
}

.tall-item {
	grid-row: span 2;
}

.wide-item {
	grid-column: span 2;
}

.big-item {
	grid-row: span 2;
	grid-column: span 2;
}

.full-width-item {
	grid-column: 1 / -1;
}
```
