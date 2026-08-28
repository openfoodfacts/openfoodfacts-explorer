<script lang="ts">
	import { _ } from '$lib/i18n';
	import {
		createEmptyCriterion,
		createDefaultIngredientToggles,
		buildAdvancedLuceneQuery,
		parseAdvancedLuceneQuery,
		type AdvancedCriterion,
		type IngredientTogglesState
	} from '$lib/advancedSearch';
	import CriteriaRow from './CriteriaRow.svelte';
	import IngredientToggles from './IngredientToggles.svelte';
	import IconMdiPlus from '@iconify-svelte/mdi/plus';
	import IconMdiRefresh from '@iconify-svelte/mdi/refresh';
	import IconMdiMagnify from '@iconify-svelte/mdi/magnify';

	type Props = {
		currentQuery: string;
		onApplyQuery: (newQuery: string) => void;
	};

	let { currentQuery, onApplyQuery }: Props = $props();

	let parsedState = $derived(parseAdvancedLuceneQuery(currentQuery));
	let baseText = $state('');
	let criteriaList = $state<AdvancedCriterion[]>([]);
	let togglesState = $state<IngredientTogglesState>(createDefaultIngredientToggles());

	// Hydrate local state when currentQuery changes externally
	$effect(() => {
		baseText = parsedState.baseTextQuery;
		criteriaList = [...parsedState.criteria];
		togglesState = { ...parsedState.toggles };
	});

	function handleAddCriterion() {
		criteriaList = [...criteriaList, createEmptyCriterion()];
	}

	function handleRemoveCriterion(index: number) {
		criteriaList = criteriaList.filter((_, i) => i !== index);
		if (criteriaList.length === 0) {
			criteriaList = [createEmptyCriterion()];
		}
	}

	function handleUpdateCriterion(index: number, updated: AdvancedCriterion) {
		const next = [...criteriaList];
		next[index] = updated;
		criteriaList = next;
	}

	function handleToggleConnector(index: number) {
		const next = [...criteriaList];
		const currentConnector = next[index].nextConnector || 'AND';
		next[index] = {
			...next[index],
			nextConnector: currentConnector === 'AND' ? 'OR' : 'AND'
		};
		criteriaList = next;
	}

	function handleTogglesUpdate(updated: IngredientTogglesState) {
		togglesState = updated;
	}

	function handleApply() {
		const generatedQuery = buildAdvancedLuceneQuery(baseText, criteriaList, togglesState);
		onApplyQuery(generatedQuery);
	}

	function handleReset() {
		baseText = '';
		criteriaList = [createEmptyCriterion()];
		togglesState = createDefaultIngredientToggles();
		onApplyQuery('');
	}
</script>

<div class="flex flex-col gap-6">
	<!-- Section 1: Criteria Builder Header & Rows -->
	<div class="flex flex-col gap-3">
		<div class="flex flex-wrap items-center justify-between gap-2">
			<div>
				<h4 class="text-sm font-bold tracking-wider text-base-content/80 uppercase">
					{$_('advanced_search.criteria_title', { default: 'Criteria' })}
				</h4>
				<p class="text-xs text-base-content/60">
					{$_('advanced_search.criteria_help', {
						default:
							'Select products with specific brands, categories, labels, origins of ingredients, etc.'
					})}
				</p>
			</div>
			<button
				type="button"
				onclick={handleReset}
				class="btn btn-ghost text-base-content/70 btn-xs hover:text-error"
			>
				<IconMdiRefresh class="h-3.5 w-3.5" />
				{$_('advanced_search.reset_button', { default: 'Reset' })}
			</button>
		</div>

		<div class="flex flex-col gap-1">
			{#each criteriaList as criterion, index (criterion.id)}
				<CriteriaRow
					{criterion}
					isLast={index === criteriaList.length - 1}
					onUpdate={(updated) => handleUpdateCriterion(index, updated)}
					onRemove={() => handleRemoveCriterion(index)}
					onToggleConnector={() => handleToggleConnector(index)}
				/>
			{/each}
		</div>

		<div>
			<button
				type="button"
				onclick={handleAddCriterion}
				class="btn gap-1.5 border-dashed btn-outline btn-sm hover:border-primary hover:bg-primary/10"
			>
				<IconMdiPlus class="h-4 w-4" />
				{$_('advanced_search.add_criterion_button', { default: 'Add a criterion' })}
			</button>
		</div>
	</div>

	<!-- Section 2: Ingredients Tri-State Toggles -->
	<IngredientToggles toggles={togglesState} onUpdate={handleTogglesUpdate} />

	<!-- Section 3: Apply Button -->
	<div class="flex items-center justify-end">
		<button
			type="button"
			onclick={handleApply}
			class="btn px-6 font-bold shadow-xs btn-primary btn-sm"
		>
			<IconMdiMagnify class="h-4 w-4" />
			{$_('advanced_search.apply_button', { default: 'Search with filters' })}
		</button>
	</div>
</div>
