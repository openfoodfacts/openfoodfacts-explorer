<!--
@component
Wraps the <product-card> web component and adds accessibility features.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { createProductsApi } from '$lib/api';
	import type {
		ProductReduced,
		ProductAttributeForScoringGroup,
		ProductAttributeForScoring
	} from '$lib/api';
	import type { ScoreData } from '$lib/scoring';
	import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';
	import { _ } from 'svelte-i18n';

	import IconMdiAdd from '@iconify-svelte/mdi/plus';
	import IconMdiEdit from '@iconify-svelte/mdi/pencil';

	import { compareStore } from '$lib/stores/compareStore';
	import { getToastCtx } from '$lib/stores/toasts';
	import { resolve } from '$app/paths';

	type Props = {
		product: ProductReduced | Product;
		personalScore?: ScoreData;
		attributes?: ProductAttributeForScoringGroup[];
		scanCount?: number | null;
	};
	let { product, personalScore, attributes = [], scanCount = null }: Props = $props();

	/**
	 * Returns a DaisyUI badge color class based on the attribute match score.
	 * Green for good (>=75), warning for moderate (>=50), error for poor (<50).
	 */
	function getMatchColor(match?: number): string {
		if (match == null) return 'badge-ghost';
		if (match >= 75) return 'badge-success';
		if (match >= 50) return 'badge-warning';
		return 'badge-error';
	}

	/**
	 * Returns a border color class for the attribute icon overlay circles.
	 */
	function getMatchBorderColor(match?: number): string {
		if (match == null) return 'border-base-200';
		if (match >= 75) return 'border-success';
		if (match >= 50) return 'border-warning';
		return 'border-error';
	}

	/** Flattened key attributes with known status and icon. */
	let keyAttributes = $derived.by(() => {
		if (!attributes || attributes.length === 0) return [];
		return attributes
			.flatMap((g: ProductAttributeForScoringGroup) => g.attributes)
			.filter((a: ProductAttributeForScoring) => a.status === 'known' && (a.icon_url || a.name))
			.slice(0, 4);
	});

	/** Attributes that have icons, for the icon overlay (max 4). */
	let iconAttributes = $derived(
		keyAttributes.filter((a: ProductAttributeForScoring) => a.icon_url).slice(0, 4)
	);

	/** Attributes for chips below the card (max 3, those with names). */
	let chipAttributes = $derived(
		keyAttributes.filter((a: ProductAttributeForScoring) => a.name).slice(0, 3)
	);

	let navigating = $state(false);
	async function navigateToProduct() {
		navigating = true;
		await goto(`/products/${product.code}`);
		navigating = false;
	}

	let showContextMenu = $state(false);
	let pos = $state({ x: 0, y: 0 });
	let contextFocusIndex = $state(0);

	function contextMenu(event: MouseEvent) {
		// if Alt/Option or Ctrl/Cmd is pressed, let the browser handle it
		if (event.altKey || event.ctrlKey || event.metaKey) {
			return;
		}

		event.preventDefault();
		pos = { x: event.clientX, y: event.clientY };
		showContextMenu = true;
		contextFocusIndex = 0;
	}

	function closeContextMenu() {
		showContextMenu = false;
		pos = { x: 0, y: 0 };
	}

	const contextItems = [
		{
			id: 'edit',
			label: $_('product.menu.edit', { default: 'Edit product' }),
			icon: IconMdiEdit,
			action: () => {
				goto(resolve('/products/[barcode]/edit', { barcode: product.code }));
			}
		},
		{
			id: 'add-to-comparison',
			label: $_('product.menu.add_to_comparison', { default: 'Add to comparison' }),
			icon: IconMdiAdd,
			action: addToComparison
		}
	];

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown') {
			event.preventDefault();
			contextFocusIndex = (contextFocusIndex + 1) % contextItems.length;
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			contextFocusIndex = (contextFocusIndex - 1 + contextItems.length) % contextItems.length;
		} else if (event.key === 'Enter') {
			event.preventDefault();
			contextItems[contextFocusIndex].action();
		} else if (event.key === 'Escape') {
			closeContextMenu();
		}
	}

	const toastCtx = getToastCtx();

	async function addToComparison() {
		closeContextMenu();

		try {
			const productsApi = createProductsApi(fetch);
			const { data, error } = await productsApi.getProductV3(product.code);
			if (error != null || data?.status === 'failure' || data?.product == null) {
				throw new Error('Could not load product details for comparison');
			}

			// @ts-expect-error - SDK response typing for getProductV3 product payload is incompatible here
			const ok = compareStore.addProduct(data.product);
			if (!ok) {
				toastCtx.warning(
					$_('product.menu.add_to_comparison_failed', {
						default: 'Product is already in comparison or comparison list is full'
					})
				);
				return;
			}

			toastCtx.success(
				$_('product.menu.added_to_comparison', {
					default: 'Product added to comparison'
				})
			);
		} catch (error) {
			console.error('Failed to load product for comparison:', error);
			toastCtx.error(
				$_('product.menu.load_for_comparison_failed', {
					default: 'Could not load product details for comparison'
				})
			);
		}
	}
</script>

