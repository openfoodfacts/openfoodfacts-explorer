<script lang="ts">
	import type { KnowledgeActionElement } from '#lib/api.js';
	import { goto } from '$app/navigation';
	import { _ } from '#lib/i18n/index.js';
	import { NUTRIPATROL_URL } from '#lib/const.js';
	import { getEditActionHref } from '#lib/knowledgepanels/actions.js';
	import HtmlPurify from '#lib/ui/HtmlPurify.svelte';
	import { trackOffEvent } from '#lib/analytics.js';

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

	function reportToNutripatrol() {
		trackOffEvent('feature', 'report_problem_opened', 'knowledge_panel');
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

	function getActionHandler(action: string) {
		if (action === 'report_product_to_nutripatrol') return reportToNutripatrol;
		return () => {
			const href = getEditActionHref(action, requireCode());
			if (href == null) {
				console.warn(`No specific handler for action: ${action}`);
				return;
			}
			goto(href);
		};
	}
</script>

<div
	class={[element.action_element.html != '' && 'rounded border-s border-accent bg-accent/10 p-4']}
>
	{#if element.action_element.html != ''}
		<div class="mb-4 text-sm">
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
