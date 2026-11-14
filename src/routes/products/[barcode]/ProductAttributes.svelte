<script lang="ts">
	import { resolve } from '$app/paths';
	import { _ } from '#lib/i18n/index.js';
	import type { ProductAttributeForScoringGroup } from '#lib/api/product.js';
	import { calculateScore } from '#lib/scoring.js';
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
	};

	const { groups, defaultPreferences }: Props = $props();

	const MATCH_STATUS_LABELS = $derived({
		very_good_match: $_('product.score.match_status.very_good_match', {
			default: 'Very good match'
		}),
		good_match: $_('product.score.match_status.good_match', { default: 'Good match' }),
		poor_match: $_('product.score.match_status.poor_match', { default: 'Poor match' }),
		may_not_match: $_('product.score.match_status.may_not_match', { default: 'May not match' }),
		does_not_match: $_('product.score.match_status.does_not_match', { default: 'Does not match' }),
		unknown_match: $_('product.score.match_status.unknown_match', { default: 'Unknown match' })
	});
	const websiteCtx = getWebsiteCtx();
	let tileAttributeIds = $derived(SCORE_TILE_IDS[$websiteCtx.flavor]);

	let scoringGroups = $derived(groups as ProductAttributeForScoringGroup[]);
	let hasPreferences = $derived($personalizedSearch.userPreferences.length > 0);
	let preferences = $derived(
		hasPreferences ? $personalizedSearch.userPreferences : defaultPreferences
	);
	let scoreData = $derived(calculateScore(scoringGroups, preferences));
	let showScore = $derived(scoreData.totalWeights > 0 && scoreData.matchStatus !== 'unknown_match');

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
</script>

{#snippet attributeList(attributes: ProductGroupedAttributes['attributes'])}
	<ul
		class="mt-3 divide-y divide-base-content/15 border-t border-b border-base-content/15"
		aria-label={$_('product.score.attributes', { default: 'Your attributes' })}
	>
		{#each attributes as attribute (attribute.id)}
			<li class="flex items-center gap-3 py-2">
				<span
					class={['h-2 w-2 shrink-0 rounded-full', indicatorColor(attribute)]}
					aria-hidden="true"
				></span>
				{#if attribute.icon_url}<img
						src={attribute.icon_url}
						alt=""
						loading="lazy"
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
{/snippet}

<div class="flex flex-col gap-2">
	{#if showScore}
		<OverallScore
			score={scoreData.score}
			matches={scoreData.matchStatus !== 'does_not_match'}
			title={hasPreferences
				? MATCH_STATUS_LABELS[scoreData.matchStatus]
				: $_('product.score.overall', { default: 'Overall score' })}
			linkLabel={hasPreferences
				? $_('product.score.edit_preferences', { default: 'Edit your preferences' })
				: $_('product.score.personalize', { default: 'Personalize' })}
			href={resolve('/settings')}
		>
			{#if visibleAttributes.length > 0}
				{@render attributeList(displayedAttributes)}
			{/if}
		</OverallScore>
	{:else}
		<section class="rounded-box bg-base-content/5 p-4">
			<div class="flex items-center justify-between gap-3">
				{#if visibleAttributes.length > 0}
					<h2 class="text-base font-semibold">
						{$_('product.score.attributes', { default: 'Your attributes' })}
					</h2>
				{/if}
				<a
					href={resolve('/settings')}
					class="max-w-[45%] text-right text-sm font-semibold text-secondary"
				>
					{hasPreferences
						? $_('product.score.edit_preferences', { default: 'Edit your preferences' })
						: $_('product.score.personalize', { default: 'Personalize' })}&nbsp;›
				</a>
			</div>
			{#if visibleAttributes.length > 0}
				{@render attributeList(displayedAttributes)}
			{/if}
		</section>
	{/if}
</div>
