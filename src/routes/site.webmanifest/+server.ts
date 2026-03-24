import type { RequestHandler } from '@sveltejs/kit';

import android192PNG from './android-chrome-192x192.png?url';
import android512PNG from './android-chrome-512x512.png?url';

type WebManifest = {
	name: string;
	short_name?: string;
	icons?: Array<{
		src: string;
		sizes: string;
		type: string;
		purpose?: string;
	}>;
	theme_color?: string;
	background_color?: string;
	display?: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser';
	start_url?: string;
	scope?: string;
	description?: string;
	orientation?: string;
};

export const GET: RequestHandler = async () => {
	const manifest: WebManifest = {
		name: 'Open Food Facts Explorer',
		short_name: 'OFF Explorer',
		icons: [
			{
				src: android192PNG,
				sizes: '192x192',
				type: 'image/png'
			},
			{
				src: android512PNG,
				sizes: '512x512',
				type: 'image/png'
			}
		],
		theme_color: '#ffffff',
		background_color: '#ffffff',
		display: 'standalone'
	};

	const json = JSON.stringify(manifest);

	return new Response(json, {
		headers: { 'Content-Type': 'application/manifest+json' }
	});
};
