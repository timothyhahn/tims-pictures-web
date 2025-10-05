import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const API_URL = env.API_URL || 'http://api:8080';

// Allowlist of API endpoints that can be proxied
// Only these endpoints are accessible through the proxy
const ALLOWED_ENDPOINTS = [
	// Albums
	{ method: 'GET', pattern: /^v1\/albums$/ },
	{ method: 'GET', pattern: /^v1\/albums\/[^/]+$/ },
	{ method: 'GET', pattern: /^v1\/albums\/slug\/[^/]+$/ },
	{ method: 'POST', pattern: /^v1\/albums\/slug\/[^/]+\/validate$/ },

	// Pictures
	{ method: 'GET', pattern: /^v1\/pictures\/recent$/ },
	{ method: 'GET', pattern: /^v1\/pictures\/[^/]+$/ },
	{ method: 'GET', pattern: /^v1\/albums\/[^/]+\/pictures$/ }
] as const;

function isAllowedEndpoint(method: string, path: string): boolean {
	return ALLOWED_ENDPOINTS.some(
		(endpoint) => endpoint.method === method && endpoint.pattern.test(path)
	);
}

async function handleApiResponse(response: Response) {
	if (response.status === 204) {
		return new Response(null, { status: 204 });
	}

	if (!response.ok && response.status === 404) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	const contentType = response.headers.get('content-type');
	if (contentType && contentType.includes('application/json')) {
		const data = await response.json();
		return json(data, { status: response.status });
	} else {
		const text = await response.text();
		console.error(`[API Proxy] Non-JSON response: ${text.substring(0, 200)}`);
		return json({ error: 'API returned non-JSON response', details: text }, { status: 500 });
	}
}

function handleApiError(error: unknown, apiUrl: string) {
	console.error('[API Proxy] Error:', error);
	return json(
		{
			error: 'Failed to fetch from API',
			details: error instanceof Error ? error.message : String(error),
			apiUrl
		},
		{ status: 500 }
	);
}

async function proxyRequest(
	path: string,
	queryString: string,
	method: string,
	authToken?: string,
	body?: string
): Promise<Response> {
	// Check if the endpoint is allowed
	if (!isAllowedEndpoint(method, path)) {
		console.error(`[API Proxy] Blocked unauthorized endpoint: ${method} /${path}`);
		return json({ error: 'Endpoint not allowed' }, { status: 403 });
	}

	const apiUrl = `${API_URL}/${path}${queryString}`;

	try {
		const headers: Record<string, string> = {};

		if (body) {
			headers['Content-Type'] = 'application/json';
		}

		if (authToken) {
			headers['Authorization'] = `Bearer ${authToken}`;
		}

		const options: RequestInit = {
			method,
			...(Object.keys(headers).length > 0 && { headers }),
			...(body && { body })
		};

		const response = await fetch(apiUrl, options);
		return handleApiResponse(response);
	} catch (error) {
		return handleApiError(error, apiUrl);
	}
}

export const GET: RequestHandler = async ({ params, url, cookies }) => {
	const authToken = cookies.get('auth_token');
	return proxyRequest(params.path, url.search, 'GET', authToken);
};

export const POST: RequestHandler = async ({ params, url, cookies, request }) => {
	const authToken = cookies.get('auth_token');
	const body = await request.text();
	return proxyRequest(params.path, url.search, 'POST', authToken, body);
};

export const PUT: RequestHandler = async () => {
	return json({ error: 'Method not allowed' }, { status: 405 });
};

export const DELETE: RequestHandler = async () => {
	return json({ error: 'Method not allowed' }, { status: 405 });
};
