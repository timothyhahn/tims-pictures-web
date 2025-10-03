import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ApiClient, getApiUrl } from './client';

describe('getApiUrl', () => {
	it('returns /api', () => {
		expect(getApiUrl()).toBe('/api');
	});
});

describe('ApiClient', () => {
	let client: ApiClient;

	beforeEach(() => {
		client = new ApiClient('/api');
		vi.clearAllMocks();
	});

	describe('constructor', () => {
		it('uses provided baseUrl', () => {
			const customClient = new ApiClient('/custom');
			expect(customClient['baseUrl']).toBe('/custom');
		});

		it('uses default baseUrl when not provided', () => {
			const defaultClient = new ApiClient();
			expect(defaultClient['baseUrl']).toBe('/api');
		});
	});

	describe('fetch', () => {
		it('makes a successful GET request', async () => {
			const mockData = { id: 1, name: 'test' };
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockData)
			});

			const result = await client.fetch('/test');

			expect(globalThis.fetch).toHaveBeenCalledWith('/api/test', {
				headers: {
					'Content-Type': 'application/json'
				}
			});
			expect(result).toEqual(mockData);
		});

		it('includes custom headers', async () => {
			const mockData = { id: 1 };
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockData)
			});

			await client.fetch('/test', {
				headers: {
					Authorization: 'Bearer token'
				}
			});

			expect(globalThis.fetch).toHaveBeenCalledWith('/api/test', {
				headers: {
					'Content-Type': 'application/json',
					Authorization: 'Bearer token'
				}
			});
		});

		it('throws error on non-ok response', async () => {
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: false,
				status: 404,
				text: () => Promise.resolve('Not found')
			});

			await expect(client.fetch('/test')).rejects.toThrow('API Error (404): Not found');
		});

		it('throws error on network failure', async () => {
			globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

			await expect(client.fetch('/test')).rejects.toThrow('Network error');
		});

		it('throws generic error for unknown errors', async () => {
			globalThis.fetch = vi.fn().mockRejectedValue('string error');

			await expect(client.fetch('/test')).rejects.toThrow('Unknown API error');
		});
	});

	describe('get', () => {
		it('makes GET request without params', async () => {
			const mockData = { id: 1 };
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockData)
			});

			const result = await client.get('/test');

			expect(globalThis.fetch).toHaveBeenCalledWith('/api/test', {
				headers: {
					'Content-Type': 'application/json'
				}
			});
			expect(result).toEqual(mockData);
		});

		it('builds query string from params', async () => {
			const mockData = { id: 1 };
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockData)
			});

			await client.get('/test', {
				page: 1,
				limit: 10,
				active: true
			});

			expect(globalThis.fetch).toHaveBeenCalledWith('/api/test?page=1&limit=10&active=true', {
				headers: {
					'Content-Type': 'application/json'
				}
			});
		});

		it('filters out undefined and null params', async () => {
			const mockData = { id: 1 };
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockData)
			});

			await client.get('/test', {
				page: 1,
				limit: undefined as unknown as number,
				active: null as unknown as boolean
			});

			expect(globalThis.fetch).toHaveBeenCalledWith('/api/test?page=1', {
				headers: {
					'Content-Type': 'application/json'
				}
			});
		});

		it('encodes special characters in params', async () => {
			const mockData = { id: 1 };
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockData)
			});

			await client.get('/test', {
				search: 'hello world',
				tag: 'foo&bar'
			});

			expect(globalThis.fetch).toHaveBeenCalledWith(
				'/api/test?search=hello%20world&tag=foo%26bar',
				{
					headers: {
						'Content-Type': 'application/json'
					}
				}
			);
		});

		it('handles empty params object', async () => {
			const mockData = { id: 1 };
			globalThis.fetch = vi.fn().mockResolvedValue({
				ok: true,
				json: () => Promise.resolve(mockData)
			});

			await client.get('/test', {});

			// Empty params still adds '?' - could be improved but not critical
			expect(globalThis.fetch).toHaveBeenCalledWith('/api/test?', {
				headers: {
					'Content-Type': 'application/json'
				}
			});
		});
	});
});
