<script lang="ts">
	import { KP_ATTRIBUTE_IMG, STATIC_HOST } from '$lib/const';

	const SRC_MAP: Record<string, string> = {
		1: KP_ATTRIBUTE_IMG('nova-group-1.svg'),
		2: KP_ATTRIBUTE_IMG('nova-group-2.svg'),
		3: KP_ATTRIBUTE_IMG('nova-group-3.svg'),
		4: KP_ATTRIBUTE_IMG('nova-group-4.svg')
	};

	const SRC_UNKNOWN = KP_ATTRIBUTE_IMG('nova-group-unknown.svg');

	let { grade }: { grade: number } = $props();
	let src = $derived(SRC_MAP[grade] ?? SRC_UNKNOWN);
</script>

<a href="#nova">
	<img alt="Nova Score" {src} class="transition-all duration-75 hover:brightness-90" />
</a>
