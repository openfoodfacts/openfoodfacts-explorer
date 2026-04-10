<script lang="ts">
	import { _ } from '$lib/i18n';
	export let barcode: string;

	// URI Safety: Barcode sanitization
	$: sanitizedBarcode = encodeURIComponent(barcode);

	$: searchLinks = [
		{ name: 'Google', url: `https://www.google.com/search?q=${sanitizedBarcode}` },
		{ name: 'DuckDuckGo', url: `https://duckduckgo.com/?q=${sanitizedBarcode}` },
		{
			name: 'Open Beauty Facts',
			url: `https://world.openbeautyfacts.org/product/${sanitizedBarcode}`
		}
	];

	let isOpen = false;
</script>

<div class="relative inline-block text-left">
	<button
		on:click={() => (isOpen = !isOpen)}
		class="rounded p-1 hover:bg-gray-100"
		aria-label="Search on external sites"
	>
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
