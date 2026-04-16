<script lang="ts">
	import { flip } from 'svelte/animate';

	import { _ } from '$lib/i18n';
	import { KP_ATTRIBUTE_IMG } from '$lib/const';
	import BlurredImageDisplay from '$lib/ui/BlurredImageDisplay.svelte';

	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiDrag from '@iconify-svelte/mdi/drag';
	import type { Product } from '@openfoodfacts/openfoodfacts-nodejs';

	type Props = {
		products: Product[];
		comparisonMode: 'absolute' | 'relative-first' | 'relative-best';
		onRemoveProduct?: (code: string) => void;
		onReorderProduct?: (fromIndex: number, toIndex: number) => void;
		readonly?: boolean;
	};

	let {
		products,
		comparisonMode,
		onRemoveProduct,
		onReorderProduct,
		readonly = false
	}: Props = $props();

	type NutrientKey = string;

	type NutrientComparison = {
		value: number | null;
		formatted: string;
		diff: number | null;
		diffFormatted: string;
		isBest: boolean;
		isWorst: boolean;
	};

	// Helper to safely get a nutrient value from a product
	function getNutrientValue(product: Product, nutrientKey: string): number | null {
		const rawValue = product.nutriments?.[nutrientKey];
		if (typeof rawValue === 'number') {
			return rawValue;
		}

		// Try to parse if it's a string
		if (typeof rawValue === 'string') {
			const parsed = parseFloat(rawValue);
			return isNaN(parsed) ? null : parsed;
		}

		return null;
	}

	type AvailableNutrient = {
		key: string;
		label: string;
		unit: string;
	};

	// Predefined list of nutrients to display in comparison
	const availableNutrients: Array<AvailableNutrient> = [
		{
			key: 'energy-kcal_100g',
			label: `${$_('product.edit.energy')} (${$_('product.edit.si_kilocalories')})`,
			unit: $_('product.edit.si_kilocalories')
		},

		{
			key: 'energy-kj_100g',
			label: `${$_('product.edit.energy')} (${$_('product.edit.si_kilojoules')})`,
			unit: $_('product.edit.si_kilojoules')
		},
		{ key: 'fat_100g', label: $_('product.edit.nutrient.fat'), unit: $_('product.edit.si_grams') },
		{
			key: 'saturated-fat_100g',
			label: $_('product.edit.nutrient.saturated-fat'),
			unit: $_('product.edit.si_grams')
		},
		{
			key: 'carbohydrates_100g',
			label: $_('product.edit.nutrient.carbohydrates'),
			unit: $_('product.edit.si_grams')
		},
		{
			key: 'sugars_100g',
			label: $_('product.edit.nutrient.sugars'),
			unit: $_('product.edit.si_grams')
		},
		{
			key: 'fibers_100g',
			label: $_('product.edit.nutrient.fibers'),
			unit: $_('product.edit.si_grams')
		},
		{
			key: 'proteins_100g',
			label: $_('product.edit.nutrient.proteins'),
			unit: $_('product.edit.si_grams')
		},
		{
			key: 'salt_100g',
			label: $_('product.edit.nutrient.salt'),
			unit: $_('product.edit.si_grams')
		},
		{
			key: 'sodium_100g',
			label: $_('product.edit.nutrient.sodium'),
			unit: $_('product.edit.si_grams')
		},
		{
			key: 'alcohol_100g',
			label: $_('product.edit.nutrient.alcohol'),
			unit: $_('product.edit.si_percent_vol')
		},
		{
			key: 'fruits-vegetables-nuts-estimate-from-ingredients_100g',
			label: $_('compare.fruits_vegetables_nuts'),
			unit: '%'
		}
	];
	// Nutrients to compare
	const nutrientRules: Record<string, 'min' | 'max'> = {
		proteins_100g: 'max',
		fibers_100g: 'max',
		'fruits-vegetables-nuts-estimate-from-ingredients_100g': 'max',
		sugars_100g: 'min',
		salt_100g: 'min',
		sodium_100g: 'min',
		alcohol_100g: 'min',
		carbohydrates_100g: 'min',
		'energy-kcal_100g': 'min',
		'energy-kj_100g': 'min',
		fat_100g: 'min',
		'saturated-fat_100g': 'min'
	};
	// Get the direction of the nutrient
	function getDirection(nutrientKey: string): 'min' | 'max' {
		return nutrientRules[nutrientKey] ?? 'min';
	}
	// Get the best value for a nutrient
	function getBestValue(products: Product[], nutrientKey: NutrientKey): number | null {
		const values = products
			.map((p) => getNutrientValue(p, nutrientKey))
			.filter((v): v is number => v !== null);
		if (!values.length) return null;

		const direction = getDirection(nutrientKey);
		return direction === 'min' ? Math.min(...values) : Math.max(...values);
	}

	// Get the worst value for a nutrient
	function getWorstValue(products: Product[], nutrientKey: NutrientKey): number | null {
		const values = products
			.map((p) => getNutrientValue(p, nutrientKey))
			.filter((v): v is number => v !== null);
		if (!values.length) return null;

		const direction = getDirection(nutrientKey);
		return direction === 'min' ? Math.max(...values) : Math.min(...values);
	}

	// Get nutrient value with comparison data
	function getNutrientComparison(
		product: Product,
		nutrientKey: NutrientKey,
		products: Product[],
		index: number
	): NutrientComparison {
		const value = getNutrientValue(product, nutrientKey);
		const formatted = formatNutrient(value, nutrientKey !== 'energy-kcal_100g');

		if (value == null) {
			return {
				value,
				formatted,
				diff: null,
				diffFormatted: '',
				isBest: false,
				isWorst: false
			};
		}

		let referenceValue: number | null = null;
		if (comparisonMode === 'relative-first' && index > 0) {
			referenceValue = getNutrientValue(products[0], nutrientKey);
		} else if (comparisonMode === 'relative-best') {
			referenceValue = getBestValue(products, nutrientKey);
		}

		let diff: number | null = null;
		let diffFormatted = '';
		if (referenceValue != null && referenceValue !== value) {
			diff = calculatePercentageDiff(value, referenceValue);
			diffFormatted = `${percentageFormatter.format(diff)}%`;
		}

		const bestValue = getBestValue(products, nutrientKey);
		const worstValue = getWorstValue(products, nutrientKey);

		return {
			value,
			formatted,
			diff,
			diffFormatted,
			isBest: bestValue === value,
			isWorst: value === worstValue && products.length > 1
		};
	}

	// Get color class for difference indicator
	function getDiffColorClass(
		diff: number | null,
		isBest: boolean,
		isWorst: boolean,
		nutrientKey: string
	): string {
		if (isBest) return 'text-success font-semibold';
		if (isWorst) return 'text-error';
		if (diff == null) return '';

		const direction = getDirection(nutrientKey);

		if (direction === 'min') {
			return diff < 0 ? 'text-success' : 'text-warning';
		} else {
			return diff > 0 ? 'text-success' : 'text-warning';
		}
	}

	function getNutriScoreImage(grade: string | null | undefined) {
		return KP_ATTRIBUTE_IMG('nutriscore-' + (grade ?? 'unknown') + '-new-en.svg');
	}

	function getNovaImage(group: string | number | null | undefined) {
		return group
			? KP_ATTRIBUTE_IMG('nova-group-' + group + '.svg')
			: KP_ATTRIBUTE_IMG('nova-group-unknown.svg');
	}

	function getGreenScoreImage(grade: string | null | undefined) {
		return KP_ATTRIBUTE_IMG('greenscore-' + (grade ?? 'unknown') + '.svg');
	}

	// Number formatters
	const integerFormatter = new Intl.NumberFormat(undefined, {
		maximumFractionDigits: 0
	});

	const decimalFormatter = new Intl.NumberFormat(undefined, {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	});

	// Helper to format nutrient values
	function formatNutrient(value: number | undefined | null, useDecimals = true): string {
		if (value === undefined || value === null) {
			return '-';
		}
		if (!useDecimals) {
			return integerFormatter.format(value);
		}
		return decimalFormatter.format(value);
	}

	// Calculate percentage difference between two values
	function calculatePercentageDiff(value: number, reference: number): number {
		if (reference === 0) return 0;
		return ((value - reference) / reference) * 100;
	}

	const percentageFormatter = new Intl.NumberFormat(undefined, {
		maximumFractionDigits: 0,
		signDisplay: 'exceptZero'
	});

	// Get score comparison
	function getScoreComparison(
		grade: string | undefined,
		products: Product[],
		scoreType: 'nutriscore' | 'ecoscore'
	): { isBest: boolean; isWorst: boolean } {
		if (!grade) return { isBest: false, isWorst: false };

		const grades = products
			.map((p) => (scoreType === 'nutriscore' ? p.nutriscore_grade : p.ecoscore_grade))
			.filter((g): g is string => g != null);

		if (grades.length <= 1) return { isBest: false, isWorst: false };

		const gradeOrder = ['a', 'b', 'c', 'd', 'e'];
		const currentIndex = gradeOrder.indexOf(grade.toLowerCase());
		const indices = grades.map((g) => gradeOrder.indexOf(g.toLowerCase()));

		const bestIndex = Math.min(...indices);
		const worstIndex = Math.max(...indices);

		return {
			isBest: currentIndex === bestIndex && currentIndex !== -1,
			isWorst: currentIndex === worstIndex && currentIndex !== -1 && grades.length > 1
		};
	}

	// Get Nova score comparison (lower is better)
	function getNovaComparison(
		novaGroup: number | undefined,
		products: Product[]
	): { isBest: boolean; isWorst: boolean } {
		if (!novaGroup) return { isBest: false, isWorst: false };

		const groups = products.map((p) => p.nova_group).filter((g): g is number => g != null);

		if (groups.length <= 1) return { isBest: false, isWorst: false };

		const bestGroup = Math.min(...groups);
		const worstGroup = Math.max(...groups);

		return {
			isBest: novaGroup === bestGroup,
			isWorst: novaGroup === worstGroup
		};
	}

	let dragSrcIndex: { code: string; idx: number } | null = null;
