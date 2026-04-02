<script module lang="ts">
	import DOMPurify from 'isomorphic-dompurify';

	// Add a hook to make all links open a new window
	DOMPurify.addHook('afterSanitizeAttributes', function (node) {
		// set all elements owning target to target=_blank
		if ('target' in node) {
			node.setAttribute('target', '_blank');
			node.setAttribute('rel', 'noopener noreferrer');
		}
		// set non-HTML/MathML links to xlink:show=new
		if (
			!node.hasAttribute('target') &&
			(node.hasAttribute('xlink:href') || node.hasAttribute('href'))
		) {
			node.setAttribute('xlink:show', 'new');
		}
	});
</script>

<script lang="ts">
	import { sanitize } from 'isomorphic-dompurify';

	type Props = {
		dirty: string;
		config?: Parameters<typeof sanitize>[1];
	};
	let { dirty, config = { USE_PROFILES: { html: true } } }: Props = $props();

	let sanitizedHtml = $derived(sanitize(dirty, config));
</script>

<!-- eslint-disable-next-line svelte/no-at-html-tags -->
{@html sanitizedHtml}
