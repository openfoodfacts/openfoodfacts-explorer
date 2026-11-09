<script lang="ts">
	import { resolve } from '$app/paths';
	import { _ } from '#lib/i18n/index.js';
	import type { KnowledgePanels } from '#lib/api/knowledgepanels.js';
	import type { ProductAttributeForScoringGroup } from '#lib/api/product.js';
	import { getEditActionHref } from '#lib/knowledgepanels/actions.js';
	import { calculateScore, type MatchStatus } from '#lib/scoring.js';
	import { getVisibleAttributes } from './visibleAttributes.js';
	import { SCORE_TILE_IDS } from './scoreTiles.js';
	import { getWebsiteCtx } from '#lib/stores/website.js';
	import {
		getPreference,
		personalizedSearch,
		type AttributePreference
	} from '#lib/stores/preferencesStore.js';
	import OverallScore from './OverallScore.svelte';
	import type { ProductGroupedAttributes } from './types';

	type Props = {
		groups: ProductGroupedAttributes[];
		defaultPreferences: AttributePreference[];
		panels: KnowledgePanels;
		code: string;
		part: 'tiles' | 'score';
	};

	const { groups, defaultPreferences, panels, code, part }: Props = $props();

	const websiteCtx = getWebsiteCtx();
	let tileAttributeIds = $derived(SCORE_TILE_IDS[$websiteCtx.flavor]);

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
		tileAttributeIds.flatMap((id) => allAttributes.filter((attr) => attr.id === id))
	);
	let visibleAttributes = $derived(getVisibleAttributes(groups, preferences, tileAttributeIds));
	let expanded = $state(false);
	const INITIAL_ATTRIBUTES = 4;
	let displayedAttributes = $derived(
		expanded ? visibleAttributes : visibleAttributes.slice(0, INITIAL_ATTRIBUTES)
	);

	function isMandatory(attribute: ProductGroupedAttributes['attributes'][number]): boolean {
		const group = groups.find((item) => item.attributes.includes(attribute));
		if (!group || !attribute.id) return false;
		const preference = getPreference(preferences, group.id, attribute.id);
		return preference?.type === 'attribute' && preference.value === 'mandatory';
	}

	function indicatorColor(attribute: ProductGroupedAttributes['attributes'][number]): string {
		if (attribute.status !== 'known' || attribute.match == null) return 'bg-base-content/40';
		if (attribute.match <= 10) return 'bg-error';
		if (attribute.match < 50) return 'bg-warning';
		return 'bg-success';
	}

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

{#snippet attributeList()}
	{#if visibleAttributes.length > 0}
		<ul
			class="mt-3 divide-y divide-base-content/15 border-t border-b border-base-content/15"
			aria-label={$_('product.score.attributes', { default: 'Your attributes' })}
		>
			{#each displayedAttributes as attribute (attribute.id)}
				<li class="flex items-center gap-3 py-2">
					<span
						class={['h-2 w-2 shrink-0 rounded-full', indicatorColor(attribute)]}
						aria-hidden="true"
					></span>
					{#if attribute.icon_url}<img
							src={attribute.icon_url}
							alt=""
							class="h-8 w-8 shrink-0 object-contain"
						/>{/if}
					<div class="min-w-0 flex-1">
						<p class="text-sm font-medium">{attribute.title ?? attribute.name}</p>
						{#if attribute.description_short}
							<p class="text-xs text-base-content/70">{attribute.description_short}</p>
						{/if}
					</div>
					{#if isMandatory(attribute)}<span class="badge badge-ghost badge-sm"
							>{$_('preferences.options.mandatory', { default: 'Mandatory' })}</span
						>{/if}
				</li>
			{/each}
		</ul>
		{#if visibleAttributes.length > INITIAL_ATTRIBUTES}
			<button
				type="button"
				class="btn mt-1 w-full btn-ghost btn-sm"
				aria-expanded={expanded}
				onclick={() => (expanded = !expanded)}
			>
				{expanded
					? $_('product.score.show_less', { default: 'Show less' })
					: $_('product.score.show_more', { default: 'Show more' })}
			</button>
		{/if}
	{/if}
{/snippet}

<div class="flex flex-col gap-2">
	{#if part === 'tiles' && tiles.length > 0}
		<div
			class={[
				'grid grid-cols-1 gap-2',
				tiles.length === 2 ? 'sm:grid-cols-2' : tiles.length > 2 ? 'sm:grid-cols-3' : ''
			]}
		>
			{#each tiles as tile (tile.id)}
				{@const addAction = getAddAction(tile)}
				<div
					class={[
						'flex items-center gap-3 rounded-box p-3 sm:block',
						GRADE_BACKGROUNDS[tile.grade ?? ''] ?? 'bg-base-content/5'
					]}
				>
					<img src={tile.icon_url} alt="" class="h-8 w-12 shrink-0 object-contain sm:w-auto" />
					<div class="min-w-0">
						<p class="text-sm leading-tight font-bold sm:mt-1.5">{tile.title}</p>
						{#if addAction}
							<a href={addAction.href} class="mt-0.5 block text-xs font-semibold text-secondary">
								{addAction.label}
							</a>
						{:else if tile.description_short}
							<p class="mt-0.5 text-xs text-base-content/75">{tile.description_short}</p>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
	{#if part === 'score' && showScore}
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
			{@render attributeList()}
		</OverallScore>
	{:else if part === 'score' && visibleAttributes.length > 0}
		<section class="rounded-box bg-base-content/5 p-4">
			<h2 class="font-semibold">
				{$_('product.score.attributes', { default: 'Your attributes' })}
			</h2>
			{@render attributeList()}
		</section>
	{/if}
</div>
