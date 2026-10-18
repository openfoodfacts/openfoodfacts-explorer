// Scratch experiment for rendering the OFF Lit component bundle in Node.
// The bundle currently assumes browser globals at module evaluation time, so
// these shims only exist while the bundle is imported.
await import('@lit-labs/ssr/lib/install-global-dom-shim.js');

const previousMatchMedia = globalThis.matchMedia;
globalThis.window = globalThis;
document.documentElement ??= {};
globalThis.matchMedia ??= () => ({
	matches: false,
	addEventListener() {},
	removeEventListener() {}
});

const [{ render, LitElementRenderer }, { collectResult }, { html, unsafeStatic }] =
	await Promise.all([
		import('@lit-labs/ssr'),
		import('@lit-labs/ssr/lib/render-result.js'),
		import('lit/static-html.js')
	]);

LitElementRenderer.renderOptions.unshift((element) => {
	const encodedState = element.getAttribute('data-lit-ssr');
	if (!encodedState) return undefined;

	const { properties, attributes } = JSON.parse(decodeURIComponent(encodedState));
	element.removeAttribute('data-lit-ssr');
	for (const [name, value] of Object.entries(attributes)) {
		if (value == null || value === false) continue;
		element.setAttribute(name, value === true ? '' : String(value));
	}
	Object.assign(element, properties);
	return undefined;
});

await import('@openfoodfacts/openfoodfacts-webcomponents');

delete globalThis.window;
if (previousMatchMedia === undefined) delete globalThis.matchMedia;

const tagName = 'product-card';
const state = encodeURIComponent(
	JSON.stringify({
		properties: {
			product: {
				code: '123456789',
				product_name: 'Example product',
				brands: 'Example brand',
				quantity: '500 g',
				image_front_small_url: '',
				product_type: 'food',
				nutriscore_grade: 'a',
				nova_group: 1,
				greenscore_grade: 'a'
			},
			personalScore: { score: 98, matchStatus: 'very_good_match' },
			showMatchTag: true,
			navigating: { to: null }
		},
		attributes: {
			class: 'block h-44 w-full',
			'aria-label': 'Example product card',
			role: 'button',
			tabindex: 0
		}
	})
);

const staticTagName = unsafeStatic(tagName);
const result = render(html`<${staticTagName} data-lit-ssr=${state}></${staticTagName}>`);
const markup = await collectResult(result);
console.log(
	JSON.stringify({
		bytes: Buffer.byteLength(markup),
		containsDeclarativeShadowRoot: markup.includes('shadowrootmode="open"'),
		containsProductName: markup.includes('Example product'),
		containsMatchTag: markup.includes('Very Good Match 98%'),
		containsSsrMarker: markup.includes('data-lit-ssr')
	})
);
