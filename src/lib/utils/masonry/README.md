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

Tall items create gaps when the next item is too wide to fit:

```
Before (item 17 is tall 2x1):
Row 6: ┌──┬──┬──┐
       │14│15│16│
Row 7: ├──┼──┼──┤
       │17│18│ ?│  ← Gap in row 7 (not last row!)
Row 8: │  ├────┤
       │  │ 19 │  ← Item 19 is wide, couldn't fit in gap
       └──┴────┘

Step 1 flattens item 17 (tall item spanning into gap row).
Remaining gaps are fixed by later steps (e.g., also flattening item 19).
```

#### Step 2: Flatten Last 3 Rows

Big/tall items near the end cause unpredictable flow and extra rows:

```
Before (item 72 is big 2x2):  After (items 72-77 flattened):
Row 31: ┌────────┬──┐         Row 31: ┌──┬──┬──┐
        │   72   │76│                 │74│75│76│
Row 32: │        ├──┤         Row 32: ├──┼──┼──┤
        │        │77│   =>            │77│ ?│ ?│
Row 33: ├────────┼──┤                 └──┴──┴──┘
        │   75   │ ?│  Gap!
        └────────┴──┘

Before: Big item causes 4 rows (31-33) with gap in row 33
After:  Clean 2 rows (31-32), predictable flow
Note: Items 73-74 were pushed earlier due to big item at 72
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

### Time Complexity

**Worst case: O(10 × N²)**

The simulation uses CSS Grid's dense packing algorithm, which searches from row 0 for each item:

- Photo i must search through rows 0 to ~i/columns to find its position
- Per photo: O(i × columns) = O(i) operations
- For N photos: O(1 + 2 + 3 + ... + N) = O(N²)
- Pattern search tries up to 10 patterns: O(10 × N²)

**Average case: O(N²)** with constant factors from early termination

### Actual Performance (Measured)

- **Small Albums** (N ≤ 100): < 1ms
- **Medium Albums** (N = 200): ~3ms
- **Large Albums** (N = 500): ~13ms
- **Very Large Albums** (N = 1000): ~25ms
- **Extra Large Albums** (N = 2000): ~190ms

**Note**: Calculated once using total photo count, not recalculated during infinite scroll

### Optimization Opportunities

For very large albums (N > 1000), consider:

- Caching results (already deterministic per album)
- Incremental layout (process visible photos first)
- Simplified patterns (skip perfect pattern search)

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
