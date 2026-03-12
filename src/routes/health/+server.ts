import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import pkg from '../../../package.json';

export const GET: RequestHandler = () => {
	return json(
		{
			status: 'ok',
			version: pkg.version
		},
		{
			status: 200,
			headers: { 'Cache-Control': 'no-cache' }
		}
	);
};
