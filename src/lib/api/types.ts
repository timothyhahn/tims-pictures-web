// TypeScript types matching the backend API

export type Visibility = 'public' | 'private' | 'hidden';

export interface Album {
	id: string;
	created_at: string;
	updated_at: string;
	name: string;
	slug: string;
	description?: string;
	visibility: Visibility;
	has_password: boolean;
	cover_picture_id?: string;
	cover_picture_url?: string;
}

export interface Picture {
	id: string;
	album_id: string;
	created_at: string;
	updated_at: string;
	image_url: string;
	description?: string;
	metadata?: Record<string, string>;
}

export interface PaginatedResponse<T> {
	data: T[];
	page: number;
	per_page: number;
	total: number;
	total_pages: number;
}

export interface ListAlbumsQuery {
	visibility?: Visibility;
	sort_by?: 'created_at' | 'updated_at' | 'name';
	sort_order?: 'asc' | 'desc';
	page?: number;
	per_page?: number;
}

export interface ListPicturesQuery {
	page?: number;
	per_page?: number;
}

export interface ListRecentPicturesQuery {
	limit?: number;
	page?: number;
	per_page?: number;
}
