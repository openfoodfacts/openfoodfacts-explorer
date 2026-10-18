<script lang="ts">
	import { sanitize } from 'isomorphic-dompurify';

	type Props = { dirty: string };
	let { dirty }: Props = $props();

	let sanitizedHtml = $derived(
		sanitize(dirty, { USE_PROFILES: { html: true }, RETURN_TRUSTED_TYPE: true })
	);
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html sanitizedHtml}
