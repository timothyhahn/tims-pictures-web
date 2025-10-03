import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
	// Redirect from old URL format /{slug}/{key} to new format /albums/{slug}
	throw redirect(301, `/albums/${params.slug}`);
};
