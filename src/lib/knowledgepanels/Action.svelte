<script lang="ts">
	import type { KnowledgeElementAction } from '$lib/api';
	import { goto } from '$app/navigation';
	import { _ } from '$lib/i18n';
	import { NUTRIPATROL_URL } from '$lib/const';
	import { resolve } from '$app/paths';

	type Props = {
		element: KnowledgeElementAction;
		code?: string;
	};
	let { element, code: code }: Props = $props();

	function requireCode() {
		if (code == null) {
			throw new Error('This action requires a product code, but none was provided.');
		}
		return code;
	}

	const HANDLED_ACTIONS = [
		{
			type: 'edit_product',
			action: () => {
				goto(resolve(`/products/[barcode]/edit`, { barcode: requireCode() }));
			}
		},
		{
			type: 'add_categories',
			action: () => {
				goto(resolve(`/products/[barcode]/edit`, { barcode: requireCode() }) + '#categories');
			}
		},
		{
			type: 'report_product_to_nutripatrol',
			action: () => {
				const params = new URLSearchParams({
					barcode: requireCode(),
					source: 'web',
					flavor: 'off'
				});
				window.open(`${NUTRIPATROL_URL}/flag/product/?${params.toString()}`, '_blank');
			}
		},
		{
			type: 'add_ingredients_text',
			action: () => {
				goto(`/products/${requireCode()}/edit#ingredients`);
			}
		},
		{
			type: 'add_packaging_components',
			action: () => {
				goto(`/products/${requireCode()}/edit#packaging`);
			}
		}
	];

	const DEFAULT_ACTION = (action: string) => {
		console.warn(`No specific handler for action: ${action}`);
	};

	function getActionHandler(action: string) {
		const handler = HANDLED_ACTIONS.find((a) => a.type === action);
		return handler ? handler.action : DEFAULT_ACTION.bind(null, action);
	}

	function handleHtmlActionElementClick(event: MouseEvent) {
		// If the click was on a link, let it handle the navigation
		const target = event.target as HTMLElement;
		if (target.tagName === 'A' || target.closest('a')) {
			return;
		}
		// TODO
		console.warn('HTML action element clicked, but no handler is defined.', element);
	}
</script>

{#if element.action_element.html != ''}
	<button class="btn btn-primary" onclick={handleHtmlActionElementClick}>
		<!-- eslint-disable-next-line svelte/no-at-html-tags -->
		{@html element.action_element.html}
	</button>
{:else}
	{#each element.action_element.actions as action (action)}
		{@const actionHandler = getActionHandler(action)}

		<button class="btn btn-primary" onclick={actionHandler}>
			{$_(`product.knowledge_panels.action.${action}`, { default: action })}
		</button>
	{/each}
{/if}
