import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const API_URL = env.API_URL || 'http://api:8080';

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
	body?: string
): Promise<Response> {
	const apiUrl = `${API_URL}/${path}${queryString}`;

	try {
		const options: RequestInit = { method };
		if (body) {
			options.headers = { 'Content-Type': 'application/json' };
			options.body = body;
		}

		const response = await fetch(apiUrl, options);
		return handleApiResponse(response);
	} catch (error) {
		return handleApiError(error, apiUrl);
	}
}

export const GET: RequestHandler = async ({ params, url }) => {
	return proxyRequest(params.path, url.search, 'GET');
};

export const POST: RequestHandler = async ({ params, url, request }) => {
	const body = await request.text();
	return proxyRequest(params.path, url.search, 'POST', body);
};

export const PUT: RequestHandler = async ({ params, url, request }) => {
	const body = await request.text();
	return proxyRequest(params.path, url.search, 'PUT', body);
};

export const DELETE: RequestHandler = async ({ params, url }) => {
	return proxyRequest(params.path, url.search, 'DELETE');
};
