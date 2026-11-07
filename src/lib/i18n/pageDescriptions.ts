import type { WebsiteFlavor } from '#lib/flavor.js';
import { landing, explore, compare } from './messages/en-US.json';

const descriptions = {
	'landing.subtitle': { food: landing.subtitle, ...landing.subtitle_by_flavor },
	'landing.help_improve_desc': {
		food: landing.help_improve_desc,
		...landing.help_improve_desc_by_flavor
	},
	'explore.subtitle': { food: explore.subtitle, ...explore.subtitle_by_flavor },
	'compare.page_description': {
		food: compare.page_description,
		...compare.page_description_by_flavor
	}
};

export function getPageDescription(
	translate: (id: string, options: { default: string }) => string,
	key: keyof typeof descriptions,
	flavor: WebsiteFlavor
): string {
	// Keep existing food translations. New keys fall back to the Crowdin source,
	// since the app's fallback locale is en, not en-US.
	return translate(flavor === 'food' ? key : `${key}_by_flavor.${flavor}`, {
		default: descriptions[key][flavor]
	});
}
