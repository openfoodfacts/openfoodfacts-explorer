import { sanitize } from 'isomorphic-dompurify';

export const STATIC_PAGES_BASE_URL = 'https://world.openfoodfacts.org';

export function extractStaticPageContent(page: string): string | null {
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

	for (const [selector, attribute] of [
		['a[href^="/"]', 'href'],
		['img[src^="/"]', 'src']
	]) {
		for (const el of content.querySelectorAll(selector)) {
			el.setAttribute(
				attribute,
				new URL(el.getAttribute(attribute) ?? '', STATIC_PAGES_BASE_URL).href
			);
		}
	}
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
	const page = await fetch(`${STATIC_PAGES_BASE_URL}/${id}?content_only=1`, {
		signal: AbortSignal.timeout(5000)
	})
		.then((response) => (response.ok ? response.text() : null))
		.catch(() => null);
	return page === null ? null : extractStaticPageContent(page);
}
