import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock SvelteKit
vi.mock('@sveltejs/kit', () => ({
	json: (data: unknown, init?: ResponseInit) =>
		new Response(JSON.stringify(data), {
			...init,
			headers: { 'content-type': 'application/json', ...init?.headers }
		})
}));

// Mock environment
vi.mock('$env/dynamic/private', () => ({
	env: { API_URL: 'http://test-api:8080' }
}));

// Import after mocks are set up
const { GET, POST, PUT, DELETE } = await import('./+server');

describe('API Proxy Security', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		globalThis.fetch = vi.fn();
	});

	describe('Allowlisted Endpoints', () => {
		it('allows GET /v1/albums', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				headers: new Headers({ 'content-type': 'application/json' }),
				json: () => Promise.resolve({ data: [] })
			});

			const response = await GET({
				params: { path: 'v1/albums' },
				url: new URL('http://localhost/api/v1/albums')
			} as any);

			expect(response.status).toBe(200);
			expect(globalThis.fetch).toHaveBeenCalledWith('http://test-api:8080/v1/albums', {
				method: 'GET'
			});
		});

		it('allows GET /v1/albums/{id}', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				headers: new Headers({ 'content-type': 'application/json' }),
				json: () => Promise.resolve({ id: '123' })
			});

			const response = await GET({
				params: { path: 'v1/albums/123' },
				url: new URL('http://localhost/api/v1/albums/123')
			} as any);

			expect(response.status).toBe(200);
		});

		it('allows GET /v1/albums/slug/{slug}', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				headers: new Headers({ 'content-type': 'application/json' }),
				json: () => Promise.resolve({ slug: 'my-album' })
			});

			const response = await GET({
				params: { path: 'v1/albums/slug/my-album' },
				url: new URL('http://localhost/api/v1/albums/slug/my-album')
			} as any);

			expect(response.status).toBe(200);
		});

		it('allows GET /v1/pictures/recent', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				headers: new Headers({ 'content-type': 'application/json' }),
				json: () => Promise.resolve({ data: [] })
			});

			const response = await GET({
				params: { path: 'v1/pictures/recent' },
				url: new URL('http://localhost/api/v1/pictures/recent')
			} as any);

			expect(response.status).toBe(200);
		});

		it('allows GET /v1/pictures/{id}', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				headers: new Headers({ 'content-type': 'application/json' }),
				json: () => Promise.resolve({ id: '456' })
			});

			const response = await GET({
				params: { path: 'v1/pictures/456' },
				url: new URL('http://localhost/api/v1/pictures/456')
			} as any);

			expect(response.status).toBe(200);
		});

		it('allows GET /v1/albums/{id}/pictures', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				headers: new Headers({ 'content-type': 'application/json' }),
				json: () => Promise.resolve({ data: [] })
			});

			const response = await GET({
				params: { path: 'v1/albums/123/pictures' },
				url: new URL('http://localhost/api/v1/albums/123/pictures')
			} as any);

			expect(response.status).toBe(200);
		});
	});

	describe('Blocked Endpoints', () => {
		it('blocks GET /v1/admin/users', async () => {
			const response = await GET({
				params: { path: 'v1/admin/users' },
				url: new URL('http://localhost/api/v1/admin/users')
			} as any);

			expect(response.status).toBe(403);
			const body = await response.json();
			expect(body.error).toBe('Endpoint not allowed');
			expect(globalThis.fetch).not.toHaveBeenCalled();
		});

		it('blocks GET /v1/users', async () => {
			const response = await GET({
				params: { path: 'v1/users' },
				url: new URL('http://localhost/api/v1/users')
			} as any);

			expect(response.status).toBe(403);
			expect(globalThis.fetch).not.toHaveBeenCalled();
		});

		it('blocks POST /v1/albums', async () => {
			const mockRequest = {
				text: () => Promise.resolve(JSON.stringify({ name: 'test' }))
			};

			const response = await POST({
				params: { path: 'v1/albums' },
				url: new URL('http://localhost/api/v1/albums'),
				request: mockRequest
			} as any);

			expect(response.status).toBe(405);
			const body = await response.json();
			expect(body.error).toBe('Method not allowed');
			expect(globalThis.fetch).not.toHaveBeenCalled();
		});

		it('blocks PUT /v1/albums/123', async () => {
			const mockRequest = {
				text: () => Promise.resolve(JSON.stringify({ name: 'updated' }))
			};

			const response = await PUT({
				params: { path: 'v1/albums/123' },
				url: new URL('http://localhost/api/v1/albums/123'),
				request: mockRequest
			} as any);

			expect(response.status).toBe(405);
			const body = await response.json();
			expect(body.error).toBe('Method not allowed');
			expect(globalThis.fetch).not.toHaveBeenCalled();
		});

		it('blocks DELETE /v1/albums/123', async () => {
			const response = await DELETE({
				params: { path: 'v1/albums/123' },
				url: new URL('http://localhost/api/v1/albums/123')
			} as any);

			expect(response.status).toBe(405);
			const body = await response.json();
			expect(body.error).toBe('Method not allowed');
			expect(globalThis.fetch).not.toHaveBeenCalled();
		});

		it('blocks path traversal attempts', async () => {
			const response = await GET({
				params: { path: 'v1/albums/../admin/users' },
				url: new URL('http://localhost/api/v1/albums/../admin/users')
			} as any);

			expect(response.status).toBe(403);
			expect(globalThis.fetch).not.toHaveBeenCalled();
		});
	});

	describe('Query Parameters', () => {
		it('forwards query parameters', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				status: 200,
				headers: new Headers({ 'content-type': 'application/json' }),
				json: () => Promise.resolve({ data: [] })
			});

			const response = await GET({
				params: { path: 'v1/albums' },
				url: new URL('http://localhost/api/v1/albums?page=2&per_page=10')
			} as any);

			expect(response.status).toBe(200);
			expect(globalThis.fetch).toHaveBeenCalledWith(
				'http://test-api:8080/v1/albums?page=2&per_page=10',
				{ method: 'GET' }
			);
		});
	});
});
