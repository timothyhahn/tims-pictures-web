import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock SvelteKit
vi.mock('@sveltejs/kit', () => ({
	redirect: (status: number, location: string) => ({ status, location })
}));

// Mock environment
vi.mock('$env/dynamic/private', () => ({
	env: { API_URL: 'http://test-api:8080' }
}));

// Import after mocks are set up
const { load } = await import('./+page.server');

// Helper to create mock cookies object
const mockCookies = () => ({
	get: vi.fn().mockReturnValue(undefined),
	set: vi.fn(),
	delete: vi.fn(),
	serialize: vi.fn()
});

// Helper to create mock load event
function mockLoadEvent(
	slug: string,
	searchParams: Record<string, string> = {},
	cookies = mockCookies()
) {
	const url = new URL(`http://localhost/albums/${slug}`);
	for (const [key, value] of Object.entries(searchParams)) {
		url.searchParams.set(key, value);
	}
	return {
		params: { slug },
		url,
		cookies
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
	} as any;
}

describe('Album auto-auth via query param', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		globalThis.fetch = vi.fn();
	});

	it('returns empty object when no password param', async () => {
		const result = await load(mockLoadEvent('test-album'));

		expect(result).toEqual({});
		expect(globalThis.fetch).not.toHaveBeenCalled();
	});

	it('redirects to clean URL when album is already accessible', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200
		});

		await expect(load(mockLoadEvent('test-album', { password: 'anything' }))).rejects.toEqual({
			status: 303,
			location: '/albums/test-album'
		});

		// Should only call album check, not validate
		expect(globalThis.fetch).toHaveBeenCalledTimes(1);
		expect(globalThis.fetch).toHaveBeenCalledWith(
			'http://test-api:8080/v1/albums/slug/test-album',
			{ headers: {} }
		);
	});

	it('sets cookie and redirects when password is valid for private album', async () => {
		const cookies = mockCookies();

		globalThis.fetch = vi
			.fn()
			// First call: album check returns 403
			.mockResolvedValueOnce({ ok: false, status: 403 })
			// Second call: validate returns token
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: () => Promise.resolve({ token: 'mock-jwt-token' })
			});

		await expect(load(mockLoadEvent('secret', { password: 'correct' }, cookies))).rejects.toEqual({
			status: 303,
			location: '/albums/secret'
		});

		// Should have called album check then validate
		expect(globalThis.fetch).toHaveBeenCalledTimes(2);
		expect(globalThis.fetch).toHaveBeenNthCalledWith(
			1,
			'http://test-api:8080/v1/albums/slug/secret',
			{ headers: {} }
		);
		expect(globalThis.fetch).toHaveBeenNthCalledWith(
			2,
			'http://test-api:8080/v1/albums/slug/secret/validate',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password: 'correct' })
			}
		);

		// Should have set the cookie
		expect(cookies.set).toHaveBeenCalledWith('auth_token', 'mock-jwt-token', {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'strict',
			maxAge: 60 * 60 * 24 * 30
		});
	});

	it('redirects to auth page when password is invalid', async () => {
		globalThis.fetch = vi
			.fn()
			// First call: album check returns 403
			.mockResolvedValueOnce({ ok: false, status: 403 })
			// Second call: validate returns 401
			.mockResolvedValueOnce({ ok: false, status: 401 });

		await expect(load(mockLoadEvent('secret', { password: 'wrong' }))).rejects.toEqual({
			status: 303,
			location: '/albums/secret/auth'
		});
	});

	it('redirects to auth page when album returns 401', async () => {
		const cookies = mockCookies();

		globalThis.fetch = vi
			.fn()
			// First call: album check returns 401
			.mockResolvedValueOnce({ ok: false, status: 401 })
			// Second call: validate returns token
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: () => Promise.resolve({ token: 'mock-jwt-token' })
			});

		await expect(load(mockLoadEvent('secret', { password: 'correct' }, cookies))).rejects.toEqual({
			status: 303,
			location: '/albums/secret'
		});

		expect(cookies.set).toHaveBeenCalledWith('auth_token', 'mock-jwt-token', expect.any(Object));
	});

	it('forwards existing auth token when checking album accessibility', async () => {
		const cookies = mockCookies();
		cookies.get.mockReturnValue('existing-token');

		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200
		});

		await expect(
			load(mockLoadEvent('test-album', { password: 'anything' }, cookies))
		).rejects.toEqual({ status: 303, location: '/albums/test-album' });

		expect(globalThis.fetch).toHaveBeenCalledWith(
			'http://test-api:8080/v1/albums/slug/test-album',
			{ headers: { Authorization: 'Bearer existing-token' } }
		);
	});

	it('normalizes slug to lowercase', async () => {
		globalThis.fetch = vi.fn().mockResolvedValue({
			ok: true,
			status: 200
		});

		await expect(load(mockLoadEvent('My-Album', { password: 'test' }))).rejects.toEqual({
			status: 303,
			location: '/albums/my-album'
		});

		expect(globalThis.fetch).toHaveBeenCalledWith('http://test-api:8080/v1/albums/slug/my-album', {
			headers: {}
		});
	});

	it('redirects to auth page when validate returns no token', async () => {
		globalThis.fetch = vi
			.fn()
			.mockResolvedValueOnce({ ok: false, status: 403 })
			.mockResolvedValueOnce({
				ok: true,
				status: 200,
				json: () => Promise.resolve({ valid: true }) // no token field
			});

		await expect(load(mockLoadEvent('secret', { password: 'test' }))).rejects.toEqual({
			status: 303,
			location: '/albums/secret/auth'
		});
	});

	it('redirects to auth page when fetch throws a network error', async () => {
		globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

		await expect(load(mockLoadEvent('secret', { password: 'test' }))).rejects.toEqual({
			status: 303,
			location: '/albums/secret/auth'
		});
	});
});
