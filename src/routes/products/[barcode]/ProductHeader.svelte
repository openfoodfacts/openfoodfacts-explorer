<script lang="ts">
	import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';
	import { _ } from '#lib/i18n/index.js';
	import { shareContent } from '#lib/utils/webShare.js';

	import { navigating } from '$app/state';

	import { getLanguageCode, preferences } from '#lib/settings.js';
	import { PRODUCT_REPORT_URL, PRODUCT_WEBSITE_URL, TRACEABILITY_CODES_URL } from '#lib/const.js';
	import TagChipList from '#lib/ui/TagChips.svelte';
	import { addItemToCalculator, extractNutriments } from '#lib/stores/calculatorStore.js';
	import { compareStore } from '#lib/stores/compareStore.js';
	import { userInfo } from '#lib/stores/user.js';
	import { getToastCtx } from '#lib/stores/toasts.js';
	import Card from '#lib/ui/Card.svelte';
	import ImageButton from '#lib/ui/ImageButton.svelte';
	import AppStrip from './AppStrip.svelte';

	import IconMdiPencil from '@iconify-svelte/mdi/pencil';
	import IconMdiShareVariant from '@iconify-svelte/mdi/share-variant';
	import IconMdiCameraOutline from '@iconify-svelte/mdi/camera-outline';
	import IconMdiDotsHorizontal from '@iconify-svelte/mdi/dots-horizontal';
	import IconMdiOpenInNew from '@iconify-svelte/mdi/open-in-new';
	import IconMdiScaleBalance from '@iconify-svelte/mdi/scale-balance';
	import IconMdiShape from '@iconify-svelte/mdi/shape';
	import IconMdiCalculator from '@iconify-svelte/mdi/calculator';
	import IconMdiFlag from '@iconify-svelte/mdi/flag';
	import { resolve } from '$app/paths';
	type Props = {
		product: Product;
		lc?: string;
	};
	let { product, lc }: Props = $props();

	let { locale: preferredLocale } = $derived($preferences);

	function getLocalizedTags(facet: string): string[] | undefined {
		const rawProduct = product as unknown as Record<string, unknown>;
		const activeLang = lc || getLanguageCode(preferredLocale);
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
		closeMenu();
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
		(product.image_front_url as string | undefined) ?? product.image_front_small_url
	);

	let frontKey = $derived(frontImage?.match(/\/(front_[a-z]+)\.\d+\.\d+\.jpg$/)?.[1]);
	let uploader = $derived.by(() => {
		const images = (product as unknown as Record<string, unknown>).images as
			Record<string, { imgid?: string; uploader?: string }> | undefined;
		const imgid = frontKey ? images?.[frontKey]?.imgid : undefined;
		return imgid ? images?.[imgid]?.uploader : undefined;
	});
	let credit = $derived(
		uploader ? $_('product.image_attribution', { values: { photographer: uploader } }) : undefined
	);
	let productWebsiteUrl = $derived(PRODUCT_WEBSITE_URL(product.code!, product.product_type));

	let creditHref = $derived(
		`${new URL(productWebsiteUrl).origin}/cgi/product_image.pl?code=${product.code}&id=${frontKey}`
	);

	let metaLine = $derived(
		[product.brands?.replaceAll(',', ', '), product.generic_name, product.quantity]
			.filter(Boolean)
			.join(' · ')
	);

	let similarHref = $derived.by(() => {
		const value = product.categories_tags?.at(-1);
		return value ? resolve('/facets/[facet]/[value]', { facet: 'categories', value }) : undefined;
	});

	async function copyBarcode() {
		try {
			await navigator.clipboard.writeText(product.code!);
			toastCtx.success($_('product.toast.copied_barcode'));
		} catch {
			toastCtx.error($_('product.toast.failed_copy_barcode'));
		}
	}

	function closeMenu() {
		(document.activeElement as HTMLElement | null)?.blur();
	}

	function closeOnEscape(e: KeyboardEvent) {
		if (e.key === 'Escape') closeMenu();
	}

	function addToComparison() {
		closeMenu();
		// Convert Product to ProductReduced - using type assertion since the product exists
		const added = compareStore.addProduct(product);
		if (added) {
			toastCtx.success(
				$_('product.menu.added_to_comparison', { default: 'Product added to comparison' })
			);
		} else {
			toastCtx.warning(
				$_('product.menu.add_to_comparison_failed', {
					default: 'Product is already in comparison or comparison list is full'
				})
			);
		}
	}
</script>

