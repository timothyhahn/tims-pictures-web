import * as Sentry from '@sentry/sveltekit';

Sentry.init({
	dsn: 'https://c6ca6ff0ddd866f74388c7565f00f18f@o4505292621611008.ingest.us.sentry.io/4510126746435584',

	tracesSampleRate: 1.0

	// uncomment the line below to enable Spotlight (https://spotlightjs.com)
	// spotlight: import.meta.env.DEV,
});
