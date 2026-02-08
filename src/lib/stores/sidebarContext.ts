import { writable } from 'svelte/store';
import type { MetadataItem } from '$lib/utils/metadata';

export type SidebarContext =
	| {
			type: 'album';
			albumName: string;
			albumSlug: string;
			description?: string;
			pictureCount: number;
	  }
	| {
			type: 'picture';
			albumName: string;
			albumSlug: string;
			albumDescription?: string;
			albumPictureCount?: number;
			description?: string;
			metadata: MetadataItem[];
			currentIndex?: number;
	  }
	| null;

export const sidebarContext = writable<SidebarContext>(null);

// Whether the sidebar is physically revealed (lightbox slid right)
export const sidebarRevealed = writable(false);

export function setSidebarContext(context: SidebarContext) {
	sidebarContext.set(context);
}

export function clearSidebarContext() {
	sidebarContext.set(null);
}
