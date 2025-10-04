import { sequence } from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import type { Handle } from '@sveltejs/kit';
import { RetryAfterRateLimiter } from 'sveltekit-rate-limiter/server';

const ipUaLimiter = new RetryAfterRateLimiter({
	IP: [60, 's'],
	IPUA: [60, 's']
});

const ipLimiter = new RetryAfterRateLimiter({
	IP: [10, 's']
});

const apiLimiter = new RetryAfterRateLimiter({
	IP: [30, 's'], // 30 requests per second for API routes
	IPUA: [100, 's'] // 100 requests per second per IP+UA for API routes
});

export const handle: Handle = sequence(Sentry.sentryHandle(), async ({ event, resolve }) => {
	const hostname = event.request.headers.get('host');
	const url = event.url;

	// Skip rate limiting for health checks (critical for infrastructure)
	if (url.pathname === '/health') {
		return resolve(event);
	}

	// Skip rate limiting for internal SvelteKit fetches (SSR)
	const isInternalFetch =
		event.isSubRequest || event.request.headers.get('x-sveltekit-fetch') === 'true';

	// Apply rate limiting to API routes (but not internal fetches)
	if (url.pathname.startsWith('/api') && !isInternalFetch) {
		const apiStatus = await apiLimiter.check(event);
		if (apiStatus.limited) {
			return new Response('Too Many Requests', {
				status: 429,
				headers: {
					'Retry-After': apiStatus.retryAfter.toString()
				}
			});
		}
		return resolve(event);
	}

	// Redirect from tims.pictures to www.tims.pictures
	if (hostname === 'tims.pictures') {
		const newUrl = new URL(url);
		newUrl.host = 'www.tims.pictures';
		return new Response(null, {
			status: 301,
			headers: {
				Location: newUrl.toString()
			}
		});
	}

	// Apply rate limiting (but not for internal fetches)
	if (!isInternalFetch) {
		const ipUaStatus = await ipUaLimiter.check(event);
		if (ipUaStatus.limited) {
			return new Response('Too Many Requests', {
				status: 429,
				headers: {
					'Retry-After': ipUaStatus.retryAfter.toString()
				}
			});
		}

		const ipStatus = await ipLimiter.check(event);
		if (ipStatus.limited) {
			return new Response('Too Many Requests', {
				status: 429,
				headers: {
					'Retry-After': ipStatus.retryAfter.toString()
				}
			});
		}
	}

	const response = await resolve(event);

	// Add security headers
	response.headers.set(
		'Content-Security-Policy',
		[
			"default-src 'self'",
			"script-src 'self' 'unsafe-inline' https://cdn.usefathom.com", // unsafe-inline needed for SvelteKit hydration
			"style-src 'self' 'unsafe-inline'", // unsafe-inline needed for Svelte component styles
			"img-src 'self' data: https://timspictures.b-cdn.net https://cdn.usefathom.com",
			"font-src 'self'",
			"connect-src 'self' https://o4505292621611008.ingest.us.sentry.io",
			"worker-src 'self' blob:", // blob: needed for Vite HMR workers
			"frame-ancestors 'none'",
			"base-uri 'self'",
			"form-action 'self'"
		].join('; ')
	);
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

	return response;
});
export const handleError = Sentry.handleErrorWithSentry();
