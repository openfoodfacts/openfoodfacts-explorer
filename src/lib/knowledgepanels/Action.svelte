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
		productCode?: string;
	};
	let { allPanels, element, productCode }: Props = $props();

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

	/**
	 * Handles clicks on the action button.
	 *
	 * Special case: When an action element contains HTML content with links (<a> tags),
	 * we need to allow those links to function normally. This happens when knowledge panels
	 * include rich HTML content with clickable elements. In such cases, if the user clicks
	 * directly on a link within the button's HTML content, we want the link's default
	 * navigation behavior to work instead of triggering the button's action.
	 *
	 * @param event - The mouse event from the button click
	 */
	function handleActionClick(event: MouseEvent) {
		// If the action has HTML content and the click was on a link, let the link handle it
		if (element.element_type === 'action' && element.action_element.html !== '') {
			const target = event.target as HTMLElement;
			if (target.tagName === 'A' || target.closest('a')) {
				// Let the link handle the click
				return;
			}
		}

		if (
			element.element_type !== 'action' ||
			!element.action_element.actions ||
			element.action_element.actions.length === 0
		) {
			return;
		}

		// Show loading state
		isLoading = true;

		// Use the productCode prop instead of extracting from URL
		// Handle different action types
		for (const action of element.action_element.actions) {
			switch (action) {
				case 'edit_product':
					if (productCode) {
						window.open(`https://world.openfoodfacts.org/product/${productCode}/edit`, '_blank');
					}
					break;

				case 'report_product_to_nutripatrol':
					if (productCode) {
						// Direct to the edit page with focus on the report problem section
						window.open(
							`https://world.openfoodfacts.org/product/${productCode}/edit#report_problem`,
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
		onclick={handleActionClick}
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
			<Panel {panel} {allPanels} {id} {productCode} />
		{:else}
			<div class="alert alert-warning">Panel not found: {id}</div>
		{/if}
	{/if}
{/if}
