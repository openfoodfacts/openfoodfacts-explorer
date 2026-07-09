<script lang="ts">
	import { untrack } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { isConfigured as isPriceConfigured } from '$lib/api/prices';
	import { isConfigured as isFolksonomyConfigured } from '$lib/api/folksonomy';
	import { _ } from '$lib/i18n';
	import { preferences } from '$lib/settings';

	import KnowledgePanelsComp from '$lib/knowledgepanels/Panels.svelte';
	import Card from '$lib/ui/Card.svelte';
	import Metadata from '$lib/Metadata.svelte';

	import ProductAttributes from './ProductAttributes.svelte';
	import Folksonomy from './Folksonomy.svelte';
	import DataSources from './DataSources.svelte';

	import Gs1Country from './GS1Country.svelte';
	import ProductHeader from './ProductHeader.svelte';
	import BarcodeInfo from '$lib/ui/BarcodeInfo.svelte';

	import type { PageProps } from './$types';
	import Prices from './Prices.svelte';
	import { userInfo } from '$lib/stores/user';
	import { userAuthTokens } from '$lib/stores/auth';
	import { getWebsiteCtx } from '$lib/stores/website';

	import Sidebar, { type SidebarSection } from '$lib/ui/Sidebar.svelte';
	import IconMdiInformation from '@iconify-svelte/mdi/information';
	import IconMdiNutrition from '@iconify-svelte/mdi/nutrition';
	import IconMdiLeaf from '@iconify-svelte/mdi/leaf';
	import IconMdiHeartPulse from '@iconify-svelte/mdi/heart-pulse';
	import IconMdiFlag from '@iconify-svelte/mdi/flag';
	import IconMdiHelpCircleOutline from '@iconify-svelte/mdi/help-circle-outline';
	import IconMdiFormatListBulleted from '@iconify-svelte/mdi/format-list-bulleted';
	import IconMdiTagMultiple from '@iconify-svelte/mdi/tag-multiple';
	import IconMdiBarcode from '@iconify-svelte/mdi/barcode';
	import IconMdiDatabase from '@iconify-svelte/mdi/database';
	import IconMdiLabel from '@iconify-svelte/mdi/label';
	import IconMdiWarning from '@iconify-svelte/mdi/warning';

	import { OpenFoodFacts, type Product } from '@openfoodfacts/openfoodfacts-nodejs';
	import type { KnowledgePanels } from '$lib/api/knowledgepanels';
	import NutritionCalculator from '$lib/ui/NutritionCalculator.svelte';
	import { onMount } from 'svelte';
	import { getShortcutCtx } from '$lib/stores/shortcuts';
	import type { ProductGroupedAttributes } from './types';
	import { personalizedSearch } from '$lib/stores/preferencesStore';
	import { PRODUCT_URL } from '$lib/const';
	import { resolve } from '$app/paths';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { trackOffEvent } from '$lib/analytics';
	import { browser } from '$app/environment';

	let { data }: PageProps = $props();
	let { state: productState } = $derived(data);

	type UiProduct = Product & {
		code: string;
		created_t: number;
		creator: string;
		last_modified_t: number;
		last_editor: string;

		knowledge_panels: KnowledgePanels;
		image_front_small_url?: string;
		image_front_url?: string;
		taxonomies?: string[];
	};

	// TODO: Remove the casts once the external types are fixed
	let product = $derived(
		productState.status === 'success' ? (productState.product as UiProduct) : ({} as UiProduct)
	);

	let websiteCtx = getWebsiteCtx();
	$effect(() => {
		// Update website context based on product type
		if (product.product_type) websiteCtx.flavor = product.product_type;
	});

	// Track product score presence (fire once per product page view)
	const trackedScores = new SvelteSet<string>();
	$effect(() => {
		// Depend only on pathname (navigation), not product data (invalidateAll)
		const path = page.url.pathname;
		untrack(() => {
			const p = product;
			if (p.code && !trackedScores.has(path)) {
				trackedScores.add(path);
				if (p.nutriscore_grade) {
					trackOffEvent('product', 'has_nutriscore', p.nutriscore_grade);
				}
				if (p.ecoscore_grade) {
					trackOffEvent('product', 'has_greenscore', p.ecoscore_grade);
				}
				if (p.nova_group) {
					trackOffEvent('product', 'has_nova', String(p.nova_group));
				}
			}
		});
	});

	let useWCFolksonomyEditor = $state(false);

	let showBarcode = $state(false);

	const activeSections = $derived.by(() => {
		const rawList: (SidebarSection | false | undefined | null)[] = [
			{
				id: 'overview',
				label: $_('product.sections.product', { default: 'Product' }),
				icon: IconMdiInformation
			},
			{
				id: 'attributes',
				label: $_('product.sections.attributes', { default: 'Attributes' }),
				icon: IconMdiNutrition
			},
			product.knowledge_panels?.health_card && {
				id: 'health_card',
				label: $_('product.sections.health', { default: 'Health' }),
				icon: IconMdiHeartPulse
			},
			product.knowledge_panels?.environment_card && {
				id: 'environment_card',
				label: $_('product.sections.environment', { default: 'Environment' }),
				icon: IconMdiLeaf
			},
			product.knowledge_panels?.report_problem_card && {
				id: 'report_problem_card',
				label: $_('product.sections.report_problem', { default: 'Report a Problem' }),
				icon: IconMdiFlag
			},
			product.knowledge_panels?.contribution_card && {
				id: 'contribution_card',
				label: $_('product.sections.contribution', { default: 'Contribution' }),
				icon: IconMdiHelpCircleOutline
			},
			product.knowledge_panels?.product_card && {
				id: 'product_card',
				label: $_('product.sections.product_information', { default: 'Product information' }),
				icon: IconMdiFormatListBulleted
			},
			isPriceConfigured() &&
				data.prices != null && {
					id: 'prices',
					label: $_('product.sections.prices', { default: 'Prices' }),
					icon: IconMdiTagMultiple
				},
			showBarcode &&
				product.code != null && {
					id: 'barcode-info',
					label: $_('product.sections.barcode_info', { default: 'Barcode information' }),
					icon: IconMdiBarcode
				},
			{
				id: 'data-sources',
				label: $_('product.sections.data_sources', { default: 'Data Sources' }),
				icon: IconMdiDatabase
			},
			isFolksonomyConfigured() && {
				id: 'folksonomy',
				label: $_('product.sections.folksonomy', { default: 'Folksonomy' }),
				icon: IconMdiLabel
			}
		];
		return rawList.filter((item): item is SidebarSection => !!item);
	});

	const shortcutCtx = getShortcutCtx();

	onMount(() => {
		sidebarHidden = !($preferences.productSidebarVisible ?? true);

		shortcutCtx.set('Shift+B', {
			description: $_('product.shortcuts.show_barcode'),
			action: () => (showBarcode = !showBarcode)
		});

		shortcutCtx.set('A', {
			description: $_('product.shortcuts.api_page'),
			action: () => {
				if (product.code) {
					window.open(PRODUCT_URL(product.code), '_blank');
				}
			}
		});

		shortcutCtx.set('E', {
			description: $_('product.shortcuts.edit_same_window'),
			action: () => {
				if (product.code) {
					goto(resolve('/products/[barcode]/edit', { barcode: product.code }));
				}
			}
		});

		shortcutCtx.set('Shift+E', {
			description: $_('product.shortcuts.edit_new_window'),
			action: () => {
				if (product.code) {
					window.open(resolve('/products/[barcode]/edit', { barcode: product.code }), '_blank');
				}
			}
		});

		return () => {
			shortcutCtx.delete('A');
			shortcutCtx.delete('E');
			shortcutCtx.delete('Shift+E');
			shortcutCtx.delete('Shift+B');
		};
	});

	async function getProductAttributes(code: string): Promise<ProductGroupedAttributes[]> {
		const offApi = new OpenFoodFacts(fetch);

		const searchParams: Record<string, unknown> = {
			fields: ['attribute_groups_en']
		};

		const SENT_ATTRIBUTES = ['attribute_unwanted_ingredients_tags'];

		for (const prefAttr of SENT_ATTRIBUTES) {
			const pref = $personalizedSearch.userPreferences.find((p) => p.attributeId === prefAttr);
			if (pref == null) {
				continue;
			}

			if (pref.type === 'attribute') {
				searchParams[pref.attributeId] = pref.value;
			} else if (pref.type === 'tags') {
				searchParams[pref.attributeId] = pref.value.join(',');
			}
		}

		const { data: prodData, error } = await offApi.apiv3.getProductV3(code, { ...searchParams });

		if (error) {
			console.error('Error fetching product attributes:', error);
			return [];
		} else if (prodData == null || prodData.status === 'failure') {
			console.warn('Product not found for code:', code);
			return [];
		} else if (prodData.product == null) {
			console.warn('Product data is null for code:', code);
			return [];
		}

		return prodData.product.attribute_groups_en as unknown as ProductGroupedAttributes[];
	}

	let productAttributes = $derived.by(() => {
		if (product.code && browser) {
			return getProductAttributes(product.code);
		}
		return new Promise<ProductGroupedAttributes[]>(() => {});
	});

	let sidebarHidden = $state(false);

	$effect(() => {
		const expectedValue = !sidebarHidden;
		if ($preferences.productSidebarVisible !== expectedValue) {
			$preferences.productSidebarVisible = expectedValue;
		}
	});
