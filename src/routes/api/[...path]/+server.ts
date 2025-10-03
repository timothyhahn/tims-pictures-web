import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

const API_URL = env.API_URL || 'http://api:8080';

export const GET: RequestHandler = async ({ params, url }) => {
	const path = params.path;
	const queryString = url.search;
	// Don't add /v1/ prefix since the client already includes it
	const apiUrl = `${API_URL}/${path}${queryString}`;

	try {
		const response = await fetch(apiUrl);

		// Handle empty responses (like 404s with no body)
		if (!response.ok && response.status === 404) {
			return json({ error: 'Not found' }, { status: 404 });
		}

		// Try to parse as JSON, fall back to text if it fails
		const contentType = response.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			const data = await response.json();
			return json(data, { status: response.status });
		} else {
			const text = await response.text();
			console.error(`[API Proxy] Non-JSON response: ${text.substring(0, 200)}`);
			return json({ error: 'API returned non-JSON response', details: text }, { status: 500 });
		}
	} catch (error) {
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
};

export const POST: RequestHandler = async ({ params, url, request }) => {
	const path = params.path;
	const queryString = url.search;
	const apiUrl = `${API_URL}/${path}${queryString}`;

	try {
		const body = await request.text();
		const response = await fetch(apiUrl, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body
		});

		const contentType = response.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			const data = await response.json();
			return json(data, { status: response.status });
		} else {
			const text = await response.text();
			console.error(`[API Proxy] Non-JSON response: ${text.substring(0, 200)}`);
			return json({ error: 'API returned non-JSON response', details: text }, { status: 500 });
		}
	} catch (error) {
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
};

export const PUT: RequestHandler = async ({ params, url, request }) => {
	const path = params.path;
	const queryString = url.search;
	const apiUrl = `${API_URL}/${path}${queryString}`;

	try {
		const body = await request.text();
		const response = await fetch(apiUrl, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body
		});

		const contentType = response.headers.get('content-type');
		if (contentType && contentType.includes('application/json')) {
			const data = await response.json();
			return json(data, { status: response.status });
		} else {
			const text = await response.text();
			console.error(`[API Proxy] Non-JSON response: ${text.substring(0, 200)}`);
			return json({ error: 'API returned non-JSON response', details: text }, { status: 500 });
		}
	} catch (error) {
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
};

export const DELETE: RequestHandler = async ({ params, url }) => {
	const path = params.path;
	const queryString = url.search;
	const apiUrl = `${API_URL}/${path}${queryString}`;

	try {
		const response = await fetch(apiUrl, {
			method: 'DELETE'
		});

		if (response.status === 204) {
			return new Response(null, { status: 204 });
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
	} catch (error) {
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
};
