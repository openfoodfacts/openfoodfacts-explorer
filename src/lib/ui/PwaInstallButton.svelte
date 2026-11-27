<script lang="ts">
	import { getToastCtx } from '#lib/stores/toasts.js';
	import { pwaInstallStore } from '#lib/stores/pwa.svelte.js';
	import { _ } from '#lib/i18n/index.js';
	import IconMdiDownload from '@iconify-svelte/mdi/download';

	const toastCtx = getToastCtx();

	// Derived: is there a deferred install prompt waiting?
	let prompt = $derived(pwaInstallStore.value);

	let installing = $state(false);

	// Handle `appinstalled` to update UI if the browser reports success
	function handleAppInstalled() {
		pwaInstallStore.clear();
		installing = false;
		toastCtx.success($_('pwa.install_success', { default: 'App installed successfully!' }));
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
				toastCtx.success($_('pwa.install_success', { default: 'App installed successfully!' }));
			}
			// Whether accepted or dismissed, clear the stored prompt
			// — the browser won't fire `beforeinstallprompt` again.
			pwaInstallStore.clear();
		} catch {
			toastCtx.error(
				$_('pwa.install_error', { default: 'Could not install the app. Please try again.' })
			);
		} finally {
			installing = false;
		}
	}
</script>

{#if prompt}
	<button class="btn gap-2 btn-primary" onclick={handleInstall} disabled={installing}>
		<IconMdiDownload class="h-5 w-5" aria-hidden="true" />
		<span>
			{installing
				? $_('pwa.install_in_progress', { default: 'Installing…' })
				: $_('pwa.install_button', { default: 'Install app' })}
		</span>
	</button>
{/if}
