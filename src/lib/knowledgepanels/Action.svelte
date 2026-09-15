<script lang="ts">
	import type { KnowledgeActionElement } from '$lib/api';
	import { goto } from '$app/navigation';
	import { _ } from '$lib/i18n';
	import { NUTRIPATROL_URL } from '$lib/const';
	import { resolve } from '$app/paths';
	import HtmlPurify from '$lib/ui/HtmlPurify.svelte';

	type Props = {
		element: KnowledgeActionElement;
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
				window.open(
					`${NUTRIPATROL_URL}/flag/product/?${params.toString()}`,
					'_blank',
					'noopener,noreferrer'
				);
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
				goto(`/products/${requireCode()}/edit#add-packaging-component`);
			}
		},
		{
			type: 'add_origins',
			action: () => {
				goto(`/products/${requireCode()}/edit#origins`);
			}
		},
		{
			type: 'add_recycling_instructions',
			action: () => {
				goto(`/products/${requireCode()}/edit#recycling`);
			}
		},
		{
			type: 'add_quantity',
			action: () => {
				goto(`/products/${requireCode()}/edit#quantity`);
			}
		},
		{
			type: 'add_packaging_image',
			action: () => {
				goto(`/products/${requireCode()}/edit#images`);
			}
		},
		{
			type: 'add_ingredients_image',
			action: () => {
				goto(`/products/${requireCode()}/edit#images`);
			}
		},
		{
			type: 'add_nutrition_facts',
			action: () => {
				goto(`/products/${requireCode()}/edit#nutrition`);
			}
		}
	];

	const DEFAULT_ACTION = (action: string) => {
		console.warn(`No specific handler for action: ${action}`);
	};

	function getActionHandler(action: string) {
		const handler = HANDLED_ACTIONS.find((a) => a.type === action);
		return handler ? handler.action : () => DEFAULT_ACTION(action);
	}
</script>

<div
	class={[element.action_element.html != '' && 'rounded border-s border-accent bg-accent/10 p-4']}
>
	{#if element.action_element.html != ''}
		<div class="kp-html-content mb-4 text-sm">
			<HtmlPurify dirty={element.action_element.html} />
		</div>
	{/if}

	{#if element.action_element.actions && element.action_element.actions.length > 0}
		<div class="flex flex-wrap gap-2">
			{#each element.action_element.actions as action (action)}
				{@const actionHandler = getActionHandler(action)}
				<button class="btn btn-primary btn-sm" onclick={actionHandler}>
					{$_(`product.knowledge_panels.action.${action}`, { default: action })}
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	:global(.kp-html-content img) {
		margin: 0;
	}

	@media (prefers-color-scheme: dark) {
		:global(.kp-html-content *:not(.allergen):not(.text_info)) {
			color: inherit !important;
		}

		:global(.kp-html-content img) {
			background-color: #fff;
			border-radius: 0.25rem;
		}
	}
</style>
