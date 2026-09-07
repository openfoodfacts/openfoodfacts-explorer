<script lang="ts">
	import JsBarcode from 'jsbarcode';
	import OpenFoodFacts from '@openfoodfacts/openfoodfacts-nodejs';

	import { Gs1Barcode } from '$lib/barcodes/gs1';
	import { getFlagEmoji, getGs1Allocation } from '$lib/barcodes/gs1-prefixes';
	import { createPricesApi } from '$lib/api/prices';
	import { OPEN_PRICES_PRODUCT_URL } from '$lib/const';
	import { _ } from '$lib/i18n';
	import { tick } from 'svelte';
	import Card from './Card.svelte';

	let { code }: { code: string } = $props();

	type AvailabilityStatus = 'loading' | 'found' | 'not-found' | 'error';
	type AvailabilityKey = 'open_prices' | 'pro_off';

	const SEARCH_ENTRIES = [
		{
			name: 'Google',
			url: (value: string) => `https://www.google.com/search?q=${encodeURIComponent(value)}`
		},
		{
			name: 'DuckDuckGo',
			url: (value: string) => `https://duckduckgo.com/?q=${encodeURIComponent(value)}`
		}
	];

	const OFF_ENTRIES: Array<{
		key: AvailabilityKey;
		name: string;
		url: (value: string) => string;
		fetchData: (value: string) => Promise<unknown>;
	}> = [
		{
			key: 'open_prices',
			name: 'Open Prices',
			url: (value) => OPEN_PRICES_PRODUCT_URL(value),
			fetchData: async (value) => {
				const api = createPricesApi(fetch);
				const { data, error } = await api.getPrices({ product_code: value, size: 1 });
				if (error) throw new Error('API error: ' + error);
				if (!data) throw new Error('No data received');
				if (data.items.length === 0) throw new Error('Not found');
				return data;
			}
		},
		{
			key: 'pro_off',
			name: 'Pro OFF',
			url: (value) => `https://pro.openfoodfacts.dev/products/${encodeURIComponent(value)}`,
			fetchData: async (value) => {
				const proClient = new OpenFoodFacts(fetch, {
					host: 'https://pro.openfoodfacts.org'
				});
				const { data, error } = await proClient.getProductV3(value);
				if (error) throw new Error('API error: ' + error);
				if (!data) throw new Error('No data received');
				if (data.status === 'failure') throw new Error('Not found');
				return data;
			}
		}
	];

	let barcodeElement = $state<SVGSVGElement>();
	let powerUserSection = $state<HTMLElement>();
	let barcodeRenderError = $state(false);
	let showPowerUserTools = $state(false);
	let availabilityStatus = $state<Partial<Record<AvailabilityKey, AvailabilityStatus>>>({});

	let parsedBarcode = $derived(Gs1Barcode.parse(code));
	let allocation = $derived(getGs1Allocation(code));
	let checksRunning = $derived(
		Object.values(availabilityStatus).some((status) => status === 'loading')
	);

	$effect(() => {
		if (!code || barcodeElement == null) return;

		barcodeRenderError = false;
		try {
			const format =
				parsedBarcode?.variant === 'GTIN-8'
					? 'ean8'
					: parsedBarcode?.variant === 'GTIN-12'
						? 'upc'
						: 'ean13';
			JsBarcode(barcodeElement, code, { format });
		} catch (error) {
			barcodeRenderError = true;
			console.error('Failed to generate barcode:', error);
		}
	});

	function startAvailabilityChecks() {
		availabilityStatus = {};

		for (const entry of OFF_ENTRIES) {
			availabilityStatus = { ...availabilityStatus, [entry.key]: 'loading' };
			entry.fetchData(code).then(
				() => {
					availabilityStatus = { ...availabilityStatus, [entry.key]: 'found' };
				},
				(error: unknown) => {
					const status =
						error instanceof Error && error.message === 'Not found' ? 'not-found' : 'error';
					availabilityStatus = { ...availabilityStatus, [entry.key]: status };
				}
			);
		}
	}

	function availabilityLabel(status: AvailabilityStatus | undefined) {
		if (status === 'found') return $_('product.barcode.found', { default: 'Found' });
		if (status === 'not-found') return $_('product.barcode.not_found', { default: 'Not found' });
		if (status === 'error') return $_('product.barcode.check_error', { default: 'Error' });
		if (status == null) return $_('product.barcode.not_checked', { default: 'Not checked' });
		return $_('product.barcode.loading', { default: 'Checking…' });
	}

	function availabilityClass(status: AvailabilityStatus | undefined) {
		if (status === 'found') return 'badge-success';
		if (status === 'error') return 'badge-error';
		if (status === 'loading') return 'badge-info';
		return 'badge-ghost';
	}

	export async function togglePowerUserDetails() {
		showPowerUserTools = !showPowerUserTools;
		if (showPowerUserTools) {
			await tick();
			powerUserSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
		}
	}
</script>

