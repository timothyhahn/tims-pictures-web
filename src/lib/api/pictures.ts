import { apiClient } from './client';
import type {
	Picture,
	PaginatedResponse,
	ListPicturesQuery,
	ListRecentPicturesQuery
} from './types';

/**
 * List recent pictures from public albums (requires new backend endpoint)
 */
export async function listRecentPictures(
	query?: ListRecentPicturesQuery
): Promise<PaginatedResponse<Picture>> {
	const params: Record<string, string | number> = {};

	if (query?.limit) params.limit = query.limit;
	if (query?.page) params.page = query.page;
	if (query?.per_page) params.per_page = query.per_page;

	return apiClient.get<PaginatedResponse<Picture>>('/v1/pictures/recent', params);
}

/**
 * List pictures for a specific album
 */
export async function listPicturesByAlbum(
	albumId: string,
	query?: ListPicturesQuery
): Promise<PaginatedResponse<Picture>> {
	const params: Record<string, string | number> = {};

	if (query?.page) params.page = query.page;
	if (query?.per_page) params.per_page = query.per_page;

	return apiClient.get<PaginatedResponse<Picture>>(`/v1/albums/${albumId}/pictures`, params);
}

/**
 * Get a single picture by ID
 */
export async function getPicture(id: string): Promise<Picture> {
	return apiClient.get<Picture>(`/v1/pictures/${id}`);
}
