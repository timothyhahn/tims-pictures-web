import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

const API_URL = env.API_URL || 'http://api:8080';

export const load: PageServerLoad = async ({ params, url, cookies }) => {
	const password = url.searchParams.get('password');
	if (!password) return {};

	const normalizedSlug = params.slug.toLowerCase();

	// Check if the album is already accessible (public or already authed)
	const headers: Record<string, string> = {};
	const authToken = cookies.get('auth_token');
	if (authToken) {
		headers['Authorization'] = `Bearer ${authToken}`;
	}

	try {
		const albumResponse = await fetch(`${API_URL}/v1/albums/slug/${normalizedSlug}`, {
			headers
		});

		if (albumResponse.ok) {
			// Album is accessible - just consume the query param and redirect
			throw redirect(303, `/albums/${normalizedSlug}`);
		}

		if (albumResponse.status === 401 || albumResponse.status === 403) {
			// Album is private - try validating the password
			const response = await fetch(`${API_URL}/v1/albums/slug/${normalizedSlug}/validate`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ password })
			});

			if (response.ok) {
				const data = await response.json();
				if (data.token) {
					cookies.set('auth_token', data.token, {
						path: '/',
						httpOnly: true,
						secure: true,
						sameSite: 'strict',
						maxAge: 60 * 60 * 24 * 30 // 30 days
					});
					throw redirect(303, `/albums/${normalizedSlug}`);
				}
			}
		}
	} catch (e) {
		// Re-throw redirects
		if (e && typeof e === 'object' && 'status' in e) throw e;
		console.error('[Album Auto-Auth] Validation error:', e);
	}

	// Password was wrong or something failed - send to auth page
	throw redirect(303, `/albums/${normalizedSlug}/auth`);
};
