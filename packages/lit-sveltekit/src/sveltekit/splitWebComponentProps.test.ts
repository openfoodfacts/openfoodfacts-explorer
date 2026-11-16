import { afterEach, describe, expect, it, vi } from 'vitest';
import { splitWebComponentProps } from './splitWebComponentProps.js';

afterEach(() => vi.unstubAllGlobals());

function registerComponent() {
	const elementProperties = new Map([
		['product', {}],
		['showMatchTag', {}],
		['title', {}],
		['__proto__', {}],
		['constructor', {}],
		['prototype', {}]
	]);
	vi.stubGlobal('customElements', {
		get: (tag: string) => (tag === 'product-card' ? { elementProperties } : undefined)
	});
}

describe('splitWebComponentProps', () => {
	it('only passes declared properties while preserving host attributes and events', () => {
		registerComponent();
		const product = { product_name: 'Example' };
		const onclick = vi.fn();
		expect(
			splitWebComponentProps('product-card', {
				product,
				showMatchTag: false,
				title: 'Component title',
				class: 'card',
				'aria-label': 'Product',
				'data-id': '123',
				onclick,
				innerHTML: '<script>unsafe</script>',
				connectedCallback: vi.fn(),
				unknown: 'ignored'
			})
		).toEqual({
			properties: { product, showMatchTag: false, title: 'Component title' },
			attributes: { class: 'card', 'aria-label': 'Product', 'data-id': '123', onclick }
		});
	});

	it('rejects prototype-related names even when declared by the component', () => {
		registerComponent();
		const props = JSON.parse(
			'{"__proto__":{"polluted":true},"constructor":"unsafe","prototype":"unsafe"}'
		);
		expect(splitWebComponentProps('product-card', props)).toEqual({
			properties: {},
			attributes: {}
		});
	});

	it('defers properties until the component is registered', () => {
		vi.stubGlobal('customElements', undefined);
		const props = { product: { product_name: 'Example' }, class: 'card' };
		expect(splitWebComponentProps('product-card', props)).toEqual({
			properties: {},
			attributes: { class: 'card' }
		});

		registerComponent();
		expect(splitWebComponentProps('product-card', props)).toEqual({
			properties: { product: props.product },
			attributes: { class: 'card' }
		});
		expect(splitWebComponentProps('unknown-element', props).properties).toEqual({});
	});
});
