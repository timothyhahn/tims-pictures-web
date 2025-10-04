import { MASONRY_PATTERNS } from './constants';

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
