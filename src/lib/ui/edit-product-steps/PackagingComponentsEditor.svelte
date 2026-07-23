<script lang="ts">
	import { _ } from '$lib/i18n';
	// TODO: switch to SDK
	import type { Product, PackagingComponent } from '$lib/api';
	import { getTaxonomySuggestions } from '$lib/api';

	import IconMdiPlus from '@iconify-svelte/mdi/plus';
	import IconMdiDelete from '@iconify-svelte/mdi/delete';

	type Props = {
		product: Product;
	};

	let { product = $bindable() }: Props = $props();

	if (!product.packagings || product.packagings.length === 0) {
		product = { ...product, packagings: [createEmptyComponent()] };
	}

	function createEmptyComponent(): PackagingComponent {
		return {
			number_of_units: undefined,
			shape: { id: '', lc_name: '' },
			material: { id: '', lc_name: '' },
			recycling: { id: '', lc_name: '' },
			quantity_per_unit: '',
			weight_measured: undefined
		};
	}

	function addComponent() {
		product = { ...product, packagings: [...(product.packagings || []), createEmptyComponent()] };
	}

	function removeComponent(index: number) {
		if (!product.packagings || product.packagings.length <= 1) return;
		const updated = [...product.packagings];
		updated.splice(index, 1);
		product = { ...product, packagings: updated };
	}

	function updateComponent(index: number, field: keyof PackagingComponent, value: unknown) {
		if (!product.packagings) return;
		const updated = [...product.packagings];
		updated[index] = { ...updated[index], [field]: value };
		product = { ...product, packagings: updated };
	}

	function updateTaxonomyField(
		index: number,
		field: 'shape' | 'material' | 'recycling',
		value: string
	) {
		if (!product.packagings) return;
		const updated = [...product.packagings];
		updated[index] = {
			...updated[index],
			[field]: { id: value, lc_name: value }
		};
		product = { ...product, packagings: updated };
	}

	// Taxonomy Autocomplete State
	type TaxonomyFieldType = 'packaging_shapes' | 'packaging_materials' | 'packaging_recycling';

	const FIELD_TO_TAGTYPE: Record<'shape' | 'material' | 'recycling', TaxonomyFieldType> = {
		shape: 'packaging_shapes',
		material: 'packaging_materials',
		recycling: 'packaging_recycling'
	};

	let suggestionsCache: Record<string, string[]> = {};

	let activeSuggestions: Record<string, string[]> = $state({});
	let activeField: string | null = $state(null);

	let debounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};

	async function fetchSuggestions(
		field: 'shape' | 'material' | 'recycling',
		searchString: string,
		componentIndex: number
	) {
		const tagtype = FIELD_TO_TAGTYPE[field];
		const cacheKey = `${tagtype}:${searchString.toLowerCase()}`;
		const fieldKey = `${componentIndex}_${field}`;

		if (suggestionsCache[cacheKey]) {
			activeSuggestions = { ...activeSuggestions, [fieldKey]: suggestionsCache[cacheKey] };
			return;
		}

		const { data, error } = await getTaxonomySuggestions(
			fetch,
			tagtype,
			searchString || undefined,
			50
		);

		if (error || !data) {
			console.warn(`Failed to fetch suggestions for ${tagtype}:`, error);
			return;
		}

		const suggestions = data.suggestions ?? [];
		suggestionsCache[cacheKey] = suggestions;
		activeSuggestions = { ...activeSuggestions, [fieldKey]: suggestions };
	}

	function handleTaxonomyInput(
		index: number,
		field: 'shape' | 'material' | 'recycling',
		value: string
	) {
		const fieldKey = `${index}_${field}`;
		activeField = fieldKey;

		updateTaxonomyField(index, field, value);

		if (debounceTimers[fieldKey]) {
			clearTimeout(debounceTimers[fieldKey]);
		}

		debounceTimers[fieldKey] = setTimeout(() => {
			fetchSuggestions(field, value, index);
		}, 250);
	}

	function handleTaxonomyFocus(index: number, field: 'shape' | 'material' | 'recycling') {
		const fieldKey = `${index}_${field}`;
		activeField = fieldKey;

		// Fetch initial suggestions (no filter)
		const currentValue =
			product.packagings?.[index]?.[field]?.lc_name ||
			product.packagings?.[index]?.[field]?.id ||
			'';
		fetchSuggestions(field, currentValue, index);
	}

	function selectSuggestion(
		index: number,
		field: 'shape' | 'material' | 'recycling',
		suggestion: string
	) {
		updateTaxonomyField(index, field, suggestion);
		const fieldKey = `${index}_${field}`;
		activeField = null;
		activeSuggestions = { ...activeSuggestions, [fieldKey]: [] };
	}

	function handleTaxonomyBlur(index: number, field: 'shape' | 'material' | 'recycling') {
		const fieldKey = `${index}_${field}`;
		// Delay to allow click on suggestion to register
		setTimeout(() => {
			if (activeField === fieldKey) {
				activeField = null;
			}
		}, 200);
	}

	function getTaxonomyDisplayValue(
		component: PackagingComponent,
		field: 'shape' | 'material' | 'recycling'
	): string {
		const tag = component[field];
		if (!tag) return '';
		return tag.lc_name || tag.id || '';
	}
