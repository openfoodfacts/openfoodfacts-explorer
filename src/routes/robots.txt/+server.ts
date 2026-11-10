import type { RequestHandler } from '@sveltejs/kit';
import { PUBLIC_ENVIRONMENT } from '$app/env/public';
import { getRobotsTxt, isIndexingAllowed } from '#lib/server/indexing.js';

export const GET: RequestHandler = ({ request }) => {
	const body = getRobotsTxt(
		request.headers.get('user-agent'),
		isIndexingAllowed(PUBLIC_ENVIRONMENT)
	);
	return new Response(body, {
		headers: { 'content-type': 'text/plain; charset=utf-8', vary: 'user-agent' }
	});
};
