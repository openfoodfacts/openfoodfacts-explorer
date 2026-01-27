<script lang="ts">
	import { page } from '$app/state';
	import { _ } from '$lib/i18n';
	import NetworkError from '$lib/ui/NetworkError.svelte';
	import StandardError from '$lib/ui/StandardError.svelte';
	import { ERROR_TYPES } from '$lib/errors';
	import { tracker } from '@sinnwerkstatt/sveltekit-matomo';
	import logo from '$lib/assets/404-logo.svg';

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

{#if isNetworkError}
	<div class="flex min-h-[60vh] w-full flex-col items-center justify-center p-6">
		<NetworkError />
	</div>
{:else if isGlobal404}
	<div
		class="flex min-h-[calc(100vh-120px)] w-full flex-col items-center justify-center p-4 text-center"
	>
		<div class="mb-6 flex items-center gap-2 md:gap-6">
			<span class="text-[8rem] leading-none font-extrabold md:text-[12rem] lg:text-[16rem]">4</span>
			<img src={logo} alt="0" class="h-24 w-auto md:h-40 lg:h-56" />
			<span class="text-[8rem] leading-none font-extrabold md:text-[12rem] lg:text-[16rem]">4</span>
		</div>
		<p class="text-base-content/70 mb-8 max-w-md text-lg font-light md:text-xl">
			{$_('general.page_not_found_desc', {
				default: "We looked everywhere, but we couldn't find the page you requested."
			})}
		</p>
		<a href="/" class="btn btn-primary btn-lg">
			{$_('general.return_home', { default: 'Return Home' })}
		</a>
	</div>
{:else if page.error != null}
	<div class="flex min-h-[60vh] w-full flex-col items-center justify-center p-6">
		<StandardError error={page.error} />
	</div>
{:else}
	<div class="flex min-h-[60vh] w-full flex-col items-center justify-center p-6">
		<p>{$_('general.unknown_error')}</p>
	</div>
{/if}
