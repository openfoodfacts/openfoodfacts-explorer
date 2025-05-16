<script lang="ts">
	import { page } from '$app/state';
	import { _ } from '$lib/i18n';
	import NetworkError from '$lib/ui/NetworkError.svelte';
	import StandardError from '$lib/ui/StandardError.svelte';
	import { ERROR_TYPES } from '$lib/errors';

	let errorMessage = $derived(page.error?.message || '');
	let errorDetails = $derived(page.error?.errors || []);
	let isNetworkError = $derived(errorMessage === ERROR_TYPES.NETWORK_ERROR);

	$effect(() => {
		for (const err of errorDetails) {
			console.error('Error detail:', err);
		}
	});
</script>

<div
	class="alert alert-error text-error-content bg-error bg-opacity-10 rounded-xl p-6 font-semibold shadow-lg"
>
	{#if isNetworkError}
		<NetworkError />
	{:else}
		<StandardError errors={errorDetails} message={errorMessage} />
	{/if}
</div>
