<script lang="ts">
	type Props = {
		src: string;
		alt?: string;
		class?: string;
	};
	let { src, alt, class: className }: Props = $props();
</script>

<div class={['relative overflow-hidden', className]}>
	<div class="absolute inset-0 overflow-hidden">
		<img {src} {alt} class="h-full w-full scale-150 object-cover blur-sm" aria-hidden="true" />
	</div>

	<div class="relative h-full w-full">
		<img {src} {alt} class="h-full w-full object-contain" />
	</div>
</div>
