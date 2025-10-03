import type { Handle } from '@sveltejs/kit';

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

	return resolve(event);
};
