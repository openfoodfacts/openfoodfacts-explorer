<script lang="ts">
	import JsBarcode from 'jsbarcode';
	import OpenFoodFacts from '@openfoodfacts/openfoodfacts-nodejs';

	import { createPricesApi } from '$lib/api/prices';

	import Card from './Card.svelte';

	let { code }: { code: string } = $props();

	const SEARCH_ENTRIES = [
		{
			name: 'Google',
			url: (code: string) => `https://www.google.com/search?q=${code}`
		},
		{
			name: 'DuckDuckGo',
			url: (code: string) => `https://duckduckgo.com/?q=${code}`
		}
	];

	const OFF_ENTRIES = [
		{
			name: 'Open Prices',
			url: (code: string) => `https://prices.openfoodfacts.org/product/${code}`,
			fetchData: async (code: string) => {
				const api = createPricesApi(fetch);

				const { data, error } = await api.getPrices({ product_code: code, size: 1 });
				if (error) throw new Error('API error: ' + error);
				else if (!data) throw new Error('No data received');
				else if (data.items.length === 0) throw new Error('Not found');

				return data;
			}
		},
		{
			name: 'Pro OFF',
			url: (code: string) => `https://pro.openfoodfacts.dev/products/${code}`,
			fetchData: async (code: string) => {
				const proClient = new OpenFoodFacts(fetch, {
					host: 'https://pro.openfoodfacts.org'
				});

				const { data, error } = await proClient.getProductV3(code);
				if (error) throw new Error('API error: ' + error);
				else if (!data) throw new Error('No data received');
				else if (data.status == 'failure') throw new Error('Not found');

				return data;
			}
		}
	];

	let barcodeElement: SVGSVGElement;

	$effect(() => {
		if (!code || code.length === 0) {
			return;
		} else if (barcodeElement == null) {
			console.warn('Barcode element not found');
			return;
		}
		try {
			JsBarcode(barcodeElement, code, { format: 'ean13' });
		} catch (e) {
			console.error('Failed to generate barcode:', e);
		}
	});
</script>

<Card>
	<h1 class="mb-4 text-2xl font-bold md:text-4xl">Barcode Information</h1>
	<div class="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
		<div class="grow">
			<label class="input w-full">
				<span class="label">Barcode</span>
				<input type="text" readonly value={code} class="font-mono tracking-widest" />
			</label>

			<div class="mt-4 space-y-3">
				<div>
					<p class="text-base-content/50 mb-1.5 text-xs font-semibold tracking-wide uppercase">
						Search
					</p>
					<div class="flex flex-wrap gap-2">
						{#each SEARCH_ENTRIES as entry (entry.name)}
							<a
								class="btn btn-sm btn-outline"
								href={entry.url(code)}
								target="_blank"
								rel="noopener noreferrer"
							>
								{entry.name}
							</a>
						{/each}
					</div>
				</div>

				<div>
					<p class="text-base-content/50 mb-1.5 text-xs font-semibold tracking-wide uppercase">
						Product availability
					</p>
					<div class="flex flex-wrap gap-2">
						{#each OFF_ENTRIES as entry (entry.name)}
							<a
								class="btn btn-sm btn-outline"
								href={entry.url(code)}
								target="_blank"
								rel="noopener noreferrer"
							>
								{entry.name}
								{#await entry.fetchData(code)}
									<span class="loading loading-xs loading-spinner opacity-50"></span>
								{:then}
									<span class="bg-success size-2 rounded-full" title="Found"></span>
								{:catch e}
									<span
										class="size-2 rounded-full {e.message === 'Not found'
											? 'bg-base-content/30'
											: 'bg-error'}"
										title={e.message === 'Not found' ? 'Not found' : 'Error'}
									></span>
								{/await}
							</a>
						{/each}

						{#if code && code.length >= 3}
							<a
								class="btn btn-sm btn-outline btn-secondary"
								href={`/search?barcode_prefix=${code.slice(0, 3)}`}
								title="Find similar products"
							>
								Similar prefix
							</a>
						{/if}
					</div>
				</div>
			</div>
		</div>

		<div class="shrink-0 self-start rounded-lg bg-white p-3 shadow-sm">
			<svg bind:this={barcodeElement}></svg>
		</div>
	</div>
</Card>
