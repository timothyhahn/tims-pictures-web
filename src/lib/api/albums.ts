import { apiClient } from './client';
import type { Album, PaginatedResponse, ListAlbumsQuery } from './types';

/**
 * List albums with optional filtering
 */
export async function listAlbums(query?: ListAlbumsQuery): Promise<PaginatedResponse<Album>> {
	const params: Record<string, string | number> = {};

	if (query?.visibility) params.visibility = query.visibility;
	if (query?.sort_by) params.sort_by = query.sort_by;
	if (query?.sort_order) params.sort_order = query.sort_order;
	if (query?.page) params.page = query.page;
	if (query?.per_page) params.per_page = query.per_page;

	return apiClient.get<PaginatedResponse<Album>>('/v1/albums', params);
}

/**
 * Get a single album by ID
 */
export async function getAlbum(id: string): Promise<Album> {
	return apiClient.get<Album>(`/v1/albums/${id}`);
}

/**
 * Get a single album by slug (requires new backend endpoint)
 */
export async function getAlbumBySlug(slug: string): Promise<Album> {
	return apiClient.get<Album>(`/v1/albums/slug/${slug}`);
}
