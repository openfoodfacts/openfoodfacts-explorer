<script lang="ts">
	import JsBarcode from 'jsbarcode';
	import Card from './Card.svelte';
	import { createPricesApi } from '$lib/api/prices';

	let { code }: { code: string } = $props();

	let openPricesStatus: number | null = $state(null);
	let proOffStatus: number | null = $state(null);

	$effect(() => {
		JsBarcode('#barcode', code, { format: 'ean13' });
		createPricesApi(window.fetch)
			.getPrices({ product_code: code, size: 1 })
			.then((r) => {
				openPricesStatus = r.data && r.data.items && r.data.items.length > 0 ? 200 : 404;
			})
			.catch(() => (openPricesStatus = 0));
		fetch(`https://pro.openfoodfacts.dev/products/${code}`)
			.then((r) => (proOffStatus = r.status))
			.catch(() => (proOffStatus = 0));
	});
</script>

<Card>
	<h1 class="card-title my-4 grow text-2xl font-bold md:text-4xl">Barcode Information</h1>
	<div class="card-body flex flex-row-reverse">
		<svg id="barcode" class="mb-2 block"></svg>

		<div class="grow">
			<label class="input w-full">
				<span class="label">Barcode</span>
				<input type="text" readonly value={code} />
			</label>

			<ul class="list mt-4 list-inside list-disc">
				<li>
					<a
						class="text-xs text-blue-500 hover:underline"
						href={`https://www.google.com/search?q=${code}`}
						target="_blank"
						rel="noopener"
						title="Search on Google"
					>
						Google
					</a>
				</li>
				<li>
					<a
						class="text-xs text-blue-500 hover:underline"
						href={`https://duckduckgo.com/?q=${code}`}
						target="_blank"
						rel="noopener"
						title="Search on DuckDuckGo"
					>
						DuckDuckGo
					</a>
				</li>
				<li>
					<a
						class="text-xs text-green-600 hover:underline"
						href={`https://prices.openfoodfacts.org/product/${code}`}
						target="_blank"
						rel="noopener"
						title="Open Prices"
					>
						Open Prices {openPricesStatus === null
							? '…'
							: openPricesStatus === 200
								? ''
								: ' (Not found)'}
					</a>
				</li>
				<li>
					<a
						class="text-xs text-green-600 hover:underline"
						href={`https://pro.openfoodfacts.dev/products/${code}`}
						target="_blank"
						rel="noopener"
						title="Pro OFF"
					>
						Pro OFF{proOffStatus === null ? '…' : proOffStatus === 200 ? '' : ' (Not found)'}
					</a>
				</li>
				{#if code && code.length >= 3}
					<li>
						<a
							class="text-xs text-purple-500 hover:underline"
							href={`/search?barcode_prefix=${code.slice(0, 3)}`}
							title="Find similar products"
						>
							Similar prefix
						</a>
					</li>
				{/if}
			</ul>
		</div>
	</div>
</Card>
