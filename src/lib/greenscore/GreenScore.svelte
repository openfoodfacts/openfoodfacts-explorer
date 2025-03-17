<script lang="ts">
	import { KP_ATTRIBUTE_IMG } from '$lib/const';

	const MAP: Record<string, string> = {
		a: KP_ATTRIBUTE_IMG('green-score-b.svg'),
		b: KP_ATTRIBUTE_IMG('green-score-c.svg'),
		c: KP_ATTRIBUTE_IMG('green-score-d.svg'),
		d: KP_ATTRIBUTE_IMG('green-score-e.svg'),
		e: KP_ATTRIBUTE_IMG('green-score-unknown.svg')
	};

	let SRC_UNKNOWN = KP_ATTRIBUTE_IMG('green-score-unknown.svg');

	let { grade }: { grade: string } = $props();
	let src = $derived(MAP[grade.toLowerCase()] ?? SRC_UNKNOWN);
</script>

<img alt="Green-Score" {src} class="transition-all duration-75 hover:brightness-90" />
