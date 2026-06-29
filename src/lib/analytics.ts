// SPDX-FileCopyrightText: Open Food Facts contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Centralized analytics helper for Open Food Facts Explorer.
 *
 * Naming convention follows openfoodfacts-server style (category/action/name/value)
 * with lowercase snake_case. The category string already encodes the slash path,
 * e.g. category "product" + action "has_nutriscore" → "product/has_nutriscore".
 *
 * No barcode, email, username, or image URL should ever be passed here.
 */

import { get } from 'svelte/store';
import { tracker } from '$lib/matomo';

/**
 * Track an Open Food Facts event via Matomo.
 *
 * @param category  Event namespace, e.g. "product", "account", "personal_search"
 * @param action    Specific event, e.g. "has_nutriscore", "login_success"
 * @param name      Optional label, e.g. grade ("a"), group ("1"), image type ("front")
 * @param value     Optional numeric value
 */
export function trackOffEvent(
	category: string,
	action: string,
	name?: string,
	value?: number
): void {
	const t = get(tracker);
	if (!t) return;

	try {
		t.trackEvent(category, action, name, value);
	} catch {
		// Analytics should never break the app
	}
}
