<script lang="ts">
	import type { KnowledgeTextElement } from '$lib/product';

	export let element: KnowledgeTextElement;
</script>

{#if element.text_element.type === 'warning'}
	<span class="badge badge-warning">Warning</span>
{:else if element.text_element.type === 'notes'}
	<span class="badge badge-info">Notes</span>
{:else if element.text_element.type === 'summary'}
	<span class="badge">Summary</span>
{/if}

<div class="prose">
	{@html element.text_element.html}
</div>

{#if element.text_element.source_url}
	<a class="link" href={element.text_element.source_url}>
		{element.text_element.source_text} ({element.text_element.source_language})
	</a>
{/if}
