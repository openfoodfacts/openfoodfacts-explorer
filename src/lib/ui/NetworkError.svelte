<script lang="ts">
	import { _ } from '$lib/i18n';
	import { createEventDispatcher, onMount } from 'svelte';

	type Props = {
		errorDetails?: string;
	};
	let { errorDetails = '' }: Props = $props();

	const dispatch = createEventDispatcher<{ retry: void }>();

	let isOffline = $state(false);
	let showDetails = $state(false);

	onMount(() => {
		isOffline = !navigator.onLine;

		const handleOffline = () => (isOffline = true);
		const handleOnline = () => (isOffline = false);

		window.addEventListener('offline', handleOffline);
		window.addEventListener('online', handleOnline);

		return () => {
			window.removeEventListener('offline', handleOffline);
			window.removeEventListener('online', handleOnline);
		};
	});

	function retry() {
		dispatch('retry');
	}
</script>

<div class="flex flex-col gap-3">
	<h1 class="text-xl font-bold">{$_('errors.network.title')}</h1>

	{#if isOffline}
		<div class="alert alert-warning text-sm">
			<span>{$_('errors.network.offline')}</span>
		</div>
	{:else}
		<p class="text-sm">
			{$_('errors.network.message')}
		</p>
	{/if}

	<p class="text-sm">
		{$_('errors.network.instructions')}
		<a href="https://status.openfoodfacts.org/" target="_blank" rel="noopener" class="link">
			Open Food Facts Status Page
		</a>
	</p>

	<button class="btn btn-primary btn-sm w-fit" onclick={retry}>
		{$_('errors.network.retry')}
	</button>

	{#if errorDetails}
		<details bind:open={showDetails} class="mt-2">
			<summary class="text-base-content/60 hover:text-base-content cursor-pointer text-sm">
				{$_('errors.network.details')}
			</summary>
			<pre class="bg-base-200 mt-2 overflow-auto rounded p-3 text-xs">{errorDetails}</pre>
		</details>
	{/if}
</div>
