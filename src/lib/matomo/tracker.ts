// SPDX-FileCopyrightText:  Andreas Nüßlein <andreas@nuessle.in>
// SPDX-FileCopyrightText:  Mikkel Eide Eriksen <mikkel.eriksen@gmail.com>
// SPDX-FileCopyrightText:  VaiTon <eyadlorenzo@gmail.com>
//
// SPDX-License-Identifier: AGPL-3.0-or-later
//
// Initially taken from https://github.com/sinnwerkstatt/sveltekit-matomo

import { writable } from 'svelte/store';

// https://developer.matomo.org/api-reference/tracking-javascript
export interface Tracker {
	// Using the Tracker Object

	/** Log a page view */
	trackPageView: (customTitle?: string) => void;

	/** Log an event with an event category (Videos, Music, Games...), an event
	 *  action (Play, Pause, Duration, Add Playlist, Downloaded, Clicked...), and an
	 *  optional event name and optional numeric value. */
	trackEvent: (category: string, action: string, name?: string, value?: number) => void;

	/** Log an internal site search for a specific keyword, in an optional category,
	 *  specifying the optional count of search results in the page. */
	trackSiteSearch: (keyword: string, category?: string, resultsCount?: number) => void;

	/** Log a click on an outbound or download link to the given URL */
	trackLink: (url: string, linkType: 'link' | 'download') => void;

	/** Log a goal conversion */
	trackGoal: (goalId: number, customRevenue?: number) => void;

	/** Install a Heart beat timer that will send additional requests to Matomo in
	 *  order to better measure the time spent in the visit. */
	enableHeartBeatTimer: (activeTimeInSeconds?: number) => void;

	/** Install link tracking on all applicable link elements. Set the enable parameter
	 *  to true to use pseudo click-handler (treat middle click and open contextmenu as
	 *  left click). A right click (or any click that opens the context menu) on a link
	 *  will be tracked as clicked even if "Open in new tab" is not selected. If "false"
	 *  (default), nothing will be tracked on open context menu or middle click. */
	enableLinkTracking: (enable?: boolean) => void;

	// Configuration of the Tracker Object

	/** Override the page's reported URL */
	setCustomUrl: (url: string) => void;

	/** Set to true to not track users who opt out of tracking using Mozilla's
	 * (proposed) Do Not Track setting. */
	setDoNotTrack: (bool: boolean) => void;

	/** Set a custom dimension. (requires Custom Dimensions plugin) */
	setCustomDimension: (dimensionID: number, value: string) => void;

	/** Delete a custom dimension */
	deleteCustomDimension: (dimensionID: number) => void;

	/** Set a custom variable. (deprecated, use custom dimensions instead) */
	setCustomVariable: (index: number, name: string, value: string, scope?: 'page' | 'visit') => void;

	/** Delete a custom variable */
	deleteCustomVariable: (index: number, scope?: 'page' | 'visit') => void;

	/** Override the referrer URL */
	setReferrerUrl: (url: string) => void;

	/** Set the page generation time in milliseconds */
	setGenerationTimeMs: (timeMs: number) => void;

	/** Set the user ID for cross-device tracking */
	setUserId: (userId: string) => void;

	/** Reset the user ID */
	resetUserId: () => void;

	/** Get the visitor ID (16 character hex string) */
	getVisitorId: () => string;

	/** Get the visitor info array */
	getVisitorInfo: () => Array<string | number>;

	// Managing Consent

	/** By default, the Matomo tracker assumes consent to tracking. To change this
	 *  behavior so nothing is tracked until a user consents, you must call
	 *  requireConsent. */
	requireConsent: () => void;

	/** Mark that the current user has given their consent */
	setConsentGiven: () => void;

	/** Mark that consent was removed. No cookies will be used after calling this */
	forgetConsentGiven: () => void;

	/** Mark that the user has given their consent for storing and using cookies,
	 *  but not for tracking. */
	setCookieConsentGiven: () => void;

