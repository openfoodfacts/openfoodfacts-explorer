<script lang="ts">
	import type { HTMLImgAttributes } from 'svelte/elements';

	/**
	 * Responsive Open Food Facts product photo: serves the `.100` and `.400`
	 * variants through `srcset`. Lazy by default; pass `loading="eager"` (and
	 * `fetchpriority="high"`) for above-the-fold images.
	 *
	 * Only for product photos served by `images.openfoodfacts.org/net`
	 * (`…/<id>.{100,400}.jpg`), not the `static.` host (SVG icons, logos).
	 */
	type Props = Omit<HTMLImgAttributes, 'srcset'> & {
		src: string;
		alt: string;
	};

	let { src, sizes = '100vw', loading = 'lazy', decoding = 'async', ...rest }: Props = $props();

	// Only .100 and .400 exist for every image: raw uploads (<n>.jpg) have no .200 or .full.
	const variant = (size: 100 | 400) => src.replace(/\.(?:100|200|400|full)\.jpg/, `.${size}.jpg`);
</script>

<img
	src={variant(400)}
	srcset="{variant(100)} 100w, {variant(400)} 400w"
	{sizes}
	{loading}
	{decoding}
	{...rest}
/>
