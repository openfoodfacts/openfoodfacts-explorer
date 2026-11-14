<script lang="ts">
	import type { HTMLImgAttributes } from 'svelte/elements';
	import { getImageSrcset, type ImageSizes } from './imageSizes.js';

	/**
	 * Responsive Open Food Facts product photo: uses image metadata for `srcset`.
	 * Lazy by default; pass `loading="eager"` (and
	 * `fetchpriority="high"`) for above-the-fold images.
	 *
	 * Variant URLs and widths must come from image metadata.
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

	let srcset = $derived(getImageSrcset(imageSizes));
</script>

<img {src} {srcset} {sizes} {loading} {decoding} {...rest} />
