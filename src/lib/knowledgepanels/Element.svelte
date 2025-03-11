<script lang="ts">
	import type { KnowledgeElement, KnowledgePanel } from '$lib/api';
	import Debug from '$lib/ui/Debug.svelte';

	import Panel from './Panel.svelte';
	import Map from './Map.svelte';
	import TextPanel from './TextElement.svelte';
	import PanelGroup from './PanelGroup.svelte';
	import ImageButton from '$lib/ui/ImageButton.svelte';
	import KnowledgePanelElement from './KnowledgePanelElement.svelte';

	type Props = {
		allPanels: Record<string, KnowledgePanel>;
		element: KnowledgeElement;
	};
	let { allPanels, element }: Props = $props();

	const BUTTON_ACTIONS_TITLES: Record<string, string> = {
		edit_product: 'Edit Product',
		report_product_to_nutripatrol: 'Report Product to NutriPatrol'
	};

	let isLoading = $state(false);

	function getButtonTitle(actions: string[]) {
		for (const action of actions) {
			if (BUTTON_ACTIONS_TITLES[action] != null) {
				return BUTTON_ACTIONS_TITLES[action];
			}
		}

		return actions.join(', ');
	}

	function handleActionClick(actions: string[], hasHtml: boolean, event: MouseEvent) {
		// If the action has HTML content and the click was on a link, let the link handle it
		if (hasHtml) {
			const target = event.target as HTMLElement;
			if (target.tagName === 'A' || target.closest('a')) {
				// Let the link handle the click
				return;
			}
		}

		if (!actions || actions.length === 0) {
			return;
		}

		// Show loading state
		isLoading = true;

		// Get the current product ID from the URL
		const urlParts = window.location.pathname.split('/');
		const productId = urlParts[urlParts.length - 1] || urlParts[urlParts.length - 2];

		// Handle different action types
		for (const action of actions) {
			switch (action) {
				case 'edit_product':
					if (productId) {
						window.open(`https://world.openfoodfacts.org/product/${productId}/edit`, '_blank');
					}
					break;

				case 'report_product_to_nutripatrol':
					if (productId) {
						// Direct to the edit page with focus on the report problem section
						window.open(
							`https://world.openfoodfacts.org/product/${productId}/edit#report_problem`,
							'_blank'
						);
					}
					break;

				default:
					// If not a known action, try to handle it as a URL if it looks like one
					if (action.startsWith('http://') || action.startsWith('https://')) {
						window.open(action, '_blank');
					}
			}
		}

		// Reset loading state after a short delay
		setTimeout(() => {
			isLoading = false;
		}, 1000);
	}
</script>

<div class="my-1">
	{#if element.element_type === 'panel_group'}
		<PanelGroup {element} {allPanels} />
	{:else if element.element_type === 'panel'}
		<KnowledgePanelElement {element} {allPanels} />
	{:else if element.element_type === 'text'}
		<TextPanel {element} />
	{:else if element.element_type === 'image'}
		<ImageButton src={element.image_element.url} alt={element.image_element.alt_text} />
	{:else if element.element_type === 'table'}
		<div class="overflow-x-auto">
			<table class="table-compact table w-full">
				<thead>
					<tr>
						<th></th>
						{#each element.table_element.columns as column}
							<th>{column.text}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each element.table_element.rows as row}
						<tr>
							<td></td>
							{#each row.values as cell}
								<td>{cell.text}</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else if element.element_type === 'action'}
		<button
			class="btn btn-primary {isLoading ? 'loading' : ''}"
			onclick={(event) =>
				handleActionClick(
					element.action_element.actions,
					element.action_element.html !== '',
					event
				)}
			disabled={isLoading}
		>
			{#if element.action_element.html != '' && !isLoading}
				<!-- eslint-disable-next-line svelte/no-at-html-tags -->
				{@html element.action_element.html}
			{:else if !isLoading}
				{getButtonTitle(element.action_element.actions)}
			{:else}
				Loading...
			{/if}
		</button>
	{:else if element.element_type === 'map'}
		<Map {element} />
	{:else}
		<div class="alert alert-warning">No renderer for element type!</div>
		<Debug data={element} />
	{/if}
</div>