<AppStrip />
<Card>
	<div class="flex flex-col gap-6">
		<div
			class="grid grid-cols-[6rem_1fr] gap-x-3.5 md:grid-cols-[14rem_1fr] md:grid-rows-[auto_1fr] md:gap-x-6"
		>
			<div class="flex min-w-0 flex-col gap-2 md:row-span-2">
				{#if frontImage}
					<div
						class="relative aspect-square overflow-hidden rounded-xl bg-white [&>div]:size-full [&>div_button]:size-full [&>div_img]:size-full [&>div_img]:object-contain [&>div>button>div]:size-full"
					>
						<img
							src={frontImage}
							alt=""
							class="absolute inset-0 size-full scale-150 object-cover blur-sm"
							aria-hidden="true"
						/>
						<ImageButton
							src={frontImage}
							alt={product.product_name}
							productCode={product.code}
							caption={credit}
						/>
					</div>
				{:else}
					<div
						class="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl bg-base-content/10 p-1 text-center text-xs text-base-content/70 md:gap-2 md:text-sm"
					>
						<IconMdiCameraOutline class="h-6 w-6 md:h-10 md:w-10" aria-hidden="true" />
						<span>{$_('product.edit.no_photo_available')}</span>
					</div>
				{/if}
				{#if credit}
					<a
						href={creditHref}
						target="_blank"
						rel="noopener noreferrer"
						class="hidden link text-xs text-base-content/70 md:block"
					>
						{credit}
					</a>
				{/if}
			</div>

			<div class="flex min-w-0 flex-col gap-2">
				<h1
					class={[
						'leading-tight font-bold wrap-break-word md:text-3xl',
						product.product_name ? 'text-2xl' : 'text-xl'
					]}
				>
					{product.product_name || product.code}
				</h1>
				{#if metaLine}
					<p class="text-sm text-base-content/70 md:text-base">{metaLine}</p>
				{/if}
				<div class="flex flex-wrap items-center gap-2 text-sm text-base-content/70">
					<span class="sr-only md:not-sr-only">{$_('product.barcode.code_label')}</span>
					{#if product.product_name}
						<span class="rounded-lg bg-base-content/10 px-2 font-mono text-xs md:text-sm"
							>{product.code}</span
						>
					{/if}
					<button class="btn rounded-full btn-outline btn-xs" onclick={copyBarcode}>
						{$_('product.buttons.copy')}
					</button>
				</div>
			</div>
			<div
				class="col-span-2 mt-4 flex flex-wrap items-center gap-2 md:col-span-1 md:col-start-2 md:mt-2 md:self-start"
			>
				<a
					href={`/products/${product.code}/edit`}
					class={['btn rounded-full btn-sm', product.product_name ? 'btn-outline' : 'btn-primary']}
					class:pointer-events-none={navigating.to}
				>
					<IconMdiPencil class="h-4 w-4" aria-hidden="true" />
					{product.product_name
						? $_('product.buttons.edit')
						: $_('product.edit.edit_product_title')}
				</a>
				<button class="btn rounded-full btn-outline btn-sm" onclick={sharePage}>
					<IconMdiShareVariant class="h-4 w-4" aria-hidden="true" />
					{$_('product.buttons.share')}
				</button>
				<div class="dropdown dropdown-end" role="presentation" onkeydown={closeOnEscape}>
					<div
						tabindex="0"
						role="button"
						class="btn rounded-full btn-outline btn-sm"
						aria-label={$_('product.buttons.more')}
					>
						<IconMdiDotsHorizontal class="h-5 w-5" aria-hidden="true" />
					</div>
					<ul
						class="menu dropdown-content z-50 mt-1 w-56 rounded-box border border-base-300 bg-base-100 p-2 shadow-xl"
					>
						<li>
							<a
								href={productWebsiteUrl}
								target="_blank"
								rel="noopener noreferrer"
								onclick={closeMenu}
							>
								<IconMdiOpenInNew class="h-5 w-5" aria-hidden="true" />
								{$_('product.buttons.classic_view')}
							</a>
						</li>
						<li>
							<button onclick={addToComparison}>
								<IconMdiScaleBalance class="h-5 w-5" aria-hidden="true" />
								{$_('product.buttons.compare')}
							</button>
						</li>
						{#if similarHref}
							<li>
								<a href={similarHref} onclick={closeMenu}>
									<IconMdiShape class="h-5 w-5" aria-hidden="true" />
									{$_('product.barcode.similar_products')}
								</a>
							</li>
						{/if}
						{#if $userInfo != null}
							<li>
								<button onclick={addToCalculator}>
									<IconMdiCalculator class="h-5 w-5" aria-hidden="true" />
									{$_('product.buttons.add_to_calculator')}
								</button>
							</li>
						{/if}
						<li>
							<a
								id="report-problem"
								href={PRODUCT_REPORT_URL(product.code!, product.product_type)}
								target="_blank"
								rel="noopener noreferrer"
								onclick={closeMenu}
							>
								<IconMdiFlag class="h-5 w-5" aria-hidden="true" />
								{$_('product.buttons.report')}
							</a>
						</li>
					</ul>
				</div>
			</div>
		</div>

		<div class="min-w-0">
			<!-- Metadata Body -->
			<div class="flex flex-col gap-3 text-center md:text-left">
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
