<script lang="ts">
	import { KP_ATTRIBUTE_IMG } from '$lib/const';

	type Props = { grade: string; lang?: string };
	let { grade, lang = 'en' }: Props = $props();

	let srcMap: Record<string, string> = $derived({
		a: KP_ATTRIBUTE_IMG('nutriscore-a-new-' + lang + '.svg'),
		b: KP_ATTRIBUTE_IMG('nutriscore-b-new-' + lang + '.svg'),
		c: KP_ATTRIBUTE_IMG('nutriscore-c-new-' + lang + '.svg'),
		d: KP_ATTRIBUTE_IMG('nutriscore-d-new-' + lang + '.svg'),
		e: KP_ATTRIBUTE_IMG('nutriscore-e-new-' + lang + '.svg')
	});

	let srcUnknown = $derived(KP_ATTRIBUTE_IMG('nutriscore-unknown-new-' + lang + '.svg'));

	let src = $derived(srcMap[grade.toLowerCase()] ?? srcUnknown);
</script>

<a href="#nutriscore">
	<img alt="Nutri-Score" {src} class="transition-all duration-75 hover:brightness-90" />
</a>
