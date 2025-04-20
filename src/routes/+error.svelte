<script lang="ts">
	import { page } from '$app/state';
	import { _ } from '$lib/i18n';
	import NetworkError from '$lib/ui/NetworkError.svelte';
	import StandardError from '$lib/ui/StandardError.svelte';

	let message = $derived(page.error?.message);
	let errors = $derived(page.error?.errors);
	let isNetworkError = $derived(message === 'network_error');

	$effect(() => {
		for (const error of errors ?? []) {
			console.error(error);
		}
	});
</script>

<div
	class="alert alert-error text-error-content bg-error bg-opacity-10 rounded-xl p-6 font-semibold shadow-lg"
>
	{#if isNetworkError}
		<NetworkError />
	{:else}
		<StandardError {errors} {message} />
	{/if}
</div>
