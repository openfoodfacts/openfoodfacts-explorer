<script lang="ts">
	import { _ } from '$lib/i18n';

	// Svelte 5 syntax for props
	let { barcode } = $props();

	// Svelte 5 syntax for reactive variables
	let sanitizedBarcode = $derived(encodeURIComponent(barcode));

	let searchLinks = $derived([
		{ name: 'Google', url: `https://www.google.com/search?q=${sanitizedBarcode}` },
		{ name: 'DuckDuckGo', url: `https://duckduckgo.com/?q=${sanitizedBarcode}` },
		{
			name: 'Open Beauty Facts',
			url: `https://world.openbeautyfacts.org/product/${sanitizedBarcode}`
		},
		{
			name: 'Similar prefix',
			url: `/search?q=${sanitizedBarcode.substring(0, 3)}&barcode_prefix=${sanitizedBarcode.substring(0, 3)}`
		}
	]);

	let isOpen = $state(false);
</script>

<div class="relative inline-block text-left">
	<button
		onclick={() => (isOpen = !isOpen)}
		class="btn btn-sm btn-outline gap-2"
		aria-label="Search on external sites"
	>
		External Search ▼
	</button>
	{#if isOpen}
		<div class="absolute z-10 mt-1 w-48 rounded border bg-white p-2 shadow-lg">
			{#each searchLinks as link (link.name)}
				<a
					href={link.url}
					target="_blank"
					rel="noopener noreferrer"
					class="block rounded p-1 hover:bg-gray-50 hover:text-blue-500"
				>
					{link.name}
				</a>
			{/each}
		</div>
	{/if}
</div>
