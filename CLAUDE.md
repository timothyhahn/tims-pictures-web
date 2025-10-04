# Claude Development Notes

This document contains insights, gotchas, and patterns learned while developing tims-pictures-web.

## SvelteKit Patterns & Gotchas

### Component Reuse Between Route Parameters

**Key Insight:** SvelteKit **reuses the same component instance** when navigating between routes that use the same component (e.g., `/albums/kauai-2024` → `/albums/pct-2022`).

**Problem:** State from the previous route persists in the new route, causing bugs like:

- Pagination using the wrong endpoint
- Stale data being displayed
- State not resetting properly

**Solution:** Manually detect when route data changes and reset state:

```svelte
<script lang="ts">
	let { data } = $props();

	let currentAlbumId = $state(data.album.id);
	let pagination = $state(
		usePaginatedPictures({
			/* ... */
		})
	);

	// Reset when navigating to a different album
	$effect(() => {
		if (data.album.id !== currentAlbumId) {
			currentAlbumId = data.album.id;
			// Reset all state
			pagination = usePaginatedPictures({
				/* new endpoint */
			});
		}
	});
</script>
```

### Reactive State with `$derived`

**Gotcha:** Using `$derived` on complex objects recreates them on every dependency change, losing internal state.

```svelte
// ❌ BAD: Recreates pagination object when totalPictures changes
const pagination = $derived(
  usePaginatedPictures({
    endpoint: `/api/v1/albums/${album.id}/pictures`,
    perPage: PICTURES_PER_PAGE,
    ...(totalPictures && { totalCount: totalPictures })
  })
);

// ✅ GOOD: Create once, update separately
const pagination = usePaginatedPictures({
  endpoint: `/api/v1/albums/${album.id}/pictures`,
  perPage: PICTURES_PER_PAGE
});

// Update state via methods instead
$effect(() => {
  if (totalPictures > 0) {
    // pagination handles this internally
  }
});
```

## Pagination Patterns

### Page Numbering

**Key Insight:** When initial page load and pagination share the same endpoint, coordinate page numbers carefully.

**Problem:**

- Initial load fetches page 1
- Pagination state starts at page 1
- First `loadNextPage()` loads page 2 (doing `page + 1`)
- **Page 1 is loaded twice, page 2 is skipped**

**Solution:**

```typescript
// Start at page 0
let page = $state(0);

// After initial load, mark page 1 as loaded
pagination.setPictures(loadedPictures);
pagination.setPage(1); // Now we're on page 1

// Next loadNextPage() will correctly load page 2
```

### Per-Page Consistency

**Gotcha:** Using different `per_page` values between initial load and pagination causes gaps/duplicates.

```typescript
// ❌ BAD: Initial load uses 20, pagination uses 30
fetch('/api/v1/albums/123/pictures?per_page=20'); // Initial load
const pagination = usePaginatedPictures({ perPage: 30 }); // Pagination

// ✅ GOOD: Use same constant
import { PICTURES_PER_PAGE } from '$lib/constants';
fetch(`/api/v1/albums/123/pictures?per_page=${PICTURES_PER_PAGE}`);
const pagination = usePaginatedPictures({ perPage: PICTURES_PER_PAGE });
```

### Race Condition: Initial Load vs Infinite Scroll

**Problem:** If the page is short, infinite scroll triggers immediately on page load, **before** the initial pictures finish loading. Both try to load page 1.

**Solution:** Disable infinite scroll until initial load completes:

```svelte
let initialLoad = $state(false);

let scrollEnabled = $derived(
  initialLoad && // Only enable after initial load
  !pagination.loading &&
  !pagination.done &&
  pagination.pictures.length < MAX_PICTURES
);
```

## Infinite Scroll

### Preventing Infinite Loops

**Problem:** On short pages, infinite scroll can trigger repeatedly:

1. Load completes, `loading = false`
2. Still near bottom
3. `$effect` runs again, triggers load
4. Repeat infinitely

**Solution:** Track page height and only trigger when page grows:

