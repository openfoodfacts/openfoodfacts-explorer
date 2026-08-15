<script lang="ts">
	import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';
	import { _ } from '$lib/i18n';
	import { shareContent } from '$lib/utils/webShare';

	import { navigating } from '$app/state';
	import { flip } from 'svelte/animate';

	import { preferences } from '$lib/settings';
	import { PRODUCT_REPORT_URL, PRODUCT_WEBSITE_URL, TRACEABILITY_CODES_URL } from '$lib/const';
	import TagChipList from '$lib/ui/TagChips.svelte';
	import { addItemToCalculator, extractNutriments } from '$lib/stores/calculatorStore';
	import { compareStore } from '$lib/stores/compareStore';
	import { userInfo } from '$lib/stores/user';
	import { getToastCtx } from '$lib/stores/toasts';
	import Card from '$lib/ui/Card.svelte';
	import ImageButton from '$lib/ui/ImageButton.svelte';

	import IconMdiPencil from '@iconify-svelte/mdi/pencil';
	import IconMdiShareVariant from '@iconify-svelte/mdi/share-variant';
	import IconMdiFlag from '@iconify-svelte/mdi/flag';
	import IconMdiCalculator from '@iconify-svelte/mdi/calculator';
	import IconMdiCompare from '@iconify-svelte/mdi/compare';
	import IconMdiOpenInNew from '@iconify-svelte/mdi/open-in-new';

	import IconMdiTune from '@iconify-svelte/mdi/tune';
	import IconMdiEye from '@iconify-svelte/mdi/eye';
	import IconMdiEyeOff from '@iconify-svelte/mdi/eye-off';
	import IconMdiChevronUp from '@iconify-svelte/mdi/chevron-up';
	import IconMdiChevronDown from '@iconify-svelte/mdi/chevron-down';
	import IconMdiClose from '@iconify-svelte/mdi/close';

	import { resolve } from '$app/paths';
	type Props = {
		product: Product;
		lc?: string;
	};
	let { product, lc }: Props = $props();

	let { lang } = $derived($preferences);

	type ActionId = 'classic' | 'edit' | 'share' | 'report' | 'calculator' | 'compare';

	type ProductAction = {
		id: ActionId;
		label: string;
		visible: boolean;
	};

	let editActionsOpen = $state(false);

	const calculatorAction: ProductAction = {
		id: 'calculator',
		label: 'Calculator',
		visible: true
	};

	let productActions = $state<ProductAction[]>([
		{ id: 'classic', label: 'Classic view', visible: true },
		{ id: 'edit', label: 'Edit', visible: true },
		{ id: 'share', label: 'Share', visible: true },
		{ id: 'report', label: 'Report problem', visible: true },
		...($userInfo != null ? [calculatorAction] : []),
		{ id: 'compare', label: 'Compare', visible: true }
	]);

	function getLocalizedTags(facet: string): string[] | undefined {
		const rawProduct = product as unknown as Record<string, unknown>;
		const activeLang = lc || lang;
		// Prioritize specific language suffix fields (e.g. categories_tags_fr, brands_tags_fr)
		if (activeLang) {
			const langKey = `${facet}_tags_${activeLang.toLowerCase()}`;
			const langTags = rawProduct[langKey];
			if (Array.isArray(langTags) && langTags.length > 0) return langTags as string[];
		}

		// Fallback to English language suffix if available
		const enKey = `${facet}_tags_en`;
		const enTags = rawProduct[enKey];
		if (Array.isArray(enTags) && enTags.length > 0) return enTags as string[];

		return undefined;
	}

	let toastCtx = getToastCtx();
	function addToCalculator() {
		// FIXME: product.code cannot be null
		const code = product.code!;

		addItemToCalculator({
			id: code,
			name: product.product_name || code,
			quantity: 100,
			imageUrl: product.image_front_small_url,
			// @ts-expect-error - FIXME: maybe deprecated but the JSON response has this field
			nutriments: extractNutriments(product.nutriments)
		});
	}

	async function sharePage() {
		await shareContent(
			{
				url: `${window.location.origin}${window.location.pathname}`,
				title: product.product_name || product.code,
				text: $_('product.share_text', {
					values: { productName: product.product_name || product.code }
				})
			},
			{
				onClipboard: () => toastCtx.success($_('product.toast.copied_link')),
				onError: () => toastCtx.error($_('product.toast.failed_copy'))
			}
		);
	}

	let frontImage = $derived(
		'image_front_url' in product ? (product.image_front_url as string) : undefined
	);

	let productWebsiteUrl = $derived(PRODUCT_WEBSITE_URL(product.code!, product.product_type));

	function addToComparison() {
		// Convert Product to ProductReduced - using type assertion since the product exists
		const added = compareStore.addProduct(product);
		if (added) {
			toastCtx.success('Product added to comparison');
		} else {
			toastCtx.warning('Product is already in comparison or comparison is full');
		}
	}

	function toggleAction(id: ActionId) {
		const index = productActions.findIndex((item) => item.id === id);

		if (index < 0) {
			return;
		}

		const action = productActions[index];

		if (action.visible) {
			// Disable: remove from the enabled group and place at the
			// beginning of the disabled group.
			action.visible = false;

			productActions.splice(index, 1);

			const firstDisabledIndex = productActions.findIndex((item) => !item.visible);

			if (firstDisabledIndex === -1) {
				productActions.push(action);
			} else {
				productActions.splice(firstDisabledIndex, 0, action);
			}
		} else {
			// Enable: remove from disabled group and place at the end
			// of the enabled group.
			action.visible = true;

			productActions.splice(index, 1);

			const firstDisabledIndex = productActions.findIndex((item) => !item.visible);

			if (firstDisabledIndex === -1) {
				productActions.push(action);
			} else {
				productActions.splice(firstDisabledIndex, 0, action);
			}
		}
	}
	function moveAction(id: ActionId, direction: -1 | 1) {
		const index = productActions.findIndex((item) => item.id === id);
		const newIndex = index + direction;

		if (index < 0 || newIndex < 0 || newIndex >= productActions.length) {
			return;
		}

		const [action] = productActions.splice(index, 1);
		productActions.splice(newIndex, 0, action);
	}
