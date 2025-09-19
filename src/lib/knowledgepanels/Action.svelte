<script lang="ts">
	import type { KnowledgeElementAction } from '$lib/api';
	import { goto } from '$app/navigation';
	import { _ } from '$lib/i18n';
	import { NUTRIPATROL_URL } from '$lib/const';

	type Props = {
		element: KnowledgeElementAction;
		code?: string;
	};
	let { element, code: code }: Props = $props();

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
		if (element.action_element.html !== '') {
			const target = event.target as HTMLElement;
			if (target.tagName === 'A' || target.closest('a')) {
				// Let the link handle the click
				return;
			}
		}

		// Check if this is a valid action element with actions
		if (!element.action_element.actions || element.action_element.actions.length === 0) {
			return;
		}

		// Show loading state
		isLoading = true;

		// Get the first action from the list (most cases will only have one action)
		const action = element.action_element.actions[0];

		// Handle known action types if product code is available
		if (code != null && action === 'edit_product') {
			// Edit product action
			goto(`/products/${code}/edit`);
		} else if (code != null && action === 'add_categories') {
			goto(`/products/${code}/edit#categories`);
		}
		// Report to NutriPatrol action
		else if (code != null && action === 'report_product_to_nutripatrol') {
			const params = new URLSearchParams({
				barcode: code,
				source: 'web',
				flavor: 'off'
			});
			window.open(`${NUTRIPATROL_URL}/flag/product/?${params.toString()}`);
		}
		// Handle URLs directly
		else if (code != null && (action.startsWith('http://') || action.startsWith('https://'))) {
			window.open(action, '_blank');
		}
		// If no product code but it's a URL, still try to open it
		else if (action.startsWith('http://') || action.startsWith('https://')) {
			window.open(action, '_blank');
		} else {
			// If no specific action is defined, just log it or handle it as needed
			console.warn('No valid action found for the button:', action);
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
		{$_('general.loading')}
	{/if}
</button>
