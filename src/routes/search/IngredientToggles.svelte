<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { IngredientTogglesState, TriStateToggle } from '$lib/advancedSearch';
	import IconMdiFlask from '@iconify-svelte/mdi/flask';
	import IconMdiLeaf from '@iconify-svelte/mdi/leaf';

	type Props = {
		toggles: IngredientTogglesState;
		onUpdate: (updated: IngredientTogglesState) => void;
	};

	let { toggles, onUpdate }: Props = $props();

	function handleAdditiveChange(val: TriStateToggle) {
		onUpdate({ ...toggles, additives: val });
	}

	function handlePalmOilChange(val: TriStateToggle) {
		onUpdate({ ...toggles, palmOil: val });
	}

	function handleMaybePalmOilChange(val: TriStateToggle) {
		onUpdate({ ...toggles, maybePalmOil: val });
	}
</script>

<div class="flex flex-col gap-3 rounded-2xl border border-base-300 bg-base-200/50 p-4">
	<h4 class="flex items-center gap-2 text-base font-bold text-base-content">
		<IconMdiLeaf class="h-5 w-5 text-primary" />
		{$_('advanced_search.ingredients_section_title', { default: 'Ingredients' })}
	</h4>

	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		<!-- 1. Additives Tri-State Toggle -->
		<div class="flex flex-col gap-2 rounded-xl border border-base-300 bg-base-100 p-3 shadow-xs">
			<div class="flex items-center gap-1.5 text-sm font-semibold text-base-content">
				<IconMdiFlask class="h-4 w-4 text-base-content/70" />
				{$_('advanced_search.additives_title', { default: 'Additives' })}
			</div>
			<div class="join w-full">
				<button
					type="button"
					onclick={() => handleAdditiveChange('without')}
					class="btn join-item flex-1 font-medium btn-xs {toggles.additives === 'without'
						? 'text-success-content btn-success'
						: 'border-base-300 btn-outline'}"
				>
					{$_('advanced_search.without', { default: 'Without' })}
				</button>
				<button
					type="button"
					onclick={() => handleAdditiveChange('with')}
					class="btn join-item flex-1 font-medium btn-xs {toggles.additives === 'with'
						? 'text-warning-content btn-warning'
						: 'border-base-300 btn-outline'}"
				>
					{$_('advanced_search.with', { default: 'With' })}
				</button>
				<button
					type="button"
					onclick={() => handleAdditiveChange('indifferent')}
					class="btn join-item flex-1 font-medium btn-xs {toggles.additives === 'indifferent'
						? 'text-neutral-content btn-neutral'
						: 'border-base-300 btn-outline'}"
				>
					{$_('advanced_search.indifferent', { default: 'Indifferent' })}
				</button>
			</div>
		</div>

		<!-- 2. Palm Oil Tri-State Toggle -->
		<div class="flex flex-col gap-2 rounded-xl border border-base-300 bg-base-100 p-3 shadow-xs">
			<div class="flex items-center gap-1.5 text-sm font-semibold text-base-content">
				<IconMdiLeaf class="h-4 w-4 text-base-content/70" />
				{$_('advanced_search.palm_oil_title', { default: 'Ingredients from palm oil' })}
			</div>
			<div class="join w-full">
				<button
					type="button"
					onclick={() => handlePalmOilChange('without')}
					class="btn join-item flex-1 font-medium btn-xs {toggles.palmOil === 'without'
						? 'text-success-content btn-success'
						: 'border-base-300 btn-outline'}"
				>
					{$_('advanced_search.without', { default: 'Without' })}
				</button>
				<button
					type="button"
					onclick={() => handlePalmOilChange('with')}
					class="btn join-item flex-1 font-medium btn-xs {toggles.palmOil === 'with'
						? 'text-warning-content btn-warning'
						: 'border-base-300 btn-outline'}"
				>
					{$_('advanced_search.with', { default: 'With' })}
				</button>
				<button
					type="button"
					onclick={() => handlePalmOilChange('indifferent')}
					class="btn join-item flex-1 font-medium btn-xs {toggles.palmOil === 'indifferent'
						? 'text-neutral-content btn-neutral'
						: 'border-base-300 btn-outline'}"
				>
					{$_('advanced_search.indifferent', { default: 'Indifferent' })}
				</button>
			</div>
		</div>

		<!-- 3. Maybe Palm Oil Tri-State Toggle -->
		<div
			class="flex flex-col gap-2 rounded-xl border border-base-300 bg-base-100 p-3 shadow-xs md:col-span-2 lg:col-span-1"
		>
			<div class="flex items-center gap-1.5 text-sm font-semibold text-base-content">
				<IconMdiLeaf class="h-4 w-4 text-base-content/70" />
				{$_('advanced_search.maybe_palm_oil_title', { default: 'May be from palm oil' })}
			</div>
			<div class="join w-full">
				<button
					type="button"
					onclick={() => handleMaybePalmOilChange('without')}
					class="btn join-item flex-1 font-medium btn-xs {toggles.maybePalmOil === 'without'
						? 'text-success-content btn-success'
						: 'border-base-300 btn-outline'}"
				>
					{$_('advanced_search.without', { default: 'Without' })}
				</button>
				<button
					type="button"
					onclick={() => handleMaybePalmOilChange('with')}
					class="btn join-item flex-1 font-medium btn-xs {toggles.maybePalmOil === 'with'
						? 'text-warning-content btn-warning'
						: 'border-base-300 btn-outline'}"
				>
					{$_('advanced_search.with', { default: 'With' })}
				</button>
				<button
					type="button"
					onclick={() => handleMaybePalmOilChange('indifferent')}
					class="btn join-item flex-1 font-medium btn-xs {toggles.maybePalmOil === 'indifferent'
						? 'text-neutral-content btn-neutral'
						: 'border-base-300 btn-outline'}"
				>
					{$_('advanced_search.indifferent', { default: 'Indifferent' })}
				</button>
			</div>
		</div>
	</div>
</div>
