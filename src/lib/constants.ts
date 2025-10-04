/**
 * Application-wide constants
 */

/** Number of pictures to load per page in infinite scroll */
export const PICTURES_PER_PAGE = 30;

/** Pixels from bottom of page to trigger loading more pictures */
export const SCROLL_LOAD_THRESHOLD_PX = 100;

/** Debounce delay for scroll restoration in milliseconds */
export const SCROLL_RESTORE_DEBOUNCE_MS = 100;

/** State expiry time for navigation state (5 minutes in milliseconds) */
export const NAVIGATION_STATE_EXPIRY_MS = 5 * 60 * 1000;

/** Number of pictures to trigger column layout instead of masonry (for small albums) */
export const COLUMN_LAYOUT_THRESHOLD = 3;
