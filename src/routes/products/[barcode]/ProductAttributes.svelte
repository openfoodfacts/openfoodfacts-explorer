<script lang="ts">
	import { resolve } from '$app/paths';
	import { _ } from '#lib/i18n/index.js';
	import type { KnowledgePanels } from '#lib/api/knowledgepanels.js';
	import type { ProductAttributeForScoringGroup } from '#lib/api/product.js';
	import { getEditActionHref } from '#lib/knowledgepanels/actions.js';
	import { calculateScore, getMismatchedAttributes, type MatchStatus } from '#lib/scoring.js';
	import { personalizedSearch, type AttributePreference } from '#lib/stores/preferencesStore.js';
	import OverallScore from './OverallScore.svelte';
	import type { ProductGroupedAttributes } from './types';

	type Props = {
		groups: ProductGroupedAttributes[];
		defaultPreferences: AttributePreference[];
		panels: KnowledgePanels;
		code: string;
	};

	const { groups, defaultPreferences, panels, code }: Props = $props();

	const TILE_ATTRIBUTE_IDS = ['nutriscore', 'nova', 'ecoscore'];

	const MATCH_STATUS_LABELS: Record<MatchStatus, string> = {
		very_good_match: 'Very good match',
		good_match: 'Good match',
		poor_match: 'Poor match',
		may_not_match: 'May not match',
		does_not_match: 'Does not match',
		unknown_match: 'Unknown match'
	};

	const GRADE_BACKGROUNDS: Record<string, string> = {
		a: 'bg-success/20',
		b: 'bg-success/20',
		c: 'bg-warning/20',
		d: 'bg-error/20',
		e: 'bg-error/20'
	};

	let scoringGroups = $derived(groups as ProductAttributeForScoringGroup[]);
	let hasPreferences = $derived($personalizedSearch.userPreferences.length > 0);
	let preferences = $derived(
		hasPreferences ? $personalizedSearch.userPreferences : defaultPreferences
	);
	let scoreData = $derived(calculateScore(scoringGroups, preferences));
	let showScore = $derived(scoreData.totalWeights > 0 && scoreData.matchStatus !== 'unknown_match');

	let allAttributes = $derived(groups.flatMap((group) => group.attributes));
	let tiles = $derived(
		TILE_ATTRIBUTE_IDS.flatMap((id) => allAttributes.filter((attr) => attr.id === id))
	);
	let mismatchedIds = $derived(
		hasPreferences ? getMismatchedAttributes(scoringGroups, preferences).map((attr) => attr.id) : []
	);
	let mismatches = $derived(
		allAttributes.filter(
			(attr) => mismatchedIds.includes(attr.id!) && !TILE_ATTRIBUTE_IDS.includes(attr.id!)
		)
	);

	function getAddAction(attribute: ProductGroupedAttributes['attributes'][number]) {
		if (attribute.status !== 'unknown' || attribute.panel_id == null) return undefined;
		const actions = (panels[attribute.panel_id]?.elements ?? []).flatMap((element) =>
			element.element_type === 'action' ? element.action_element.actions : []
		);
		// Photo actions are skipped: the server offers them even when the photo exists
		for (const action of actions) {
			const href = action.endsWith('_image') ? undefined : getEditActionHref(action, code);
			if (href != null) {
				return {
					href,
					label: $_(`product.knowledge_panels.action.${action}`, { default: action })
				};
			}
		}
		return undefined;
	}
</script>

<div class="flex flex-col gap-2">
	{#if showScore}
		<OverallScore
			score={scoreData.score}
			matches={scoreData.matchStatus !== 'does_not_match'}
			title={hasPreferences
				? $_(`product.score.match_status.${scoreData.matchStatus}`, {
						default: MATCH_STATUS_LABELS[scoreData.matchStatus]
					})
				: $_('product.score.overall', { default: 'Overall score' })}
			linkLabel={hasPreferences
				? $_('product.score.edit_preferences', { default: 'Edit your preferences' })
				: $_('product.score.personalize', { default: 'Personalize' })}
			href={resolve('/settings') + '?tab=preferences'}
		>
			{#if mismatches.length > 0}
				<ul class="mt-1 flex flex-wrap gap-x-3 text-sm text-base-content/70">
					{#each mismatches as attribute (attribute.id)}
						<li class="flex items-center gap-1">
							<img src={attribute.icon_url} alt="" class="h-4 w-auto" />
							{attribute.title}
						</li>
					{/each}
				</ul>
			{/if}
		</OverallScore>
	{/if}

	{#if tiles.length > 0}
		<div class="grid grid-cols-3 gap-2">
			{#each tiles as tile (tile.id)}
				{@const addAction = getAddAction(tile)}
				<div
					class={['rounded-box p-3', GRADE_BACKGROUNDS[tile.grade ?? ''] ?? 'bg-base-content/5']}
				>
					<img src={tile.icon_url} alt="" class="h-8 w-auto" />
					<p class="mt-1.5 text-sm leading-tight font-bold">{tile.title}</p>
					{#if addAction}
						<a href={addAction.href} class="mt-0.5 block text-xs font-semibold text-secondary">
							{addAction.label}
						</a>
					{:else if tile.description_short}
						<p class="mt-0.5 text-xs text-base-content/75">{tile.description_short}</p>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>