<svelte:window
	onmousedown={closeContextMenu}
	onkeydown={(e) => {
		if (e.key === 'Escape') closeContextMenu();
	}}
/>

<div class="group relative flex w-full flex-col">
	<!-- Product card image area -->
	<div class="relative h-44 w-full">
		<product-card
			class="block h-full w-full cursor-pointer"
			{product}
			onclick={navigateToProduct}
			onkeyup={(e: KeyboardEvent) => e.key === 'Enter' && navigateToProduct()}
			aria-label={product.product_name
				? $_('product.card.aria_label', {
						values: { productName: product.product_name, productCode: product.code }
					})
				: $_('product.card.aria_label_no_name', {
						values: { productCode: product.code }
					})}
			showMatchTag={personalScore != undefined}
			navigating={{
				to: navigating ? { params: { barcode: product.code } } : null
			}}
			{personalScore}
			role="button"
			tabindex="0"
			oncontextmenu={contextMenu}
		></product-card>

		{#if scanCount != null}
			<div
				class="pointer-events-none absolute top-2 left-2 z-10 rounded-full border border-base-300/80 bg-base-100/95 px-2 py-1 text-xs font-medium text-base-content shadow-sm backdrop-blur-sm"
			>
				<span class="tabular-nums">{scanCount.toLocaleString()}</span>
				<span class="ml-1">{$_('product.card.scans', { default: 'scans' })}</span>
			</div>
		{/if}

		<!-- Keep the three scoring systems grouped in a protected lower edge of the image. -->
		<div
			class="pointer-events-none absolute right-2 bottom-2 left-2 z-10 flex flex-wrap items-center justify-end gap-1.5 rounded-box border border-base-300/80 bg-base-100/95 p-1 shadow-sm backdrop-blur-sm"
		>
			{#if product.nutriscore_grade && (product.nutriscore_grade as string) !== 'unknown' && (product.nutriscore_grade as string) !== 'not-applicable'}
				<img
					src="https://static.openfoodfacts.org/images/attributes/nutriscore-{product.nutriscore_grade}.svg"
					class="h-7 w-auto shrink-0 object-contain"
					alt="Nutri-Score {product.nutriscore_grade?.toUpperCase()}"
				/>
			{/if}
			{#if product.ecoscore_grade && (product.ecoscore_grade as string) !== 'unknown' && (product.ecoscore_grade as string) !== 'not-applicable'}
				<img
					src="https://static.openfoodfacts.org/images/attributes/ecoscore-{product.ecoscore_grade}.svg"
					class="h-7 w-auto shrink-0 object-contain"
					alt="Eco-Score {product.ecoscore_grade?.toUpperCase()}"
				/>
			{/if}
			{#if product.nova_group && (product.nova_group as unknown as string) !== 'unknown'}
				<img
					src="https://static.openfoodfacts.org/images/attributes/nova-group-{product.nova_group}.svg"
					class="h-7 w-auto shrink-0 object-contain"
					alt="NOVA {product.nova_group}"
				/>
			{/if}
		</div>

		<!-- Attribute icon overlay (top-right, from API) -->
		{#if iconAttributes.length > 0}
			<div
				class="pointer-events-none absolute top-2 right-2 z-10 flex max-w-[calc(100%-5.5rem)] flex-wrap justify-end gap-1"
			>
				{#each iconAttributes as attr (attr.id)}
					<div
						class="rounded-full border-2 bg-base-100/90 p-1 shadow-xs backdrop-blur-sm {getMatchBorderColor(
							attr.match
						)}"
						title={attr.title || attr.name}
					>
						<img src={attr.icon_url} alt={attr.name} class="h-5 w-5 object-contain" />
					</div>
				{/each}
			</div>
		{/if}
	</div>

	<!-- Attribute chips (below card) -->
	{#if chipAttributes.length > 0}
		<div class="flex flex-wrap gap-1 px-1 pt-1.5 pb-1">
			{#each chipAttributes as attr (attr.id)}
				<span
					class="badge gap-1 badge-sm {getMatchColor(attr.match)}"
					title={attr.title || attr.name}
				>
					{#if attr.icon_url}
						<img src={attr.icon_url} alt="" class="h-3 w-3 object-contain" />
					{/if}
					<span class="max-w-20 truncate text-xs">{attr.name}</span>
				</span>
			{/each}
		</div>
	{/if}
</div>

{#if showContextMenu}
	<div
		role="menu"
		tabindex="-1"
		class="animate-in fade-in slide-in-from-top-1 fixed z-50 min-w-48 rounded-xl border border-base-300 bg-base-100 shadow-2xl backdrop-blur-sm duration-200"
		style="top: {pos.y}px; left: {pos.x}px;"
		onmousedown={(e) => e.stopPropagation()}
		onkeydown={handleKeyDown}
	>
		<div class="p-1.5">
			{#each contextItems as item (item.id)}
				<button
					role="menuitem"
					class="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-all duration-150 ease-out hover:bg-base-200 focus:bg-base-200 focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:outline-none active:bg-base-300"
					onclick={item.action}
				>
					<item.icon class="h-5 w-5 opacity-70" />
					<span>{item.label}</span>
				</button>
			{/each}
		</div>
	</div>
{/if}
