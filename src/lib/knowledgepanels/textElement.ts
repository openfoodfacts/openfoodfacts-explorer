export type TextElementActionLink = {
	href: string;
	label: string;
};

const WRAPPER_TAGS_REGEX = /<\/?(?:ul|li|p|em|strong|span)\b[^>]*>/gi;
const TAG_REGEX = /<[^>]*>/g;
const NBSP_REGEX = /&(nbsp|#160);/gi;

function stripTags(input: string): string {
	return input.replace(TAG_REGEX, '');
}

/**
 * Some KP text blocks are rendered as a single list item containing one link.
 * Convert those to actionable CTA links so they match KP visual syntax.
 */
export function extractSingleListLink(html: string): TextElementActionLink | null {
	const anchorMatches = [...html.matchAll(/<a\s+[^>]*href=(['"])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)];

	if (anchorMatches.length !== 1) {
		return null;
	}

	const [fullAnchorMatch, , href, anchorInnerHtml] = anchorMatches[0];
	const withoutAnchor = html
		.replace(fullAnchorMatch, '')
		.replace(WRAPPER_TAGS_REGEX, '')
		.replace(NBSP_REGEX, ' ')
		.trim();

	if (withoutAnchor.length > 0) {
		return null;
	}

	const label = stripTags(anchorInnerHtml).replace(NBSP_REGEX, ' ').replace(/\s+/g, ' ').trim();

	if (label.length === 0 || href.trim().length === 0) {
		return null;
	}

	return { href: href.trim(), label };
}
