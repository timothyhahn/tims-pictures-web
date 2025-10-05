import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { env } from '$env/dynamic/private';

const API_URL = env.API_URL || 'http://api:8080';

export const load: PageServerLoad = async ({ params, url }) => {
	return {
		slug: params.slug,
		redirectTo: url.searchParams.get('redirect') || `/albums/${params.slug}`
	};
};

export const actions = {
	default: async ({ request, params, cookies }) => {
		const formData = await request.formData();
		const password = formData.get('password')?.toString();

		if (!password) {
			return fail(400, { error: 'Password is required', password: '' });
		}

		try {
			// Validate password with the API
			const response = await fetch(`${API_URL}/v1/albums/slug/${params.slug}/validate`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ password })
			});

			if (!response.ok) {
				if (response.status === 401 || response.status === 403) {
					return fail(401, { error: 'Invalid password', password });
				}
				console.error(`[Album Auth] API returned ${response.status}`);
				return fail(500, { error: 'Failed to validate password', password });
			}

			const data = await response.json();

			// Verify we received a token
			if (!data.token) {
				console.error('[Album Auth] No token received from API');
				return fail(500, { error: 'Authentication failed - no token received', password });
			}

			// Save the JWT token to cookies
			cookies.set('auth_token', data.token, {
				path: '/',
				httpOnly: true,
				secure: true,
				sameSite: 'strict',
				maxAge: 60 * 60 * 24 * 30 // 30 days
			});
		} catch (error) {
			console.error('[Album Auth] Validation error:', error);
			return fail(500, { error: 'Failed to validate password', password });
		}

		// Redirect back to the album (outside try-catch so it propagates)
		throw redirect(303, `/albums/${params.slug}`);
	}
} satisfies Actions;
