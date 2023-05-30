<script lang="ts">
	import type { KnowledgeTextElement } from '$lib/product';

	export let panel: KnowledgeTextElement;
	$: text = panel.text_element;
</script>

{@html text.html}
