<script lang="ts">
	import StaticPageIframe from '#lib/ui/StaticPageIframe.svelte';
	import HtmlPurify from '#lib/ui/HtmlPurify.svelte';
	import { STATIC_PAGES_BASE_URL } from '#lib/api/staticPages.js';
	import { page } from '$app/state';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	let iframeUrl = $derived(`${STATIC_PAGES_BASE_URL}/${page.params.id}?content_only=1`);
</script>

{#if data.content}
	<article
		class="mx-auto prose max-w-4xl px-4 py-4 sm:py-8 dark:prose-invert prose-table:block prose-table:overflow-x-auto"
	>
		<HtmlPurify dirty={data.content} />
	</article>
{:else}
	{#key iframeUrl}
		<StaticPageIframe src={iframeUrl} />
	{/key}
{/if}

<style>
	/* Foundation grid classes from the main site's markup */
	article :global(ul[class*='block-grid']) {
		display: grid;
		gap: 1.5rem;
		padding: 0;
		list-style: none;
	}

	article :global(td > p:first-child) {
		margin-top: 0;
	}
	article :global(td > p:last-child) {
		margin-bottom: 0;
	}

	@media (min-width: 40em) {
		article :global(.row) {
			display: flex;
			gap: 1.5rem;
		}
		article :global(.row > *) {
			flex: 1;
			min-width: 0;
		}
		article :global(.medium-block-grid-2) {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 64em) {
		article:has(:global(ul[class*='block-grid'])) {
			max-width: 72rem;
		}
		article :global(.large-block-grid-3) {
			grid-template-columns: repeat(3, 1fr);
		}
		article :global(.large-block-grid-4) {
			grid-template-columns: repeat(4, 1fr);
		}
		article :global(.row > .large-4) {
			flex: 4;
		}
		article :global(.row > .large-8) {
			flex: 8;
		}
		article :global(.row > .medium-3 .btn) {
			padding-inline: 0.5rem;
			font-size: 0.6875rem;
		}
	}
</style>
