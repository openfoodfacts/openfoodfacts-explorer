import { sanitize } from 'isomorphic-dompurify';
import { STATIC_PAGES_BASE_URL } from '#lib/const.js';

function isAlreadyAbsolute(value: string): boolean {
	return value.startsWith('#') || value.startsWith('//') || /^[a-z][a-z\d+.-]*:/i.test(value);
}

function rebaseUrl(value: string, base: string): string {
	return isAlreadyAbsolute(value) ? value : new URL(value, base).href;
}

/**
 * Rebase every URL in a srcset's "url descriptor" list.
 * Candidates are comma-separated, but a URL itself may contain commas, so each
 * candidate's URL is read through the next ASCII whitespace rather than split on commas.
 */
function rebaseSrcset(value: string, base: string): string {
	const candidates: string[] = [];
	let rest = value;
	while (true) {
		rest = rest.replace(/^[,\s]+/, '');
		if (!rest) break;

		const url = /^\S+/.exec(rest)?.[0] ?? '';
		rest = rest.slice(url.length);

		if (url.endsWith(',')) {
			candidates.push(rebaseUrl(url.replace(/,+$/, ''), base));
			continue;
		}

		rest = rest.replace(/^\s+/, '');
		const descriptorMatch = /^[^,]*/.exec(rest)?.[0] ?? '';
		const descriptor = descriptorMatch.trim();
		rest = rest.slice(descriptorMatch.length);

		candidates.push(descriptor ? `${rebaseUrl(url, base)} ${descriptor}` : rebaseUrl(url, base));
	}
	return candidates.join(', ');
}

/** Resolve page-relative URLs against the source page so they work in the Explorer page */
export function makeSiteRelativeUrlsAbsolute(content: Element, base: string): void {
	for (const [selector, attribute] of [
		['a[href]', 'href'],
		['img[src]', 'src']
	]) {
		for (const element of content.querySelectorAll(selector)) {
			const value = element.getAttribute(attribute);
			if (!value || isAlreadyAbsolute(value)) {
				continue;
			}

			element.setAttribute(attribute, rebaseUrl(value, base));
		}
	}

	for (const element of content.querySelectorAll('img[srcset], source[srcset]')) {
		const value = element.getAttribute('srcset');
		if (!value) continue;
		element.setAttribute('srcset', rebaseSrcset(value, base));
	}
}

export function extractStaticPageContent(
	page: string,
	base: string = STATIC_PAGES_BASE_URL
): string | null {
	// A <style> block would restyle the whole Explorer page, not just this content
	const body = sanitize(page, {
		USE_PROFILES: { html: true },
		FORBID_TAGS: ['style'],
		RETURN_DOM: true
	}) as HTMLElement;

	const content = body.querySelector('#main_column');
	if (!content) {
		return null;
	}

	makeSiteRelativeUrlsAbsolute(content, base);
	// Add btn classes to buttons so they look like the rest of the site
	for (const button of content.querySelectorAll('a.button')) {
		button.classList.add('btn', 'btn-sm', 'btn-primary', 'not-prose', 'h-auto', 'py-2');
	}

	// Spacer paragraphs and empty titles the main site hides with its own CSS
	for (const block of content.querySelectorAll('p, h1, h2, h3, h4, h5, h6')) {
		if (!block.textContent?.trim() && !block.querySelector('img')) {
			block.remove();
		}
	}
	return content.innerHTML;
}

export async function getStaticPageContent(
	fetch: typeof window.fetch,
	id: string
): Promise<string | null> {
	const sourcePageUrl = `${STATIC_PAGES_BASE_URL}/${id}`;
	let base = sourcePageUrl;
	const page = await fetch(`${sourcePageUrl}?content_only=1`, {
		signal: AbortSignal.timeout(5000)
	})
		.then((response) => {
			if (!response.ok) return null;
			base = response.url || sourcePageUrl;
			return response.text();
		})
		.catch(() => null);
	return page === null ? null : extractStaticPageContent(page, base);
}
