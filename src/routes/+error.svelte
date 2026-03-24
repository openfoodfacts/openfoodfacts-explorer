<script lang="ts">
	import { page } from '$app/state';
	import { _ } from '$lib/i18n';
	import NetworkError from '$lib/ui/NetworkError.svelte';
	import StandardError from '$lib/ui/StandardError.svelte';
	import { ERROR_TYPES } from '$lib/errors';
	import { tracker } from '@sinnwerkstatt/sveltekit-matomo';

	import { ERR_PRODUCT_NOT_FOUND } from '$lib/api/errorUtils';

	let errorMessage = $derived(page.error?.message || '');
	let errorDetails = $derived(page.error?.errors || []);
	let isNetworkError = $derived(errorMessage === ERROR_TYPES.NETWORK_ERROR);

	let isGlobal404 = $derived(page.status === 404 && errorMessage !== ERR_PRODUCT_NOT_FOUND);

	$effect(() => {
		if (!isGlobal404) {
			for (const err of errorDetails) console.error('Error detail:', err);
		}

		// track the error event with Matomo
		$tracker?.trackEvent('Error', 'Error Occurred', errorMessage, errorDetails.length);
	});
</script>

<div class="flex min-h-[60vh] w-full flex-col items-center justify-center p-6">
	{#if isNetworkError}
		<NetworkError />
	{:else if isGlobal404}
		<div class="animate-in fade-in max-w-md text-center duration-500">
			<div class="mb-4 text-8xl grayscale-[20%]">🧭</div>
			<h1 class="mb-4 text-4xl font-bold">
				{$_('general.page_not_found', { default: 'Page Not Found' })}
			</h1>
			<p class="text-base-content/70 mb-8 text-lg">
				{$_('general.page_not_found_desc', {
					default: "We looked everywhere, but we couldn't find the page you requested."
				})}
			</p>
			<div class="flex justify-center gap-4">
				<a href="/" class="btn btn-primary btn-lg">
					{$_('general.return_home', { default: 'Return Home' })}
				</a>
			</div>
		</div>
	{:else if page.error != null}
		<StandardError error={page.error} />
	{:else}
		<p>{$_('general.unknown_error')}</p>
	{/if}
</div>
