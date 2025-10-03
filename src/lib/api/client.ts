/**
 * Get the appropriate API URL
 * Always uses the SvelteKit proxy endpoint which handles server-side communication
 */
export function getApiUrl(): string {
	// Both client and server use the SvelteKit API proxy
	// The proxy at /api/[...path] handles forwarding to the backend API
	return '/api';
}

/**
 * Base API client with error handling
 */
export class ApiClient {
	private baseUrl: string;

	constructor(baseUrl?: string) {
		this.baseUrl = baseUrl || getApiUrl();
	}

	async fetch<T>(path: string, init?: RequestInit): Promise<T> {
		const url = `${this.baseUrl}${path}`;

		try {
			const response = await fetch(url, {
				...init,
				headers: {
					'Content-Type': 'application/json',
					...init?.headers
				}
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`API Error (${response.status}): ${errorText}`);
			}

			return await response.json();
		} catch (error) {
			if (error instanceof Error) {
				throw error;
			}
			throw new Error('Unknown API error');
		}
	}

	async get<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
		const queryString = params
			? '?' +
				Object.entries(params)
					.filter(([, value]) => value !== undefined && value !== null)
					.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
					.join('&')
			: '';

		return this.fetch<T>(`${path}${queryString}`);
	}
}

// Export a singleton instance
export const apiClient = new ApiClient();
