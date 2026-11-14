<script lang="ts">
	import type { HTMLImgAttributes } from 'svelte/elements';
	import type { ImageSizes } from './imageSizes.js';

	/**
	 * Responsive Open Food Facts product photo: uses image metadata for `srcset`.
	 * Lazy by default; pass `loading="eager"` (and
	 * `fetchpriority="high"`) for above-the-fold images.
	 *
	 * Only for product photos served by `images.openfoodfacts.org/net`
	 * (`…/<id>.{100,400}.jpg` or selected image variants).
	 */
	type Props = Omit<HTMLImgAttributes, 'srcset'> & {
		src: string;
		alt: string;
		imageSizes?: ImageSizes;
	};

	let {
		src,
		imageSizes,
		sizes = '100vw',
		loading = 'lazy',
		decoding = 'async',
		...rest
	}: Props = $props();

	let srcset = $derived.by(() => {
		if (!/\.(?:100|200|400|full)\.jpg(?:[?#]|$)/.test(src)) return undefined;
		const widths: number[] = [];
		const variants = ([100, 400] as const).flatMap((size) => {
			const width = imageSizes?.[size]?.w;
			if (!width || !Number.isInteger(width) || width < 1 || widths.includes(width)) return [];
			widths.push(width);
			return [`${src.replace(/\.(?:100|200|400|full)\.jpg(?=[?#]|$)/, `.${size}.jpg`)} ${width}w`];
		});
		return variants.length ? variants.join(', ') : undefined;
	});
</script>

<img {src} {srcset} {sizes} {loading} {decoding} {...rest} />