</script>

<Card>
	<div class="flex flex-col gap-6 md:flex-row-reverse md:gap-8">
		<!-- 1. Image Column (Visual Anchor) -->
		<!-- Left on Desktop, Top on Mobile -->
		<div
			class="mx-auto flex w-full max-w-50 shrink-0 items-start justify-center md:h-auto md:w-1/4 md:max-w-none"
		>
			<ImageButton src={frontImage} alt={product.product_name} productCode={product.code} />
		</div>

		<!-- 2. Content Column -->
		<div class="flex min-w-0 flex-1 flex-col gap-8">
			<!-- Header Section: Title & Actions -->
			<div class="flex flex-col gap-8">
				<h1
					class="text-center text-3xl leading-tight font-bold wrap-break-word md:text-left md:text-4xl"
				>
					{product.product_name ?? '[' + product.code + ']'}
				</h1>

				<!-- Action Toolbar -->
				<div class="flex shrink-0 flex-wrap items-center justify-center gap-2 md:justify-start">
					{#each productActions as action (action.id)}
						{#if action.visible}
							{#if action.id === 'classic'}
								<a
									href={productWebsiteUrl}
									target="_blank"
									rel="noopener noreferrer"
									class="btn btn-secondary btn-sm md:btn-md"
									title={$_('product.buttons.classic_view', { default: 'Classic view' })}
									aria-label={$_('product.buttons.classic_view', { default: 'Classic view' })}
								>
									<IconMdiOpenInNew class="h-5 w-5" />
									<span>{$_('product.buttons.classic_view')}</span>
								</a>
							{:else if action.id === 'edit'}
								<a
									href={`/products/${product.code}/edit`}
									class="btn btn-secondary btn-sm md:btn-md"
									class:pointer-events-none={navigating.to}
									title={$_('product.buttons.edit', { default: 'Edit' })}
									aria-label={$_('product.buttons.edit', { default: 'Edit' })}
								>
									<IconMdiPencil class="h-5 w-5" />
									<span class="hidden md:block">{$_('product.buttons.edit')}</span>
								</a>
							{:else if action.id === 'share'}
								<button
									class="btn flex items-center gap-2 btn-secondary btn-sm md:btn-md"
									onclick={sharePage}
									title={$_('product.buttons.share', { default: 'Share' })}
									aria-label={$_('product.buttons.share', { default: 'Share' })}
								>
									<IconMdiShareVariant class="h-5 w-5" />
									<span class="hidden md:block">{$_('product.buttons.share')}</span>
								</button>
							{:else if action.id === 'report'}
								<a
									id="report-problem"
									class="btn flex items-center gap-2 btn-secondary btn-sm md:btn-md"
									href={PRODUCT_REPORT_URL(product.code!, product.product_type)}
									target="_blank"
									rel="noopener noreferrer"
									title={$_('product.buttons.report')}
									aria-label={$_('product.buttons.report')}
								>
									<IconMdiFlag class="h-5 w-5" />
								</a>
							{:else if action.id === 'calculator' && $userInfo != null}
								<button
									class="btn btn-secondary btn-sm md:btn-md"
									onclick={addToCalculator}
									title={$_('product.buttons.add_to_calculator')}
									aria-label={$_('product.buttons.add_to_calculator')}
								>
									<IconMdiCalculator class="h-5 w-5" />
								</button>
							{:else if action.id === 'compare'}
								<button
									class="btn btn-secondary btn-sm md:btn-md"
									onclick={addToComparison}
									title={$_('product.buttons.compare')}
									aria-label={$_('product.buttons.compare')}
								>
									<IconMdiCompare class="h-5 w-5" />
								</button>
							{/if}
						{/if}
					{/each}

					<!-- Edit actions button -->
					<button
						class="btn btn-secondary btn-sm md:btn-md"
						onclick={() => (editActionsOpen = true)}
						title="Edit actions"
						aria-label="Edit actions"
					>
						<IconMdiTune class="h-5 w-5" />
					</button>
				</div>
			</div>

			<!-- Metadata Body -->
			<div class="flex flex-col gap-3 text-center md:text-left">
				<div class="mb-2">
					<div class="mb-2 text-sm font-bold text-secondary">{$_('product.header.quantity')}</div>
					<div>{product.quantity}</div>
				</div>

				<!-- Brands -->
				{@render taxonomyTags(
					'product.header.brands',
					'Brands',
					product.brands_tags,
					getLocalizedTags('brands'),
					'brands'
				)}

				<!-- Categories -->
				{@render taxonomyTags(
					'product.header.categories',
					'Categories',
					product.categories_tags,
					getLocalizedTags('categories'),
					'categories'
				)}

				<!-- Labels -->
				{@render taxonomyTags(
					'product.header.labels',
					'Labels',
					product.labels_tags,
					getLocalizedTags('labels'),
					'labels'
				)}

				<!-- Origins -->
				{@render taxonomyTags(
					'product.header.origins',
					'Origins',
					product.origins_tags as unknown as string[],
					getLocalizedTags('origins'),
					'origins'
				)}

				<!-- Traceability Codes -->
				{#if product.emb_codes_tags != null && product.emb_codes_tags.length > 0}
					<div class="mb-2">
						<div class="mb-2 text-sm font-bold text-secondary">
							<span>{$_('product.header.traceability_codes')}</span>
							<a
								href={TRACEABILITY_CODES_URL}
								target="_blank"
								rel="noopener noreferrer"
								class="link text-xs link-secondary"
							>
								({$_('product.header.traceability_codes_learn_more')})
							</a>
						</div>

						<div class="flex flex-wrap items-center justify-center gap-2 md:justify-start">
							{#each product.emb_codes_tags as unknown as string[] as tag, i (i)}
								<a class="badge font-mono wrap-break-word" href="/facets/packager-codes/{tag}">
									{tag.toUpperCase()}
								</a>
							{/each}
						</div>
					</div>
				{/if}

				{#if product.link != null}
					<div class="mb-2">
						<div class="mb-2 text-sm font-bold text-secondary">
							{$_('product.header.producer_link')}
						</div>
						<a
							class="link break-all"
							href={product.link}
							target="_blank"
							rel="noopener noreferrer"
							title={$_('product.buttons.view_on_off')}
							aria-label={$_('product.buttons.view_on_off')}
						>
							{product.link}
						</a>
					</div>
				{/if}

				<!-- Stores -->
				{@render taxonomyTags(
					'product.header.stores',
					'Stores',
					product.stores_tags,
					getLocalizedTags('stores'),
					'stores'
				)}

				<!-- Countries -->
				{@render taxonomyTags(
					'product.header.countries',
					'Countries',
					product.countries_tags,
					getLocalizedTags('countries'),
					'countries'
				)}
			</div>
		</div>
	</div>
</Card>

{#if editActionsOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-base-content/50 p-4">
		<div class="w-full max-w-2xl rounded-3xl bg-base-100 shadow-2xl">
			<!-- Header -->
			<div class="flex items-center justify-between border-b border-base-300 p-4">
				<h2 class="text-xl font-bold">Edit actions</h2>

				<button
					class="btn btn-circle bg-base-content/15 hover:bg-base-content/20"
					onclick={() => (editActionsOpen = false)}
					aria-label="Close edit actions"
					title="Close"
				>
					<IconMdiClose class="h-6 w-6" />
				</button>
			</div>

			<!-- Actions -->
			<div class="max-h-[70vh] space-y-3 overflow-y-auto p-4">
				{#each productActions as action, index (action.id)}
					<div
						animate:flip={{ duration: 250 }}
						class="flex items-center gap-3 rounded-2xl bg-base-200 p-3"
						class:opacity-50={!action.visible}
					>
						<!-- Visibility -->
						<button
							class="btn btn-circle shrink-0 btn-ghost"
							class:text-error={!action.visible}
							onclick={() => toggleAction(action.id)}
							aria-label={action.visible ? `Hide ${action.label}` : `Show ${action.label}`}
							title={action.visible ? `Hide ${action.label}` : `Show ${action.label}`}
						>
							{#if action.visible}
								<IconMdiEye class="h-6 w-6" />
							{:else}
								<IconMdiEyeOff class="h-6 w-6" />
							{/if}
						</button>
						<!-- Action icon -->
						<div>
							{#if action.id === 'classic'}
								<IconMdiOpenInNew class="h-6 w-6" />
							{:else if action.id === 'edit'}
								<IconMdiPencil class="h-6 w-6" />
							{:else if action.id === 'share'}
								<IconMdiShareVariant class="h-6 w-6" />
							{:else if action.id === 'report'}
								<IconMdiFlag class="h-6 w-6" />
							{:else if action.id === 'calculator'}
								<IconMdiCalculator class="h-6 w-6" />
							{:else if action.id === 'compare'}
								<IconMdiCompare class="h-6 w-6" />
							{/if}
						</div>
						<!-- Action name -->
						<div class="min-w-0 flex-1 font-semibold">
							{action.label}
						</div>
						<!-- Reorder -->
						<div class="flex gap-2">
							<button
								class="btn btn-circle bg-base-content/10 btn-sm hover:bg-base-content/20"
								disabled={!action.visible || index === 0 || !productActions[index - 1]?.visible}
								onclick={() => moveAction(action.id, -1)}
								aria-label={`Move ${action.label} up`}
								title="Move up"
							>
								<IconMdiChevronUp class="h-5 w-5" />
							</button>
							<button
								class="btn btn-circle bg-base-content/10 btn-sm hover:bg-base-content/20"
								disabled={!action.visible ||
									index === productActions.length - 1 ||
									!productActions[index + 1]?.visible}
								onclick={() => moveAction(action.id, 1)}
								aria-label={`Move ${action.label} down`}
								title="Move down"
							>
								<IconMdiChevronDown class="h-5 w-5" />
							</button>
						</div>
					</div>
				{/each}
			</div>
		</div>
	</div>
{/if}

{#snippet taxonomyTags(
	titleKey: string,
	defaultTitle: string,
	tags: string[] | undefined,
	localizedTags: string[] | undefined,
	facet: string
)}
	{#if tags != null && tags.length > 0}
		<div class="mb-2">
			<div class="mb-2 text-sm font-bold text-secondary">
				{$_(titleKey, { default: defaultTitle })}
			</div>
			<TagChipList
				tags={tags.map((tag, idx) => ({
					id: tag,
					name: localizedTags && localizedTags[idx] ? localizedTags[idx] : tag,
					href: resolve('/facets/[facet]/[value]', { facet, value: tag })
				}))}
			/>
		</div>
	{/if}
{/snippet}
