import { get } from 'svelte/store';
import { preferences } from '#lib/settings.js';
import { PricesApi } from '@openfoodfacts/openfoodfacts-nodejs';
import { PUBLIC_PRICES_API_URL } from '$app/env/public';
import { OPEN_PRICES_BASE_URL } from '#lib/const.js';

const BASE_URL = PUBLIC_PRICES_API_URL || undefined;

export function isConfigured() {
	return BASE_URL != null;
}

export const createPricesApi = (fetch: typeof window.fetch): PricesApi => {
	if (!isConfigured()) {
		throw new Error('Prices API is not configured');
	}
	// We know this is not null because of the check above
	const baseUrl = BASE_URL!;

	const authToken = get(preferences)?.prices?.authToken ?? undefined;
	const pricesApi = new PricesApi(fetch, { baseUrl, authToken });
	return pricesApi;
};

export const updatePricesAuthToken = (token: string | null) => {
	preferences.update((p) => ({
		...p,
		prices: { ...p.prices, authToken: token }
	}));
};

// Challenges and badges are public. The generated client has no method for badges, so these
// small read-only calls use fetch directly and describe only the fields the dashboard needs.

export type OpenPricesChallengeStatus = 'ONGOING' | 'UPCOMING';

export type OpenPricesChallenge = {
	id: number;
	status: string;
	title: string | null;
	subtitle: string | null;
	icon: string | null;
	start_date: string | null;
	end_date: string | null;
};

export type OpenPricesBadge = {
	id: number;
	name: string;
	description: string | null;
	image_url: string | null;
	user_count: number;
};

export type OpenPricesUserBadge = { id: number; badge: OpenPricesBadge; achieved_at: string };

async function getPage<T>(
	fetch: typeof window.fetch,
	path: string,
	params: Record<string, string>
): Promise<T[]> {
	const url = `${OPEN_PRICES_BASE_URL.replace(/\/$/, '')}${path}?${new URLSearchParams(params)}`;
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error(`Open Prices request failed: ${response.status} ${response.statusText}`);
	}
	return ((await response.json()) as { items: T[] }).items;
}

export function getOpenPricesChallenges(
	fetch: typeof window.fetch,
	status: OpenPricesChallengeStatus
) {
	return getPage<OpenPricesChallenge>(fetch, '/api/v1/challenges', {
		status,
		is_published: 'true',
		size: '10'
	});
}

export function getOpenPricesUserBadges(fetch: typeof window.fetch, user: string) {
	return getPage<OpenPricesUserBadge>(fetch, `/api/v1/users/${encodeURIComponent(user)}/badges`, {
		size: '100'
	});
}