<Card>
	<div class="space-y-6">
		<header class="space-y-4">
			<h1 class="text-2xl font-bold md:text-3xl">
				{$_('product.barcode.title', { default: 'Barcode information' })}
			</h1>

			<div class="flex flex-wrap items-end justify-between gap-3">
				<div class="min-w-0">
					<p class="text-sm font-medium text-base-content/70">
						{$_('product.barcode.code_label', { default: 'Barcode' })}
					</p>
					<p class="font-mono text-xl font-semibold tracking-wider break-all sm:text-2xl">
						{code}
					</p>
				</div>

				{#if parsedBarcode}
					<span class="badge badge-success">
						{$_('product.barcode.valid', {
							default: 'Valid {variant}',
							values: { variant: parsedBarcode.variant }
						})}
					</span>
				{:else}
					<span class="badge badge-error"
						>{$_('product.barcode.invalid', { default: 'Invalid' })}</span
					>
				{/if}
			</div>

			<div class="flex items-center gap-3">
				{#if allocation.code}
					<span class="text-2xl" aria-hidden="true">{getFlagEmoji(allocation.code)}</span>
				{/if}
				<p>
					<span class="text-base-content/70">
						{$_('product.gs1.prefix_label', { default: 'Registered through:' })}
					</span>
					<strong>{allocation.name}</strong>
				</p>
			</div>

			<p class="max-w-3xl text-sm text-base-content/70">
				{$_('product.gs1.prefix_note', {
					default:
						'The location shown here refers to the GS1 registration, not the product’s origin.'
				})}
				<span aria-hidden="true"> · </span>
				<a
					class="link link-hover"
					href="https://www.gs1.org/standards/id-keys/company-prefix"
					target="_blank"
					rel="noopener noreferrer"
				>
					{$_('product.gs1.source_link', { default: 'GS1 prefix standards' })}
				</a>
			</p>

			<div class="flex flex-wrap gap-2 pt-1">
				<a
					class="btn btn-secondary btn-sm"
					href="https://www.gs1.org/services/verified-by-gs1/results?gtin={encodeURIComponent(
						code
					)}"
					target="_blank"
					rel="noopener noreferrer"
				>
					{$_('product.gs1.verified_link', { default: 'View this barcode on GS1' })}
					<span aria-hidden="true">↗</span>
				</a>

				{#if code.length >= 3}
					<a
						class="btn btn-soft btn-sm"
						href={`/search?barcode_prefix=${encodeURIComponent(code.slice(0, 3))}`}
					>
						{$_('product.barcode.similar_products', { default: 'Similar products' })}
					</a>
				{/if}

				<button
					type="button"
					class="btn btn-ghost btn-sm"
					aria-expanded={showPowerUserTools}
					aria-controls="barcode-advanced-tools"
					onclick={() => togglePowerUserDetails()}
				>
					{#if showPowerUserTools}
						{$_('product.barcode.hide_power_user', { default: 'Hide advanced tools' })}
					{:else}
						{$_('product.barcode.show_power_user', { default: 'Show advanced tools' })}
					{/if}
					<span aria-hidden="true">{showPowerUserTools ? '▴' : '▾'}</span>
				</button>
			</div>
		</header>

		{#if showPowerUserTools}
			<section
				id="barcode-advanced-tools"
				bind:this={powerUserSection}
				class="border-t border-base-300 pt-5"
			>
				<h2 class="mb-5 text-lg font-semibold">
					{$_('product.barcode.power_user_title', { default: 'Power-user tools' })}
				</h2>

				<div class="grid gap-6 lg:grid-cols-2">
					<section>
						<h3 class="mb-3 font-semibold">
							{$_('product.barcode.render_title', { default: 'Rendered barcode' })}
						</h3>
						{#if barcodeRenderError}
							<p class="text-sm text-base-content/70">
								{$_('product.barcode.render_unavailable', {
									default: 'This code cannot be rendered as a standard retail barcode.'
								})}
							</p>
						{:else}
							<div class="w-fit max-w-full overflow-x-auto rounded-lg bg-base-100 p-3">
								<svg
									bind:this={barcodeElement}
									aria-label={$_('product.barcode.render_title', { default: 'Rendered barcode' })}
								></svg>
							</div>
						{/if}
					</section>

					<section class="lg:border-s lg:border-base-300 lg:ps-6">
						<h3 class="mb-3 font-semibold">
							{$_('product.barcode.search_title', { default: 'Search' })}
						</h3>
						<div class="flex flex-wrap gap-x-5 gap-y-2">
							{#each SEARCH_ENTRIES as entry (entry.name)}
								<a
									class="link link-hover"
									href={entry.url(code)}
									target="_blank"
									rel="noopener noreferrer"
								>
									{entry.name}
									<span aria-hidden="true">↗</span>
								</a>
							{/each}
						</div>
					</section>

					<section class="border-t border-base-300 pt-5 lg:col-span-2">
						<div class="flex flex-wrap items-center justify-between gap-3">
							<h3 class="font-semibold">
								{$_('product.barcode.availability_title', { default: 'Product availability' })}
							</h3>
							<button
								class="btn btn-soft btn-sm"
								type="button"
								disabled={checksRunning}
								onclick={startAvailabilityChecks}
							>
								{$_('product.barcode.run_checks', { default: 'Run availability checks' })}
							</button>
						</div>

						<div class="mt-3 divide-y divide-base-300 border-y border-base-300">
							{#each OFF_ENTRIES as entry (entry.key)}
								<div class="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 py-3">
									<span class="font-medium">{entry.name}</span>
									<span
										class={[
											'badge gap-1 badge-sm',
											availabilityClass(availabilityStatus[entry.key])
										]}
									>
										{#if availabilityStatus[entry.key] === 'loading'}
											<span class="loading loading-xs loading-spinner" aria-hidden="true"></span>
										{/if}
										{availabilityLabel(availabilityStatus[entry.key])}
									</span>
									<a
										class="btn btn-ghost btn-xs"
										href={entry.url(code)}
										target="_blank"
										rel="noopener noreferrer"
									>
										{$_('product.barcode.open', { default: 'Open' })}
										<span aria-hidden="true">↗</span>
									</a>
								</div>
							{/each}
						</div>
					</section>
				</div>
			</section>
		{/if}
	</div>
</Card>