</script>

<Metadata
	title={$_('product.title', {
		default: '{productName} - Open Food Facts Explorer',
		values: { productName: product.product_name }
	})}
	description={$_('product.description', {
		default: 'Product page for {productName} on Open Food Facts Explorer',
		values: { productName: product.product_name }
	})}
	imageUrl={product.image_front_small_url ?? product.image_front_url ?? undefined}
/>

<div itemscope itemtype="https://schema.org/Product">
	<meta itemprop="name" content={product.product_name || ''} />
	<meta itemprop="image" content={product.image_front_url || product.image_front_small_url || ''} />
	<meta
		itemprop="description"
		content={$_('product.description', {
			default: 'Product page for {productName} on Open Food Facts Explorer',
			values: { productName: product.product_name }
		})}
	/>
	<meta itemprop="gtin" content={product.code || ''} />
	{#if product.brands}
		<div itemprop="brand" itemscope itemtype="https://schema.org/Brand">
			<meta itemprop="name" content={product.brands} />
		</div>
	{/if}

	<div
		class="relative w-full lg:grid lg:gap-8 pb-18 transition-all duration-300 {sidebarHidden
			? 'lg:grid-cols-1'
			: 'lg:grid-cols-[auto_1fr]'}"
	>
		{#snippet sidebarHeaderAction()}
			<button
				type="button"
				onclick={() => (sidebarHidden = true)}
				class="text-xs text-primary/70 hover:text-primary transition-colors cursor-pointer select-none underline font-medium flex items-center gap-1"
			>
				{$_('product.sidebar.hide', { default: 'Hide Sidebar' })}
			</button>
		{/snippet}

		<Sidebar
			type="product"
			sections={activeSections}
			bind:hidden={sidebarHidden}
			headerAction={sidebarHeaderAction}
		/>

		<div class="space-y-4 min-w-0 w-full flex flex-col gap-4">
			<div id="overview" class="flex flex-col gap-4">
				<ProductHeader {product} lc={data.lc} />
			</div>

			{#if showBarcode && product.code != null}
				<div id="barcode-info">
					<BarcodeInfo code={product.code} />
				</div>
			{/if}

			<div>
				<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_static_element_interactions -->
				<robotoff-contribution-message
					product-code={product.code}
					is-logged-in={$userInfo != null}
					onclick={() => trackOffEvent('product', 'open_nutrisight')}
				></robotoff-contribution-message>
			</div>

			<div id="attributes">
				{#await productAttributes}
					<div class="flex items-center justify-center py-8">
						<span class="loading loading-spinner loading-lg"></span>
						<span class="ml-2">{$_('product.loading_attributes')}</span>
					</div>
				{:then attributes}
					{#if attributes != null}
						<ProductAttributes
							groups={attributes}
							defaultPreferences={data.defaultProductPreferences}
						/>
					{:else}
						<div class="alert alert-warning">
							<IconMdiWarning class="h-6 w-6 shrink-0" />
							<div>
								<h3 class="font-bold">{$_('product.attributes_error_title')}</h3>
								<p>{$_('product.attributes_error_body')}</p>
							</div>
						</div>
					{/if}
				{/await}
			</div>

			<div id="knowledge-panels-container">
				<KnowledgePanelsComp
					panels={product.knowledge_panels}
					code={product.code}
					roots={['root']}
					summary={sidebarHidden}
				/>
			</div>

			{#if isPriceConfigured() && data?.prices != null}
				<div id="prices">
					<Prices prices={data.prices} barcode={product.code} />
				</div>
			{/if}

			<div id="data-sources" class="flex flex-col gap-4">
				<Gs1Country barcode={product.code} />
				<DataSources {product} />
			</div>

			{#if isFolksonomyConfigured()}
				<div id="folksonomy">
					<Card>
						<label class="label">
							<input class="toggle" type="checkbox" bind:checked={useWCFolksonomyEditor} />
							{$_('product.folksonomy.use_wc_editor')}
						</label>

						{#if useWCFolksonomyEditor}
							<!-- TODO: This solution is far from optimal. Embedding tokens into the DOM is a security risk -->
							<folksonomy-editor
								page-type="edit"
								product-code={product.code}
								auth-token={$userAuthTokens?.access_token ?? ''}
							></folksonomy-editor>
						{:else}
							<h1 class="my-4 text-4xl font-bold">{$_('product.folksonomy.title_beta')}</h1>

							<div class="prose my-4 text-justify">
								<p>
									{$_('product.folksonomy.intro_before')}
									<strong>{$_('product.folksonomy.intro_emphasis')}</strong>
									{$_('product.folksonomy.intro_after')}
									<a href={resolve('/folksonomy')}>
										{$_('product.folksonomy.link_properties')}
									</a>
									{$_('product.folksonomy.link_middle')}
									<a href="https://wiki.openfoodfacts.org/Folksonomy/Property">
										{$_('product.folksonomy.link_docs')}
									</a>.
								</p>
								<p>{$_('product.folksonomy.warning')}</p>
								<p>
									{$_('product.folksonomy.footer_before')}
									<a href="https://wiki.openfoodfacts.org/Folksonomy_Engine">
										{$_('product.folksonomy.footer_link')}
									</a>
									{$_('product.folksonomy.footer_after')}
								</p>
							</div>

							{#if data.tags != null && data.keys != null}
								<Folksonomy tags={data.tags ?? []} keys={data.keys} barcode={product.code!} />
							{/if}
						{/if}
					</Card>
				</div>
			{/if}
		</div>
	</div>
</div>

<NutritionCalculator />
