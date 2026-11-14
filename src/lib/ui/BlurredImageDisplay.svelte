<script lang="ts">
	import OffImage from './OffImage.svelte';
	import type { ImageSizes } from './imageSizes.js';

	type Props = {
		src: string;
		imageSizes?: ImageSizes;
		alt?: string;
		class?: string;
	};
	let { src, imageSizes, alt, class: className }: Props = $props();
</script>

<div class={['relative overflow-hidden', className]}>
	<div class="absolute inset-0 overflow-hidden">
		<OffImage
			{src}
			{imageSizes}
			alt={alt ?? ''}
			sizes="64px"
			class="h-full w-full scale-150 object-cover blur-sm"
			aria-hidden="true"
		/>
	</div>

	<div class="relative h-full w-full">
		<OffImage
			{src}
			{imageSizes}
			alt={alt ?? ''}
			sizes="160px"
			class="h-full w-full object-contain"
		/>
	</div>
</div>
