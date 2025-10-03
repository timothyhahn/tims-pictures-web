import type { Handle } from '@sveltejs/kit';
import { RetryAfterRateLimiter } from 'sveltekit-rate-limiter/server';

const ipUaLimiter = new RetryAfterRateLimiter({
	IP: [60, 's'],
	IPUA: [60, 's']
});

const ipLimiter = new RetryAfterRateLimiter({
	IP: [10, 's']
});

export const handle: Handle = async ({ event, resolve }) => {
	const hostname = event.request.headers.get('host');
	const url = event.url;

	// Skip API routes
	if (url.pathname.startsWith('/api')) {
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

	// Apply rate limiting
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

	return resolve(event);
};
