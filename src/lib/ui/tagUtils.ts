/**
 * Safely extracts and resolves a tag miniature or icon image URL
 * from a tag object or URL string.
 */
export function getTagMiniatureUrl(tag: unknown): string | undefined {
	if (!tag) return undefined;

	let url: string | undefined = undefined;
	let tagIdCandidate: string | undefined = undefined;

	if (typeof tag === 'object' && tag !== null) {
		const obj = tag as Record<string, unknown>;
		const candidate =
			obj.icon_url ??
			obj.image_url ??
			obj.miniature ??
			obj.icon ??
			obj.small_image_url ??
			obj.image ??
			obj.svg;

		if (typeof candidate === 'string' && candidate.trim() !== '') {
			url = candidate.trim();
		} else {
			const idVal = obj.id ?? obj.key ?? obj.tag;
			if (typeof idVal === 'string' && idVal.trim() !== '') {
				tagIdCandidate = idVal.trim();
			}
		}
	} else if (typeof tag === 'string') {
		const trimmed = tag.trim();
		if (
			trimmed.startsWith('http://') ||
			trimmed.startsWith('https://') ||
			trimmed.startsWith('/') ||
			trimmed.startsWith('data:')
		) {
			url = trimmed;
		} else {
			tagIdCandidate = trimmed;
		}
	}

	if (!url && tagIdCandidate) {
		// Clean language prefix e.g. "en:organic" -> "organic", "fr:bio" -> "bio"
		const parts = tagIdCandidate.split(':');
		const rawId = parts.length > 1 ? parts.slice(1).join(':') : parts[0];
		const cleanId = rawId
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9_-]/g, '');

		// Only attempt constructing static icon URL for valid text slugs (not pure numbers like barcodes)
		if (cleanId.length > 1 && !/^\d+$/.test(cleanId)) {
			url = `https://static.openfoodfacts.org/images/icons/dist/${cleanId}.svg`;
		}
	}

	if (!url) return undefined;

	if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
		return url;
	}
	if (url.startsWith('/')) {
		return `https://static.openfoodfacts.org${url}`;
	}
	return `https://static.openfoodfacts.org/${url}`;
}
