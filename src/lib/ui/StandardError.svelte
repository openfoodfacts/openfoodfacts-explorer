<script lang="ts">
	import { _ } from '$lib/i18n';

	type Props = { error: globalThis.App.Error };
	let { error }: Props = $props();
	let { message, errors, actions } = $derived(error);
</script>

<div class="flex w-full flex-col">
	<h1 class="mb-3 text-xl font-bold">{message}</h1>

	{#if errors != null && errors.length > 0}
		<p class="mb-2">
			{errors.length}
			{errors.length === 1 ? $_('general.error_occurred') : $_('general.errors_occurred')}
		</p>
		<ul class="list-disc">
			{#each errors as error, i (i)}
				{#if typeof error === 'string'}
					<li class="border-l-error-content ms-4 mb-2 list-none border-l-2 ps-2 font-mono text-xs">
						{error}
					</li>
				{:else}
					<li class="ms-4 mb-2 list-none">
						<div class="border-l-error-content gap-x-2 border-l-2 ps-2 font-mono text-xs">
							<p>
								<span class="text-right">Impact ID:</span>
								<span>{error?.impact?.id ?? 'unknown'}</span>
							</p>
							<p>
								<span class="text-right">Message ID:</span>
								<span>{error?.message?.id ?? 'unknown'}</span>
							</p>
							{#if error?.field}
								{@const field = error.field}
								<p>
									<span class="text-right">Caused by:</span>
									<span>
										<code>{field.id ?? '<unknown field>'}</code> has value
										<code>{field.value ?? '<unknown value>'}</code>
									</span>
								</p>
							{/if}
						</div>
					</li>
				{/if}
			{/each}
		</ul>
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