```typescript
let lastTriggeredHeight = 0;

$effect(() => {
  const scrollHeight = document.documentElement.scrollHeight;
  const nearBottom = /* calculate */;

  // Only trigger if near bottom AND page has grown
  if (nearBottom && scrollHeight > lastTriggeredHeight) {
    lastTriggeredHeight = scrollHeight;
    onLoad();
  }
});
```

### Threshold Strategies

- **Fixed threshold** (`100px`): Good for consistent behavior, but can trigger too early on short pages
- **Viewport multiplier** (`1.5x viewport height`): Adapts to screen size, better for photo grids that vary in height

```typescript
const scroll = useInfiniteScroll({
	onLoad: pagination.loadNextPage,
	thresholdStrategy: 'viewport', // or 'fixed'
	threshold: 1.5, // multiplier for viewport, or px for fixed
	debounceMs: 100
});
```

## API Proxy Pattern

### Response Validation

Always validate API response structure, especially when proxying:

```typescript
const data = await response.json();

// Validate structure
if (!data || typeof data !== 'object') {
	throw new Error('Invalid API response structure');
}

if (!Array.isArray(data.data)) {
	throw new Error('Invalid API response: missing or invalid data array');
}

if (typeof data.total !== 'number') {
	throw new Error('Invalid API response: missing or invalid total count');
}

return { pictures: data.data, totalPictures: data.total };
```

### Error Handling Layers

1. **Server-side (load function):** Log and re-throw for component to handle
2. **Component ($effect):** Catch and display user-friendly error with retry
3. **Proxy layer:** Log and return appropriate HTTP status

## Debugging Strategies

### Structured Logging

Use consistent prefixes for log filtering:

```typescript
console.log('[Pagination] Loading page 2');
console.log('[Album kauai-2024] Failed to load');
console.log('[InfiniteScroll] Triggering load');
```

This allows filtering in browser console: `/\[Pagination\]/`

### State Tracking

Log key state changes to understand flow:

```typescript
async function loadNextPage() {
	console.log(`[Pagination] Loading page ${nextPage}: ${url}`);
	// ... load
	console.log(
		`[Pagination] Page ${nextPage}: loaded ${newPictures.length} pictures. Total: ${pictures.length + newPictures.length}`
	);
	// ... update state
	console.log(`[Pagination] Complete: ${pictures.length}/${maxItems} pictures loaded`);
}
```

## Performance Considerations

### Reactive Computation Frequency

`$derived.by()` with logging can create performance issues if it runs too frequently:

```svelte
// ❌ Can spam console and cause performance issues
let scrollEnabled = $derived.by(() => {
  console.log(`scrollEnabled check`); // Runs on EVERY reactive change
  return /* ... */;
});

// ✅ Use simple $derived when possible
let scrollEnabled = $derived(
  !pagination.loading && !pagination.done
);
```

### Effect Cleanup

Always clean up timeouts and listeners in `$effect` return function:

```typescript
$effect(() => {
	const timeout = setTimeout(() => {
		// do something
	}, 100);

	return () => {
		clearTimeout(timeout); // Cleanup
	};
});
```

## Common Issues & Solutions

### Issue: "Loading pictures..." stuck forever

**Causes:**

1. Pagination page numbering mismatch (loading wrong pages)
2. Initial load and pagination loading same page (duplicates/gaps)
3. Infinite scroll triggering before initial load
4. Component state not resetting when navigating between routes

**Debug:**

- Check what pages are being loaded (page 1, 2, 3 or 1, 1, 3?)
- Check `scrollEnabled` state
- Check if `initialLoad` is true
- Look for `done=true` being set prematurely

### Issue: Browser freezing with infinite loop

**Causes:**

1. `$derived` or `$effect` with circular dependencies
2. Infinite scroll triggering repeatedly on short pages
3. Console log spam overwhelming browser

**Debug:**

- Check for excessive console logging
- Look for height tracking in infinite scroll
- Check `loading` state isn't stuck as `false` while still triggering loads

---

_Last updated: 2025-10-03_
