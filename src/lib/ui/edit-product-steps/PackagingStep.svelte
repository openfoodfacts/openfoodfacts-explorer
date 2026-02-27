<script lang="ts">
	import { _ } from '$lib/i18n';
	// TODO: switch to SDK
	import type { PackagingComponent } from '$lib/api';
	import { getTaxonomySuggestions, fileToBase64, uploadImageV3 } from '$lib/api';
	import { userInfo } from '$lib/stores/user';
	import { getToastCtx } from '$lib/stores/toasts';
	import { invalidateAll } from '$app/navigation';
	import { getLanguageName } from '$lib/languages';
	import ImageButton from '../ImageButton.svelte';

	import IconMdiPackageVariant from '@iconify-svelte/mdi/package-variant';
	import IconMdiHelpCircleOutline from '@iconify-svelte/mdi/help-circle-outline';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiInformationOutline from '@iconify-svelte/mdi/information';
	import IconMdiPlus from '@iconify-svelte/mdi/plus';
	import IconMdiDelete from '@iconify-svelte/mdi/delete';
	import IconMdiUpload from '@iconify-svelte/mdi/upload';
	import IconMdiCamera from '@iconify-svelte/mdi/camera';

	type Props = {
		packagings?: PackagingComponent[];
		packagingsComplete?: number;
		packagingText?: string;
		barcode?: string;
		lang?: string;
		getPackagingImage: (language: string) => string | null;
	};

	let {
		packagings = $bindable([]),
		packagingsComplete = $bindable(0),
		packagingText = $bindable(''),
		barcode = '',
		lang = 'en',
		getPackagingImage
	}: Props = $props();

	const toast = getToastCtx();
	let isUploading = $state(false);

	let currentLang = $derived(lang || 'en');

	let showInfo = $state(false);
	function toggleInfo() {
		showInfo = !showInfo;
	}

	if (!packagings || packagings.length === 0) {
		packagings = [createEmptyComponent()];
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
		packagings = [...(packagings || []), createEmptyComponent()];
	}

	function removeComponent(index: number) {
		if (!packagings || packagings.length <= 1) return;
		const updated = [...packagings];
		updated.splice(index, 1);
		packagings = updated;
	}

	function updateComponent(index: number, field: keyof PackagingComponent, value: unknown) {
		if (!packagings) return;
		const updated = [...packagings];
		updated[index] = { ...updated[index], [field]: value };
		packagings = updated;
	}

	async function handlePackagingImageUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		const files = Array.from(input.files);

		if ($userInfo == null) {
			toast.warning($_('product.edit.images.toast.login_required'));
			return;
		}

		isUploading = true;

		try {
			for (const file of files) {
				const base64Data = await fileToBase64(file);
				const imagefield = `packaging_${currentLang}`;
				const uploadResult = await uploadImageV3(
					window.fetch,
					barcode?.toString() || '',
					base64Data,
					imagefield
				);

				if (!uploadResult || uploadResult.error || !uploadResult.data) {
					toast.error($_('product.edit.images.toast.upload_failed_generic'));
					continue;
				}

				if (uploadResult.data?.status === 'success') {
					toast.success($_('product.edit.images.toast.upload_success'));
				} else {
					const errorMessages =
						uploadResult.data?.errors && uploadResult.data.errors.length > 0
							? uploadResult.data.errors.join(', ')
							: 'Unknown error';
					toast.error(
						$_('product.edit.images.toast.upload_failed', { values: { error: errorMessages } })
					);
				}
			}
			await invalidateAll();
		} catch (err) {
			console.error('Packaging image upload failed:', err);
			toast.error($_('product.edit.images.toast.upload_error'));
		} finally {
			isUploading = false;
			input.value = '';
		}
	}

	function triggerPackagingImageUpload() {
		const input = document.getElementById('packaging-image-upload') as HTMLInputElement;
		if (input) input.click();
	}

	function updateTaxonomyField(
		index: number,
		field: 'shape' | 'material' | 'recycling',
		value: string
	) {
		if (!packagings) return;
		const updated = [...packagings];
		updated[index] = {
			...updated[index],
			[field]: { id: value, lc_name: value }
		};
		packagings = updated;
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

		try {
			const suggestions = await getTaxonomySuggestions(
				fetch,
				tagtype,
				searchString || undefined,
				50
			);
			suggestionsCache[cacheKey] = suggestions;
			activeSuggestions = { ...activeSuggestions, [fieldKey]: suggestions };
		} catch (err) {
			console.warn(`Failed to fetch suggestions for ${tagtype}:`, err);
		}
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
			packagings?.[index]?.[field]?.lc_name || packagings?.[index]?.[field]?.id || '';
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

<h2
	class="text-primary mb-6 items-center justify-center gap-2 text-center text-base font-bold md:text-lg lg:text-xl xl:text-2xl"
>
	<IconMdiPackageVariant class="mr-1 h-6 w-6 align-middle" />
	{$_('product.edit.sections.packaging', { default: 'Packaging' })}
	<button type="button" class="ml-2 align-middle" aria-label="Info" onclick={toggleInfo}>
		<IconMdiHelpCircleOutline
			class="hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"
		/>
	</button>
</h2>
{#if showInfo}
	<div
		class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm"
	>
		<button
			type="button"
			class="hover:bg-primary/10 absolute top-2 right-2 m-2 rounded p-1"
			aria-label="Close"
			onclick={toggleInfo}
		>
			<IconMdiClose class="text-primary h-5 w-5" />
		</button>
		<IconMdiInformationOutline class="text-primary mt-0.5 h-6 w-6 flex-shrink-0" />
		<span class="text-base-content/80 p-6 text-sm sm:text-base">
			{$_('product.edit.info.packaging')}
		</span>
	</div>
{/if}

{@render imageUploadStep()}
{@render recyclingInstructionsStep()}
{@render componentsEditorStep()}

{#snippet imageUploadStep()}
	<div class="bg-base-100 border-base-300 mb-6 rounded-lg border p-4 shadow-sm">
		<div class="form-control w-full">
			<label class="label" for="packaging-image-upload">
				<span class="label-text flex items-center gap-2 text-sm font-semibold sm:text-base">
					<IconMdiCamera class="h-5 w-5" />
					{$_('product.edit.packaging_component.recycling_instructions')} picture ({getLanguageName(
						currentLang
					)})
				</span>
			</label>

			<div class="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start">
				<div class="flex-shrink-0">
					{#if getPackagingImage(currentLang)}
						<div class="border-base-300 relative h-48 w-48 overflow-hidden rounded-lg border">
							<ImageButton
								src={getPackagingImage(currentLang) ?? undefined}
								productCode={barcode}
								alt="Packaging"
							/>
						</div>
					{:else}
						<div
							class="border-base-300 bg-base-200 flex h-48 w-48 flex-col items-center justify-center rounded-lg border-2 border-dashed"
						>
							<p class="text-base-content/50 px-4 text-center text-xs italic">
								{$_('product.edit.packaging_component.no_packaging_image', {
									default: 'No packaging photo available'
								})}
							</p>
						</div>
					{/if}
				</div>

				<div class="flex flex-col gap-3">
					<p class="text-base-content/60 text-xs sm:text-sm">
						{$_('product.edit.packaging_component.packaging_photo_desc', {
							default:
								'Upload a photo specifically showing the packaging materials, recycling symbols, and instructions.'
						})}
					</p>

					<input
						id="packaging-image-upload"
						type="file"
						accept="image/*"
						multiple
						class="hidden"
						disabled={isUploading}
						onchange={handlePackagingImageUpload}
					/>

					<button
						type="button"
						class="btn btn-outline btn-sm self-start"
						class:loading={isUploading}
						disabled={isUploading}
						onclick={triggerPackagingImageUpload}
					>
						{#if isUploading}
							<span class="loading loading-spinner h-4 w-4"></span>
							<span>{$_('product.edit.images.uploading', { default: 'Uploading...' })}</span>
						{:else}
							<IconMdiUpload class="h-4 w-4" />
							<span
								>{$_('product.edit.packaging_component.upload_packaging_photo', {
									default: 'Upload packaging photo'
								})}</span
							>
						{/if}
					</button>

					<p class="text-base-content/50 mt-1 max-w-md text-[10px] sm:text-xs">
						{$_('product.edit.packaging_component.multiple_uploads_guidance')}
					</p>
				</div>
			</div>
		</div>
	</div>
{/snippet}

{#snippet recyclingInstructionsStep()}
	<div class="bg-base-100 border-base-300 mb-6 rounded-lg border p-4 shadow-sm">
		<div class="form-control w-full">
			<label class="label" for="packaging_text_main">
				<span class="label-text text-sm font-semibold sm:text-base">
					{$_('product.edit.packaging_component.recycling_instructions')}
					<span class="text-base-content/50 ml-1 font-normal">({currentLang})</span>
				</span>
			</label>
			<p class="text-base-content/60 mb-2 text-xs">
				{$_('product.edit.packaging_component.recycling_instructions_desc')}
			</p>
			<textarea
				id="packaging_text_main"
				class="textarea textarea-bordered h-24 w-full"
				placeholder={$_('product.edit.packaging_component.recycling_instructions_placeholder')}
				bind:value={packagingText}
			></textarea>
			<div class="mt-2 space-y-1">
				<p class="text-base-content/70 text-xs">
					&rarr; {$_('product.edit.packaging_component.recycling_instructions_list')}
				</p>
				<p class="text-base-content/70 text-xs">
					&rarr; {$_('product.edit.packaging_component.recycling_instructions_specificity')}
				</p>
				<p class="text-base-content/70 text-xs">
					&rarr; {$_('product.edit.packaging_component.recycling_instructions_combination')}
				</p>
				<p class="text-xs">
					<span class="text-success font-semibold"
						>{$_('product.edit.packaging_component.recycling_instructions_examples_label')}</span
					>
					<span class="text-success"
						>{$_('product.edit.packaging_component.recycling_instructions_examples')}</span
					>
				</p>
			</div>
		</div>
	</div>
{/snippet}

{#snippet componentsEditorStep()}
	<div class="space-y-4">
		{#each packagings ?? [] as component, index (index)}
			<div class="bg-base-100 border-base-300 rounded-lg border p-4 shadow-sm">
				<div class="mb-3 flex items-center justify-between">
					<h3 class="label-text text-sm font-semibold sm:text-base">
						{index === 0
							? $_('product.edit.packaging_component.parts_title')
							: $_('product.edit.packaging_component.component_number', {
									values: { number: index + 1 }
								})}
					</h3>
					{#if (packagings?.length ?? 0) > 1}
						<button
							type="button"
							class="btn btn-ghost btn-sm text-error"
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

				{#if index === 0}
					<div class="bg-base-200/50 mb-4 rounded-md p-3 text-xs sm:text-sm">
						<p class="label-text mb-2 font-semibold">
							{$_('product.edit.packaging_component.instructions_title')}
						</p>
						<ul class="text-base-content/70 list-disc space-y-1 pl-5">
							<li>
								<span class="font-medium"
									>{$_('product.edit.packaging_component.number_of_units')}:</span
								>
								{$_('product.edit.packaging_component.number_of_units_desc')}
							</li>
							<li>
								<span class="font-medium">{$_('product.edit.packaging_component.shape')}:</span>
								{$_('product.edit.packaging_component.shape_desc')}
							</li>
							<li>
								<span class="font-medium">{$_('product.edit.packaging_component.material')}:</span>
								{$_('product.edit.packaging_component.material_desc')}
							</li>
							<li>
								<span class="font-medium">{$_('product.edit.packaging_component.recycling')}:</span>
								{$_('product.edit.packaging_component.recycling_desc')}
							</li>
							<li>
								<span class="font-medium"
									>{$_('product.edit.packaging_component.weight_measured_label')}:</span
								>
								{$_('product.edit.packaging_component.weight_measured_desc')}
							</li>
							<li>
								<span class="font-medium"
									>{$_('product.edit.packaging_component.quantity_per_unit_label')}:</span
								>
								{$_('product.edit.packaging_component.quantity_per_unit_desc')}
							</li>
						</ul>
					</div>
				{/if}

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
							class="input input-bordered focus:border-primary w-full text-sm focus:outline-none"
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
							class="input input-bordered focus:border-primary w-full text-sm focus:outline-none"
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
								class="bg-base-100 border-base-300 absolute top-full z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border shadow-lg"
							>
								{#each activeSuggestions[`${index}_shape`] ?? [] as suggestion (suggestion)}
									<li>
										<button
											type="button"
											class="hover:bg-primary/10 w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors"
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
							class="input input-bordered focus:border-primary w-full text-sm focus:outline-none"
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
								class="bg-base-100 border-base-300 absolute top-full z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border shadow-lg"
							>
								{#each activeSuggestions[`${index}_material`] ?? [] as suggestion (suggestion)}
									<li>
										<button
											type="button"
											class="hover:bg-primary/10 w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors"
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
							class="input input-bordered focus:border-primary w-full text-sm focus:outline-none"
							value={getTaxonomyDisplayValue(component, 'recycling')}
							oninput={(e) =>
								handleTaxonomyInput(
									index,
									'recycling',
									(e.currentTarget as HTMLInputElement).value
								)}
							onfocus={() => handleTaxonomyFocus(index, 'recycling')}
							onblur={() => handleTaxonomyBlur(index, 'recycling')}
							placeholder={$_('product.edit.packaging_component.recycling_placeholder')}
							autocomplete="off"
						/>
						{#if activeField === `${index}_recycling` && (activeSuggestions[`${index}_recycling`]?.length ?? 0) > 0}
							<ul
								class="bg-base-100 border-base-300 absolute top-full z-50 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border shadow-lg"
							>
								{#each activeSuggestions[`${index}_recycling`] ?? [] as suggestion (suggestion)}
									<li>
										<button
											type="button"
											class="hover:bg-primary/10 w-full cursor-pointer px-3 py-2 text-left text-sm transition-colors"
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

					<!-- Weight -->
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
							class="input input-bordered focus:border-primary w-full text-sm focus:outline-none"
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
							class="input input-bordered focus:border-primary w-full text-sm focus:outline-none"
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
			class="btn btn-outline btn-primary btn-sm w-full sm:w-auto"
			onclick={addComponent}
		>
			<IconMdiPlus class="h-4 w-4" />
			{$_('product.edit.packaging_component.add_component')}
		</button>

		<div class="form-control mt-2">
			<label class="label cursor-pointer justify-start gap-3">
				<input
					type="checkbox"
					class="checkbox checkbox-primary checkbox-sm"
					checked={packagingsComplete === 1}
					onchange={(e) => {
						packagingsComplete = e.currentTarget.checked ? 1 : 0;
					}}
				/>
				<span class="label-text text-sm">
					{$_('product.edit.packaging_component.all_listed')}
				</span>
			</label>
		</div>
	</div>
{/snippet}
