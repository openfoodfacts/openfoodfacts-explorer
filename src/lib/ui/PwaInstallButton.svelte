<script lang="ts">
	import { getToastCtx } from '$lib/stores/toasts';
	import { pwaInstallStore } from '$lib/stores/pwa';
	import { _ } from '$lib/i18n';
	import IconMdiDownload from '@iconify-svelte/mdi/download';

	const toastCtx = getToastCtx();

	// Derived: is there a deferred install prompt waiting?
	let prompt = $derived($pwaInstallStore);

	let installing = $state(false);

	// Handle `appinstalled` to update UI if the browser reports success
	function handleAppInstalled() {
		pwaInstallStore.clear();
		installing = false;
		toastCtx.success($_('pwa.install_success'));
	}

	$effect(() => {
		if (typeof window === 'undefined') return;

		function onInstalled() {
			handleAppInstalled();
		}

		window.addEventListener('appinstalled', onInstalled);
		return () => {
			window.removeEventListener('appinstalled', onInstalled);
		};
	});

	async function handleInstall() {
		if (!prompt || installing) return;

		installing = true;

		try {
			await prompt.prompt();
			const { outcome } = await prompt.userChoice;

			if (outcome === 'accepted') {
				toastCtx.success($_('pwa.install_success'));
			}
			// Whether accepted or dismissed, clear the stored prompt
			// — the browser won't fire `beforeinstallprompt` again.
			pwaInstallStore.clear();
		} catch {
			toastCtx.error($_('pwa.install_error'));
		} finally {
			installing = false;
		}
	}
</script>

{#if prompt}
	<button class="btn gap-2 btn-primary" onclick={handleInstall} disabled={installing}>
		<IconMdiDownload class="h-5 w-5" />
		<span>
			{installing ? $_('pwa.install_in_progress') : $_('pwa.install_button')}
		</span>
	</button>
{/if}
