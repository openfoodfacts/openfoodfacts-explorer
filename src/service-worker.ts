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

const NETWORK_TIMEOUT_MS = 3000;

self.addEventListener('activate', (event) => {
	// Remove previous cached data from disk
	async function deleteOldCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(deleteOldCaches());
});

async function fetchWithTimeout(request: Request, ms = NETWORK_TIMEOUT_MS) {
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), ms);
	try {
		return await fetch(request, { signal: controller.signal });
	} finally {
		clearTimeout(timer);
	}
}

function isBuildAsset(request: Request) {
	const url = new URL(request.url);
	if (url.origin !== self.location.origin) return false;
	// Use destination when available; fall back to extension for programmatic fetches
	if (request.destination === 'script' || request.destination === 'style') return true;
	if (request.destination !== '') return false; // navigation, worker, etc.
	return url.pathname.endsWith('.js') || url.pathname.endsWith('.css');
}

async function cacheFirst(request: Request) {
	const cache = await caches.open(CACHE);
	const cached = await cache.match(request);
	if (cached) {
		return cached;
	}
	const response = await fetch(request);
	if (response.ok || response.type === 'opaque') {
		cache.put(request, response.clone());
	}
	return response;
}

async function networkFirst(request: Request) {
	try {
		const response = await fetchWithTimeout(request);
		if (response.ok || response.type === 'opaque') {
			const cache = await caches.open(CACHE);
			cache.put(request, response.clone());
		}
		return response;
	} catch (error) {
		const cache = await caches.open(CACHE);
		const cached = await cache.match(request);
		if (cached) return cached;
		throw error;
	}
}

self.addEventListener('fetch', (event) => {
	const { request } = event;

	// Only handle GET requests
	if (request.method !== 'GET') return;
	if (request.url.startsWith('chrome-extension://')) return;

	const url = new URL(request.url);

	// Static assets: Cache-first
	if (url.origin === STATIC_HOST) {
		event.respondWith(cacheFirst(request));
		return;
	}

	// Build assets: Network-first with timeout
	if (isBuildAsset(request)) {
		// Build assets: Network-first with timeout
		event.respondWith(networkFirst(request));
		return;
	}
});
