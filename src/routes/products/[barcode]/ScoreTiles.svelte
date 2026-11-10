<script lang="ts">
	import { _ } from '#lib/i18n/index.js';
	import type { KnowledgePanels } from '#lib/api/knowledgepanels.js';
	import { getEditActionHref } from '#lib/knowledgepanels/actions.js';
	import { getWebsiteCtx } from '#lib/stores/website.js';
	import { SCORE_TILE_IDS } from './scoreTiles.js';
	import type { ProductGroupedAttributes } from './types';
	let {
		groups,
		panels,
		code
	}: { groups: ProductGroupedAttributes[]; panels: KnowledgePanels; code: string } = $props();
	const websiteCtx = getWebsiteCtx();
	let tileAttributeIds = $derived(SCORE_TILE_IDS[$websiteCtx.flavor]);
	let allAttributes = $derived(groups.flatMap((group) => group.attributes));
	let tiles = $derived(
		tileAttributeIds.flatMap((id) => allAttributes.filter((attr) => attr.id === id))
	);
	const GRADE_BACKGROUNDS: Record<string, string> = {
		a: 'bg-success/20',
		b: 'bg-success/20',
		c: 'bg-warning/20',
		d: 'bg-error/20',
		e: 'bg-error/20'
	};
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

{#if tiles.length > 0}
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