	/** Mark that the user has removed their consent for storing and using cookies */
	forgetCookieConsentGiven: () => void;

	/** Mark that the current user requires consent to be tracked */
	requireCookieConsent: () => void;

	/** Returns true if the user has given consent, false otherwise */
	hasRememberedConsent: () => boolean;

	/** Disables sending any tracking request to the Matomo server */
	optUserOut: () => void;

	/** Re-enables sending tracking requests */
	forgetUserOptOut: () => void;

	// Configuration of Tracking Cookies

	/** Disable all first party cookies. Existing Matomo cookies for this website
	 *  will be deleted on the next page view. Cookies will be even disabled if the
	 *  user has given cookie consent using the method */
	disableCookies: () => void;

	/** Re-enable cookies if they were disabled before */
	enableCookies: () => void;

	/** Delete all first party cookies used by Matomo */
	deleteCookies: () => void;

	/** Set the domain of the tracking cookies */
	setCookieDomain: (domain: string) => void;

	/** Set the path of the tracking cookies */
	setCookiePath: (path: string) => void;

	/** Force the cookie to only be sent over HTTPS */
	setSecureCookie: (secure: boolean) => void;

	/** Set the visitor cookie timeout in seconds (default 13 months) */
	setVisitorCookieTimeout: (seconds: number) => void;

	/** Set the session cookie timeout in seconds (default 30 minutes) */
	setSessionCookieTimeout: (seconds: number) => void;

	/** Set the referral cookie timeout in seconds (default 6 months) */
	setReferralCookieTimeout: (seconds: number) => void;

	/** Set cookie name prefix (default '_pk_') */
	setCookieNamePrefix: (prefix: string) => void;

	/** Always use the Beacon API to send tracking requests */
	alwaysUseSendBeacon: () => void;

	// Cross-Domain Linking

	/** Enable cross domain linking. */
	enableCrossDomainLinking: () => void;

	/** Disable cross domain linking if it was enabled */
	disableCrossDomainLinking: () => void;

	/** Set array of hostnames or domains to be treated as local. */
	setDomains: (domains: string[]) => void;

	/** Get the cross domain linking URL query parameter */
	getCrossDomainLinkingUrlParameter: () => string;

	// Content Tracking

	/** Scan the DOM for all content blocks and track all impressions once the DOM is ready */
	trackAllContentImpressions: () => void;

	/** Scan the DOM for all content blocks and track visible impressions */
	trackVisibleContentImpressions: (checkOnScroll?: boolean, watchInterval?: number) => void;

	/** Track an impression of a content block */
	trackContentImpression: (
		contentName: string,
		contentPiece: string,
		contentTarget: string
	) => void;

	/** Track an interaction with a content block */
	trackContentInteraction: (
		interaction: string,
		contentName: string,
		contentPiece: string,
		contentTarget: string
	) => void;

	// E-Commerce

	/** Add an item to the cart */
	addEcommerceItem: (
		productSKU: string,
		productName: string,
		productCategory: string | string[],
		productPrice: number,
		quantity?: number
	) => void;

	/** Remove an item from the cart */
	removeEcommerceItem: (productSKU: string) => void;

	/** Clear all items from the cart */
	clearEcommerceCart: () => void;

	/** Get cart items currently in the cart */
	getEcommerceItems: () => Record<string, unknown>;

	/** Track a cart update */
	trackEcommerceCartUpdate: (cartAmount: number) => void;

	/** Track an e-commerce order */
	trackEcommerceOrder: (
		orderId: string,
		orderGrandTotal: number,
		orderSubTotal?: number,
		orderTax?: number,
		orderShipping?: number,
		orderDiscount?: number
	) => void;
}

export const tracker = writable<Tracker>();

type Matomo = {
	getTracker: (trackerUrl: string, siteId: number) => Tracker | undefined;
};

declare global {
	interface Window {
		Matomo?: Matomo;
	}
}
