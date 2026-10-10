import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	return Response.json(
		{ status: 'up' },
		{
			status: 200,
			headers: { 'Cache-Control': 'no-cache' }
		}
	);
};
