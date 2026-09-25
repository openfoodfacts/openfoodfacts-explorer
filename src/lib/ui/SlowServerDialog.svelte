<script lang="ts">
	import { navigating } from '$app/state';
	import { _ } from '$lib/i18n';

	let { timeoutMs = 5000 }: { timeoutMs?: number } = $props();

	let navigationTooSlow: Promise<void> | null = $state(null);
	let navigationTooSlowDismissed = $state(false);

	$effect(() => {
		if (navigating.to != null) {
			let timeout: ReturnType<typeof setTimeout>;
			navigationTooSlowDismissed = false;

			navigationTooSlow = new Promise((resolve) => {
				timeout = setTimeout(resolve, timeoutMs);
			});

			return () => clearTimeout(timeout);
		}

		navigationTooSlow = null;
		navigationTooSlowDismissed = false;
	});
</script>

{#if navigationTooSlow != null && !navigationTooSlowDismissed}
	{#await navigationTooSlow then}
		<dialog id="slow-server-dialog" class="modal" open>
			<div class="modal-box">
				<h3 class="text-lg font-bold">
					{$_('slow_server.title', { default: 'This is taking longer than expected...' })}
				</h3>
				<p class="py-4">
					{$_('slow_server.message', {
						default:
							'Check your internet connection and our status page to see if there are any ongoing issues.'
					})}
				</p>
				<div class="modal-action">
					<button
						type="button"
						class="btn btn-ghost"
						onclick={() => (navigationTooSlowDismissed = true)}
					>
						{$_('slow_server.dismiss', { default: 'Dismiss' })}
					</button>
					<a
						href="https://status.openfoodfacts.org"
						target="_blank"
						rel="noopener noreferrer"
						class="btn btn-primary"
					>
						{$_('slow_server.status_page', { default: 'View Status Page' })}
					</a>
				</div>
			</div>
		</dialog>
	{/await}
{/if}
