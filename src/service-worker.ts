// Disables access to DOM typings like `HTMLElement` which are not available
// inside a service worker and instantiates the correct globals
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Ensures that the `$service-worker` import has proper type definitions
/// <reference types="@sveltejs/kit" />

import { version } from '$service-worker';

// This gives `self` the correct types
const self = globalThis.self as unknown as ServiceWorkerGlobalScope;

// Create a unique cache name for this deployment
const CACHE = `cache-${version}`;

const STATIC_HOST = 'https://static.openfoodfacts.org';

self.addEventListener('activate', (event) => {
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

self.addEventListener('fetch', (event) => {
	// ignore POST requests etc
	if (event.request.method !== 'GET') return;
	if (event.request.url.startsWith('chrome-extension://')) return;

	async function respond() {
		const url = new URL(event.request.url);

		// Static assets (static.openfoodfacts.org) — cache-first
		if (url.origin === STATIC_HOST) {
			const cache = await caches.open(CACHE);
			const cached = await cache.match(event.request);

			if (cached) {
				console.debug(`SW: cache hit for ${event.request.url}`);
				return cached;
			}

			const response = await fetch(event.request);

			if (response.ok || response.type === 'opaque') {
				event.waitUntil(cache.put(event.request, response.clone()));
			}

			return response;
		}

		// Same-origin SvelteKit build artifacts (JS/CSS) — network-first with offline fallback.
		// We deliberately exclude same-origin API routes (+server.ts) from this branch so
		// they are never cached and always go to the "plain fetch" passthrough below.
		//
		// request.destination identifies the resource type in modern browsers.
		// The url.pathname.endsWith() fallbacks handle programmatic fetch() calls
		// where destination can be an empty string '' — this is distinct from navigation
		// requests (destination === 'document'), which are intentionally excluded here.
		const isSameOriginAsset =
			url.origin === self.location.origin &&
			(event.request.destination === 'script' ||
				event.request.destination === 'style' ||
				url.pathname.endsWith('.js') ||
				url.pathname.endsWith('.css'));

		if (isSameOriginAsset) {
			const cache = await caches.open(CACHE);
			try {
				const response = await fetch(event.request);

				if (response.status === 200) {
					event.waitUntil(cache.put(event.request, response.clone()));
				}

				return response;
			} catch (err) {
				const cached = await cache.match(event.request);

				if (cached) {
					return cached;
				}

				// if there's no cache, then just error out
				// as there is nothing we can do to respond to this request
				throw err;
			}
		}

		// Everything else (API calls, etc.) — plain network passthrough, never cached
		return fetch(event.request);
	}

	event.respondWith(respond());
});