</script>

{#snippet scoreImage(imageSrc: string, altText: string, isBest: boolean)}
	<div class="flex flex-col items-center gap-1">
		<img src={imageSrc} alt={altText} title={altText} class="h-12" />
		{#if isBest}
			<span class="badge badge-success badge-sm">{$_('compare.best')}</span>
		{/if}
	</div>
{/snippet}

{#snippet nutrientValue(
	comparison: NutrientComparison,
	unit: string | undefined,
	nutrientKey: string
)}
	{#if comparison.value != null}
		<div class="flex items-center gap-2">
			<span class={comparison.isBest ? 'font-semibold' : ''}>
				{comparison.formatted}
				{unit}
			</span>
			{#if comparison.isBest}
				<span class="badge badge-success badge-sm">{$_('compare.best')}</span>
			{:else if comparison.isWorst}
				<span class="badge badge-error badge-sm">{$_('compare.worst')}</span>
			{/if}
			{#if comparison.diffFormatted && comparisonMode !== 'absolute'}
				<span
					class="font-mono text-xs {getDiffColorClass(
						comparison.diff,
						comparison.isBest,
						comparison.isWorst,
						nutrientKey
					)}"
				>
					{comparison.diffFormatted}
				</span>
			{/if}
		</div>
	{/if}
{/snippet}

{#snippet nutrientValueDesktop(
	comparison: NutrientComparison,
	unit: string | undefined,
	nutrientKey: string
)}
	{#if comparison.value != null}
		<div class="flex flex-col">
			<span class={comparison.isBest ? 'font-semibold' : ''}>
				{comparison.formatted}
				{unit}
				{#if comparison.isBest}
					<span class="badge badge-success badge-sm ml-1">{$_('compare.best')}</span>
				{:else if comparison.isWorst}
					<span class="badge badge-error badge-sm ml-1">{$_('compare.worst')}</span>
				{/if}
			</span>
			{#if comparison.diffFormatted && comparisonMode !== 'absolute'}
				<span
					class="font-mono text-xs {getDiffColorClass(
						comparison.diff,
						comparison.isBest,
						comparison.isWorst,
						nutrientKey
					)}"
				>
					{comparison.diffFormatted}
				</span>
			{/if}
		</div>
	{:else}
		-
	{/if}
{/snippet}

<!-- Mobile: Card View -->
<div class="block lg:hidden">
	<div class="flex flex-col gap-4">
		{#each products as product, index (product.code)}
			<div class="relative rounded-lg border-2 p-4 shadow-md">
				{#if !readonly && onRemoveProduct}
					<button
						class="btn btn-circle btn-sm btn-soft btn-error absolute top-2 right-2 z-10"
						onclick={() => onRemoveProduct(product.code)}
						aria-label="Remove product from comparison"
					>
						<IconMdiClose class="block h-4 w-4" />
					</button>
				{/if}

				<div class="flex flex-col items-center pt-4">
					{#if product.image_front_small_url}
						<img
							src={product.image_front_small_url}
							alt={product.product_name ?? product.code}
							class="mb-2 h-24 object-contain"
						/>
					{/if}
					<h3 class="mt-2 text-center font-semibold">
						<a href={`/products/${product.code}`} class="link">
							{product.product_name ?? product.code}
						</a>
					</h3>
					<p class="text-base-content/70 mt-1 text-center text-sm">
						{product.brands ?? ''}
						{#if product.brands && product.quantity},{/if}
						{product.quantity ?? ''}
					</p>
				</div>

				{#if product.nutriscore_grade || product.nova_group || product.ecoscore_grade}
					<div class="mt-4 border-t pt-4">
						<p class="mb-2 text-sm font-semibold">{$_('compare.scores')}</p>
						<div class="flex items-center justify-around gap-2">
							{#if product.nutriscore_grade}
								{@const comparison = getScoreComparison(
									product.nutriscore_grade,
									products,
									'nutriscore'
								)}
								{@render scoreImage(
									getNutriScoreImage(product.nutriscore_grade),
									`Nutri-Score ${product.nutriscore_grade.toUpperCase()}`,
									comparison.isBest
								)}
							{/if}
							{#if product.nova_group}
								{@const comparison = getNovaComparison(product.nova_group, products)}
								{@render scoreImage(
									getNovaImage(product.nova_group),
									`Ultra-processing level ${product.nova_group}`,
									comparison.isBest
								)}
							{/if}
							{#if product.ecoscore_grade}
								{@const comparison = getScoreComparison(
									product.ecoscore_grade,
									products,
									'ecoscore'
								)}
								{@render scoreImage(
									getGreenScoreImage(product.ecoscore_grade),
									`Green-Score ${product.ecoscore_grade.toUpperCase()}`,
									comparison.isBest
								)}
							{/if}
						</div>
					</div>
				{/if}

				{#if product.nutriments}
					<div class="mt-4 border-t pt-4">
						<p class="mb-2 text-sm font-semibold">{$_('compare.nutrients_per_100g')}</p>
						<div class="space-y-1 text-sm">
							{#each availableNutrients as nutrient (nutrient.key)}
								{@const comparison = getNutrientComparison(product, nutrient.key, products, index)}
								{#if comparison.value != null}
									<div class="flex items-center justify-between">
										<span class="font-medium">{nutrient.label}:</span>
										{@render nutrientValue(comparison, nutrient.unit, nutrient.key)}
									</div>
								{/if}
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<!-- Desktop: Table View -->
<div class="hidden overflow-x-auto lg:block">
	<table class="table-zebra table w-full table-fixed">
		<thead>
			<tr>
				<th class="bg-base-100 sticky left-0 z-10 w-40"></th>
				{#each products as product, index (product.code)}
					<th
						animate:flip={{ duration: 300 }}
						class="relative min-w-40"
						ondragover={(e) => {
							if (
								!readonly &&
								onReorderProduct &&
								dragSrcIndex &&
								dragSrcIndex.code !== product.code
							) {
								e.preventDefault();
								onReorderProduct(dragSrcIndex.idx, index);
								dragSrcIndex = { code: product.code, idx: index };
							}
						}}
						ondrop={(e) => e.preventDefault()}
					>
						<div class="flex flex-row-reverse">
							{#if !readonly && (onReorderProduct || onRemoveProduct)}
								<div class="mb-2 flex flex-col items-center justify-center gap-1">
									{#if onRemoveProduct}
										<button
											class="btn btn-soft btn-sm btn-square btn-error transition-all"
											onclick={() => onRemoveProduct(product.code)}
											aria-label="Remove product"
											title="Remove product"
										>
											<IconMdiClose class="h-5 w-5" />
										</button>
									{/if}
									{#if onReorderProduct}
										<button
											class="btn btn-soft btn-sm btn-square btn-primary cursor-grab active:cursor-grabbing"
											draggable="true"
											ondragstart={() => {
												dragSrcIndex = { code: product.code, idx: index };
											}}
											ondragend={() => {
												dragSrcIndex = null;
											}}
											aria-label="Drag to reorder"
											title="Drag to reorder"
										>
											<IconMdiDrag class="h-5 w-5" />
										</button>
									{/if}
								</div>
							{/if}
							{#if product.image_front_small_url}
								<BlurredImageDisplay
									src={product.image_front_small_url}
									alt={product.product_name ?? product.code}
									class="mx-auto mb-2 aspect-square w-8/12 rounded-xl"
								/>
							{/if}
						</div>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			<tr>
				<td class="bg-base-100 sticky left-0 w-40 font-semibold">{$_('compare.name')}</td>
				{#each products as product (product.code)}
					<td class="text-center text-sm" animate:flip={{ duration: 300 }}>
						{product.product_name ?? '-'}
					</td>
				{/each}
			</tr>
			<tr>
				<td class="bg-base-100 sticky left-0 w-40 font-semibold">{$_('compare.code_barcode')}</td>
				{#each products as product (product.code)}
					<td class="text-center font-mono text-sm" animate:flip={{ duration: 300 }}>
						{product.code}
					</td>
				{/each}
			</tr>
			<tr>
				<td class="bg-base-100 sticky left-0 w-40 font-semibold">{$_('compare.brand')}</td>
				{#each products as product (product.code)}
					<td class="text-center text-sm" animate:flip={{ duration: 300 }}>
						{product.brands ?? '-'}
					</td>
				{/each}
			</tr>
			<tr>
				<td class="bg-base-100 sticky left-0 w-40 font-semibold">{$_('compare.quantity')}</td>
				{#each products as product (product.code)}
					<td class="text-center text-sm" animate:flip={{ duration: 300 }}>
						{product.quantity ?? '-'}
					</td>
				{/each}
			</tr>
			<tr>
				<td class="bg-base-100 sticky left-0 w-40 font-semibold">{$_('nutriscore')}</td>
				{#each products as product (product.code)}
					{@const comparison = getScoreComparison(product.nutriscore_grade, products, 'nutriscore')}
					<td animate:flip={{ duration: 300 }}>
						{#if product.nutriscore_grade}
							{@render scoreImage(
								getNutriScoreImage(product.nutriscore_grade),
								`Nutri-Score ${product.nutriscore_grade.toUpperCase()}`,
								comparison.isBest
							)}
						{:else}
							-
						{/if}
					</td>
				{/each}
			</tr>
			<tr>
				<td class="bg-base-100 sticky left-0 w-40 font-semibold">{$_('compare.nova_group')}</td>
				{#each products as product (product.code)}
					{@const comparison = getNovaComparison(product.nova_group, products)}
					<td animate:flip={{ duration: 300 }}>
						{#if product.nova_group}
							{@render scoreImage(
								getNovaImage(product.nova_group),
								`Nova Group ${product.nova_group}`,
								comparison.isBest
							)}
						{:else}
							-
						{/if}
					</td>
				{/each}
			</tr>
			<tr>
				<td class="bg-base-100 sticky left-0 w-40 font-semibold">{$_('ecoscore')}</td>
				{#each products as product (product.code)}
					{@const comparison = getScoreComparison(product.ecoscore_grade, products, 'ecoscore')}
					<td animate:flip={{ duration: 300 }}>
						{#if product.ecoscore_grade}
							{@render scoreImage(
								getGreenScoreImage(product.ecoscore_grade),
								`Eco-Score ${product.ecoscore_grade.toUpperCase()}`,
								comparison.isBest
							)}
						{:else}
							-
						{/if}
					</td>
				{/each}
			</tr>
			<tr>
				<td class="bg-base-100 sticky left-0 w-40 font-semibold">{$_('compare.num_additives')}</td>
				{#each products as product (product.code)}
					<td class="text-center" animate:flip={{ duration: 300 }}>
						{product.additives_n ?? '-'}
					</td>
				{/each}
			</tr>
			<tr class="bg-base-200">
				<td></td>
				<td colspan={products.length} class="sticky left-0 text-center font-bold">
					{$_('compare.nutritional_values_per_100g')}
				</td>
			</tr>
			{#each availableNutrients as nutrient (nutrient.key)}
				<tr>
					<td
						class="bg-base-100 sticky left-0 w-40 overflow-hidden leading-tight font-semibold break-words whitespace-normal"
						>{nutrient.label}</td
					>
					{#each products as product, index (product.code)}
						{@const comparison = getNutrientComparison(product, nutrient.key, products, index)}
						<td animate:flip={{ duration: 300 }}>
							{@render nutrientValueDesktop(comparison, nutrient.unit, nutrient.key)}
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if comparisonMode === 'relative-first'}
	<div class="text-base-content/70 mt-4 text-center text-sm">
		{$_('compare.hint_relative_first')}
	</div>
{:else if comparisonMode === 'relative-best'}
	<div class="text-base-content/70 mt-4 text-center text-sm">
		{$_('compare.hint_relative_best')}
	</div>
{/if}
