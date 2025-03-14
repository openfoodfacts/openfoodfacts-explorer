<script lang="ts">
	import type {
		KnowledgeActionElement,
		KnowledgePanel,
		KnowledgePanelElement as KnowledgePanelElementType
	} from '$lib/api';
	import Panel from './Panel.svelte';

	// URL constants
	const PRODUCT_EDIT_URL = 'https://world.openfoodfacts.org/product/';
	const PRODUCT_REPORT_URL = 'https://world.openfoodfacts.org/product/';

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

		// Check if this is a valid action element with actions
		if (
			element.element_type !== 'action' ||
			!element.action_element.actions ||
			element.action_element.actions.length === 0
		) {
			return;
		}

		// Show loading state
		isLoading = true;

		// Get the first action from the list (most cases will only have one action)
		const action = element.action_element.actions[0];

		// Handle known action types if product code is available
		if (productCode) {
			// Edit product action
			if (action === 'edit_product') {
				window.open(`${PRODUCT_EDIT_URL}${productCode}/edit`, '_blank');
			}
			// Report to NutriPatrol action
			else if (action === 'report_product_to_nutripatrol') {
				window.open(`${PRODUCT_REPORT_URL}${productCode}/edit#report_problem`, '_blank');
			}
			// Handle URLs directly
			else if (action.startsWith('http://') || action.startsWith('https://')) {
				window.open(action, '_blank');
			}
		}
		// If no product code but it's a URL, still try to open it
		else if (action.startsWith('http://') || action.startsWith('https://')) {
			window.open(action, '_blank');
		}

		// Process any additional actions if necessary
		if (element.action_element.actions.length > 1) {
			for (let i = 1; i < element.action_element.actions.length; i++) {
				const additionalAction = element.action_element.actions[i];
				// Handle direct URLs in additional actions
				if (additionalAction.startsWith('http://') || additionalAction.startsWith('https://')) {
					window.open(additionalAction, '_blank');
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
