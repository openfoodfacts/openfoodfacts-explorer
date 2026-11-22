<script lang="ts">
	import OffImage from './OffImage.svelte';
	import type { ImageSizes } from './imageSizes.js';

	let {
		src,
		imageSizes,
		sizes,
		loading = 'lazy'
	}: {
		src: string;
		imageSizes?: ImageSizes;
		sizes: string;
		loading?: 'lazy' | 'eager';
	} = $props();
</script>

<OffImage
	{src}
	{imageSizes}
	{sizes}
	{loading}
	alt=""
	class="absolute inset-0 size-full scale-150 object-cover opacity-40 blur-lg"
	aria-hidden="true"
/>