</script>

<div class="space-y-4">
	<div class="mb-4 rounded-md bg-base-200/50 p-3 text-xs sm:text-sm">
		<p class="label-text mb-2 font-semibold">
			{$_('product.edit.packaging_component.instructions_title', {
				default: 'Guidance for packaging parts:'
			})}
		</p>
		<ul class="list-disc space-y-1 pl-5 text-base-content/70">
			<li>
				<span class="font-medium"
					>{$_('product.edit.packaging_component.number_of_units', {
						default: 'Number of units'
					})}:</span
				>
				{$_('product.edit.packaging_component.number_of_units_desc', {
					default:
						'Enter the number of packaging units of the same shape and material contained in the product.'
				})}
			</li>
			<li>
				<span class="font-medium"
					>{$_('product.edit.packaging_component.shape', { default: 'Shape' })}:</span
				>
				{$_('product.edit.packaging_component.shape_desc', {
					default:
						'Enter the shape name listed in the recycling instructions if they are available, or select a shape.'
				})}
			</li>
			<li>
				<span class="font-medium"
					>{$_('product.edit.packaging_component.material', { default: 'Material' })}:</span
				>
				{$_('product.edit.packaging_component.material_desc', {
					default:
						'Enter the specific material if it can be determined (a material code inside a triangle can often be found on packaging parts), or a generic material (for instance plastic or metal) if you are unsure.'
				})}
			</li>
			<li>
				<span class="font-medium"
					>{$_('product.edit.packaging_component.recycling', { default: 'Recycling' })}:</span
				>
				{$_('product.edit.packaging_component.recycling_desc', {
					default: 'Enter recycling instructions only if they are listed on the product.'
				})}
			</li>
			<li>
				<span class="font-medium"
					>{$_('product.edit.packaging_component.weight_measured_label', {
						default: 'Weight of one empty unit'
					})}:</span
				>
				{$_('product.edit.packaging_component.weight_measured_desc', {
					default:
						'Remove any remaining food and wash and dry the packaging part before weighting. If possible, use a scale with 0.1g or 0.01g precision.'
				})}
			</li>
			<li>
				<span class="font-medium"
					>{$_('product.edit.packaging_component.quantity_per_unit_label', {
						default: 'Quantity of product contained per unit'
					})}:</span
				>
				{$_('product.edit.packaging_component.quantity_per_unit_desc', {
					default: 'Enter the net weight or net volume and indicate the unit (for example g or ml).'
				})}
			</li>
		</ul>
	</div>

	{#each product.packagings ?? [] as component, index (index)}
		<div class="rounded-lg border border-base-300 bg-base-100 p-4 shadow-sm">
			<div class="mb-3 flex items-center justify-between">
				<h3 class="label-text text-sm font-semibold sm:text-base">
					{index === 0
						? $_('product.edit.packaging_component.parts_title')
						: $_('product.edit.packaging_component.component_number', {
								values: { number: index + 1 }
							})}
				</h3>
				{#if (product.packagings?.length ?? 0) > 1}
					<button
						type="button"
						class="btn btn-ghost text-error btn-sm"
						onclick={() => removeComponent(index)}
						aria-label={$_('product.edit.packaging_component.remove_component')}
					>
						<IconMdiDelete class="h-4 w-4" />
						<span class="hidden sm:inline"
							>{$_('product.edit.packaging_component.remove_component')}</span
						>
					</button>
				{/if}
			</div>

			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				<div class="form-control w-full">
					<label class="label" for="packaging_{index}_units">
						<span class="label-text text-sm font-medium">
							{$_('product.edit.packaging_component.number_of_units')}
						</span>
					</label>
					<input
						id="packaging_{index}_units"
						type="number"
						min="1"
						class="input-bordered input w-full text-sm focus:border-primary focus:outline-none"
						value={component.number_of_units ?? ''}
						oninput={(e) => {
							const val = (e.currentTarget as HTMLInputElement).value;
							updateComponent(index, 'number_of_units', val ? Number(val) : undefined);
						}}
						placeholder={$_('product.edit.packaging_component.number_of_units_placeholder')}
					/>
				</div>

				<div class="form-control relative w-full">
					<label class="label" for="packaging_{index}_shape">
						<span class="label-text text-sm font-medium">
							{$_('product.edit.packaging_component.shape')}
						</span>
					</label>
					<input
						id="packaging_{index}_shape"
						type="text"
						class="input-bordered input w-full text-sm focus:border-primary focus:outline-none"
						value={getTaxonomyDisplayValue(component, 'shape')}
						oninput={(e) =>
							handleTaxonomyInput(index, 'shape', (e.currentTarget as HTMLInputElement).value)}
						onfocus={() => handleTaxonomyFocus(index, 'shape')}
						onblur={() => handleTaxonomyBlur(index, 'shape')}
						placeholder={$_('product.edit.packaging_component.shape_placeholder')}
						autocomplete="off"
					/>
					{#if activeField === `${index}_shape` && (activeSuggestions[`${index}_shape`]?.length ?? 0) > 0}
						<ul
							class="absolute top-full z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-base-300 bg-base-100 shadow-lg"
						>
							{#each activeSuggestions[`${index}_shape`] ?? [] as suggestion (suggestion)}
								<li>
									<button
										type="button"
										class="w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors hover:bg-primary/10"
										onmousedown={(e) => {
											e.preventDefault();
											selectSuggestion(index, 'shape', suggestion);
										}}
									>
										{suggestion}
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<div class="form-control relative w-full">
					<label class="label" for="packaging_{index}_material">
						<span class="label-text text-sm font-medium">
							{$_('product.edit.packaging_component.material')}
						</span>
					</label>
					<input
						id="packaging_{index}_material"
						type="text"
						class="input-bordered input w-full text-sm focus:border-primary focus:outline-none"
						value={getTaxonomyDisplayValue(component, 'material')}
						oninput={(e) =>
							handleTaxonomyInput(index, 'material', (e.currentTarget as HTMLInputElement).value)}
						onfocus={() => handleTaxonomyFocus(index, 'material')}
						onblur={() => handleTaxonomyBlur(index, 'material')}
						placeholder={$_('product.edit.packaging_component.material_placeholder')}
						autocomplete="off"
					/>
					{#if activeField === `${index}_material` && (activeSuggestions[`${index}_material`]?.length ?? 0) > 0}
						<ul
							class="absolute top-full z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-base-300 bg-base-100 shadow-lg"
						>
							{#each activeSuggestions[`${index}_material`] ?? [] as suggestion (suggestion)}
								<li>
									<button
										type="button"
										class="w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors hover:bg-primary/10"
										onmousedown={(e) => {
											e.preventDefault();
											selectSuggestion(index, 'material', suggestion);
										}}
									>
										{suggestion}
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<div class="form-control relative w-full">
					<label class="label" for="packaging_{index}_recycling">
						<span class="label-text text-sm font-medium">
							{$_('product.edit.packaging_component.recycling')}
						</span>
					</label>
					<input
						id="packaging_{index}_recycling"
						type="text"
						class="input-bordered input w-full text-sm focus:border-primary focus:outline-none"
						value={getTaxonomyDisplayValue(component, 'recycling')}
						oninput={(e) =>
							handleTaxonomyInput(index, 'recycling', (e.currentTarget as HTMLInputElement).value)}
						onfocus={() => handleTaxonomyFocus(index, 'recycling')}
						onblur={() => handleTaxonomyBlur(index, 'recycling')}
						placeholder={$_('product.edit.packaging_component.recycling_placeholder')}
						autocomplete="off"
					/>
					{#if activeField === `${index}_recycling` && (activeSuggestions[`${index}_recycling`]?.length ?? 0) > 0}
						<ul
							class="absolute top-full z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-base-300 bg-base-100 shadow-lg"
						>
							{#each activeSuggestions[`${index}_recycling`] ?? [] as suggestion (suggestion)}
								<li>
									<button
										type="button"
										class="w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors hover:bg-primary/10"
										onmousedown={(e) => {
											e.preventDefault();
											selectSuggestion(index, 'recycling', suggestion);
										}}
									>
										{suggestion}
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<div class="form-control w-full">
					<label class="label" for="packaging_{index}_weight">
						<span class="label-text text-sm font-medium">
							{$_('product.edit.packaging_component.weight_measured')}
						</span>
					</label>
					<input
						id="packaging_{index}_weight"
						type="number"
						min="0"
						step="0.1"
						class="input-bordered input w-full text-sm focus:border-primary focus:outline-none"
						value={component.weight_measured ?? ''}
						oninput={(e) => {
							const val = (e.currentTarget as HTMLInputElement).value;
							updateComponent(index, 'weight_measured', val ? Number(val) : undefined);
						}}
						placeholder={$_('product.edit.packaging_component.weight_placeholder')}
					/>
				</div>

				<div class="form-control w-full">
					<label class="label" for="packaging_{index}_qty">
						<span class="label-text text-sm font-medium">
							{$_('product.edit.packaging_component.quantity_per_unit')}
						</span>
					</label>
					<input
						id="packaging_{index}_qty"
						type="text"
						class="input-bordered input w-full text-sm focus:border-primary focus:outline-none"
						value={component.quantity_per_unit ?? ''}
						oninput={(e) =>
							updateComponent(
								index,
								'quantity_per_unit',
								(e.currentTarget as HTMLInputElement).value
							)}
						placeholder={$_('product.edit.packaging_component.quantity_per_unit_placeholder')}
					/>
				</div>
			</div>
		</div>
	{/each}

	<button
		type="button"
		class="btn w-full btn-outline btn-primary btn-sm sm:w-auto"
		onclick={addComponent}
	>
		<IconMdiPlus class="h-4 w-4" />
		{$_('product.edit.packaging_component.add_component')}
	</button>

	<div class="form-control mt-2">
		<label class="label cursor-pointer justify-start gap-3">
			<input
				type="checkbox"
				class="checkbox checkbox-sm checkbox-primary"
				checked={product.packagings_complete === 1}
				onchange={(e) => {
					product = { ...product, packagings_complete: e.currentTarget.checked ? 1 : 0 };
				}}
			/>
			<span class="label-text text-sm">
				{$_('product.edit.packaging_component.all_listed')}
			</span>
		</label>
	</div>
</div>
