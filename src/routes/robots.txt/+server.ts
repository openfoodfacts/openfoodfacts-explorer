import type { RequestHandler } from '@sveltejs/kit';
import { getRobotsTxt } from '#lib/server/indexing.js';

export const GET: RequestHandler = ({ request }) => {
	return new Response(getRobotsTxt(request.headers.get('user-agent')), {
		headers: { 'content-type': 'text/plain; charset=utf-8', vary: 'user-agent' }
	});
};
