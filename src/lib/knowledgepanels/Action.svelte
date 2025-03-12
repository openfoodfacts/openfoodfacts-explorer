<script lang="ts">
	import type {
		KnowledgeActionElement,
		KnowledgePanel,
		KnowledgePanelElement as KnowledgePanelElementType
	} from '$lib/api';
	import Panel from './Panel.svelte';

	type Props = {
		allPanels: Record<string, KnowledgePanel>;
		element: KnowledgeActionElement | KnowledgePanelElementType;
	};
	let { allPanels, element }: Props = $props();

	// Action-related functionality
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

{#if element.element_type === 'action'}
	<button
		class="btn btn-primary {isLoading ? 'loading' : ''}"
		onclick={(event) =>
			handleActionClick(element.action_element.actions, element.action_element.html !== '', event)}
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
{:else if element.element_type === 'panel'}
	{#if 'panel_element' in element}
		{@const id = element.panel_element.panel_id}
		{@const panel = allPanels[id]}
		{#if panel !== null}
			<Panel {panel} {allPanels} {id} />
		{:else}
			<div class="alert alert-warning">Panel not found: {id}</div>
		{/if}
	{/if}
{/if}
