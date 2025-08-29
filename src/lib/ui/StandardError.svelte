<script lang="ts">
	import type { ProductStateError } from '$lib/api';
	import { _ } from '$lib/i18n';

	type Props = { error: globalThis.App.Error };
	let { error }: Props = $props();
	let { message, errors, actions } = $derived(error);

	function errorType(error: ProductStateError) {
		return error?.message?.id;
	}
</script>

{#snippet errorLi(error: ProductStateError)}
	<li class="ms-4 mb-2 list-none">
		<ul
			class="border-l-error-content grid grid-cols-[auto_auto] gap-x-2 border-l-2 ps-2 font-mono text-xs"
		>
			<span class="text-right">Impact ID:</span>
			<span>{error?.impact?.id ?? 'unknown'}</span>
			<span class="text-right">Message ID:</span>
			<span>{error?.message?.id ?? 'unknown'}</span>
			{#if error?.field}
				{@const field = error.field}
				<span class="text-right">Caused by:</span>
				<span>
					<code>{field.id ?? '<unknown field>'}</code> has value
					<code>{field.value ?? '<unknown value>'}</code>
				</span>
			{/if}
		</ul>
	</li>
{/snippet}

<div class="flex w-full flex-col">
	<h1 class="mb-3 text-xl font-bold">{message}</h1>

	{#if errors != null && errors.length > 0}
		{#if errors.map(errorType).some((it) => it === 'product_not_found')}
			<h2>{$_('general.product_not_found')}</h2>
		{:else}
			<p>
				{errors.length}
				{errors.length === 1 ? $_('general.error_occurred') : $_('general.errors_occurred')}
			</p>
			<ul class="list-disc">
				{#each errors as error, i (i)}
					{@render errorLi(error)}
				{/each}
			</ul>
		{/if}
	{/if}

	{#if actions != null}
		<div class="flex w-full gap-2">
			{#each actions as action, i (i)}
				{#if action.url}
					<a href={action.url} class="btn btn-primary btn-outline grow"> {action.label} </a>
				{:else}
					<p class="btn btn-primary btn-outline grow">
						{action.label}
					</p>
				{/if}
			{/each}
		</div>
	{/if}
</div>
