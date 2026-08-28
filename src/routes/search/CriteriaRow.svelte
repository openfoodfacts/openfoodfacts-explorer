<script lang="ts">
	import { _ } from '$lib/i18n';
	import { MASTER_FACET_CATALOG } from '$lib/facets';
	import type { AdvancedCriterion } from '$lib/advancedSearch';
	import IconMdiClose from '@iconify-svelte/mdi/close';

	type Props = {
		criterion: AdvancedCriterion;
		isLast: boolean;
		onUpdate: (updated: AdvancedCriterion) => void;
		onRemove: () => void;
		onToggleConnector: () => void;
	};

	let { criterion, isLast, onUpdate, onRemove, onToggleConnector }: Props = $props();

	function handleFacetChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		onUpdate({ ...criterion, facetKey: target.value });
	}

	function handleOperatorChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		onUpdate({
			...criterion,
			operator: target.value as 'contains' | 'does_not_contain'
		});
	}

	function handleValueInput(e: Event) {
		const target = e.target as HTMLInputElement;
		onUpdate({ ...criterion, value: target.value });
	}

	let catalogItem = $derived(
		MASTER_FACET_CATALOG.find((f) => f.key === criterion.facetKey) || MASTER_FACET_CATALOG[0]
	);
</script>

<div class="flex flex-col gap-2">
	<div
		class="flex flex-wrap items-center gap-2 rounded-xl border border-base-300 bg-base-100 p-2.5 shadow-sm transition hover:border-base-content/20"
	>
		<!-- 1. Criterion selector (All 35 master facets) -->
		<div class="w-full sm:w-auto sm:min-w-[170px]">
			<label class="sr-only" for={`criterion-facet-${criterion.id}`}
				>{$_('advanced_search.criterion_label', { default: 'Criterion' })}</label
			>
			<select
				id={`criterion-facet-${criterion.id}`}
				value={criterion.facetKey}
				onchange={handleFacetChange}
				class="select-bordered select w-full font-medium select-sm"
			>
				{#each MASTER_FACET_CATALOG as item (item.key)}
					<option value={item.key}>
						{$_(item.labelKey, { default: item.defaultLabel })}
					</option>
				{/each}
			</select>
		</div>

		<!-- 2. Operator selector (contains / does not contain) -->
		<div class="w-full sm:w-auto sm:min-w-[150px]">
			<label class="sr-only" for={`criterion-operator-${criterion.id}`}
				>{$_('advanced_search.operator_label', { default: 'Operator' })}</label
			>
			<select
				id={`criterion-operator-${criterion.id}`}
				value={criterion.operator}
				onchange={handleOperatorChange}
				class="select-bordered select w-full font-medium select-sm {criterion.operator ===
				'does_not_contain'
					? 'text-error'
					: 'text-success'}"
			>
				<option value="contains"
					>{$_('advanced_search.contains', { default: 'contains (+)' })}</option
				>
				<option value="does_not_contain"
					>{$_('advanced_search.does_not_contain', { default: 'does not contain (-)' })}</option
				>
			</select>
		</div>

		<!-- 3. Value input field -->
		<div class="relative min-w-[180px] flex-1">
			<label class="sr-only" for={`criterion-value-${criterion.id}`}
				>{$_('advanced_search.value_label', { default: 'Value' })}</label
			>
			<input
				id={`criterion-value-${criterion.id}`}
				type="text"
				value={criterion.value}
				oninput={handleValueInput}
				placeholder={catalogItem.placeholder ||
					$_('advanced_search.value_placeholder', { default: 'value...' })}
				class="input-bordered input w-full input-sm"
			/>
		</div>

		<!-- 4. Remove button -->
		<button
			type="button"
			onclick={onRemove}
			class="btn btn-square btn-ghost text-base-content/50 btn-xs hover:bg-error/10 hover:text-error"
			title={$_('advanced_search.remove_criterion', { default: 'Remove criterion' })}
		>
			<IconMdiClose class="h-4 w-4" />
		</button>
	</div>

	<!-- Logical connector to next criterion -->
	{#if !isLast}
		<div class="my-1 flex items-center justify-center gap-2">
			<div class="h-px flex-1 bg-base-300"></div>
			<div class="join shadow-xs">
				<button
					type="button"
					onclick={onToggleConnector}
					class="btn join-item font-bold btn-xs {criterion.nextConnector === 'AND'
						? 'btn-primary'
						: 'btn-ghost'}"
				>
					AND
				</button>
				<button
					type="button"
					onclick={onToggleConnector}
					class="btn join-item font-bold btn-xs {criterion.nextConnector === 'OR'
						? 'btn-secondary'
						: 'btn-ghost'}"
				>
					OR
				</button>
			</div>
			<div class="h-px flex-1 bg-base-300"></div>
		</div>
	{/if}
</div>
