// SPDX-FileCopyrightText: Open Food Facts contributors
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 * Centralized analytics helper for Open Food Facts Explorer.
 *
 * Naming convention follows openfoodfacts-server style (category/action/name/value)
 * with lowercase snake_case. Categories describe the area of the product, while
 * actions describe a user outcome, e.g. "contribution" + "image_upload_succeeded".
 *
 * No barcode, email, username, or image URL should ever be passed here.
 */

import { get } from 'svelte/store';
import { tracker } from '$lib/matomo';

/**
 * Track an Open Food Facts event via Matomo.
 *
 * @param category  Event namespace, e.g. "contribution", "account", "system"
 * @param action    Specific event, e.g. "image_upload_succeeded", "login_succeeded"
 * @param name      Optional low-cardinality label, e.g. image type ("front")
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

/**
 * Track a product search in Matomo's dedicated internal-search report.
 *
 * Search terms are intentionally not sent when they look like barcodes or
 * email addresses. Search input is user-controlled and must not be treated as
 * a safe analytics label by default.
 */
export function trackOffSiteSearch(keyword: string, resultsCount?: number): void {
	const normalizedKeyword = keyword.trim();
	const normalizedBarcode = normalizedKeyword.replace(/[\s-]/g, '');

	if (
		normalizedKeyword === '' ||
		/^\d{5,18}$/.test(normalizedBarcode) ||
		/[^\s@]+@[^\s@]+\.[^\s@]+/.test(normalizedKeyword)
	) {
		return;
	}

	const t = get(tracker);
	if (!t) return;

	try {
		t.trackSiteSearch(normalizedKeyword, 'products', resultsCount);
	} catch {
		// Analytics should never break the app
	}
}
