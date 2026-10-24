<script lang="ts">
	import { persisted } from 'svelte-local-storage-store';
	import { _ } from '#lib/i18n/index.js';
	import { STATIC_PAGES_BASE_URL } from '#lib/const.js';
	import IconMdiClose from '@iconify-svelte/mdi/close';

	const dismissed = persisted('appStripDismissed', false);
</script>

{#if !$dismissed}
	<div
		class="-mx-4 flex items-center gap-2.5 bg-secondary/15 px-4 py-2 text-sm leading-snug md:hidden"
	>
		<span class="flex-1">{$_('product.app_strip.text')}</span>
		<a
			href={`${STATIC_PAGES_BASE_URL}/open-food-facts-mobile-app`}
			target="_blank"
			rel="noopener noreferrer"
			class="btn rounded-full btn-secondary btn-sm"
		>
			{$_('product.app_strip.get_app')}
		</a>
		<button
			class="btn btn-ghost btn-xs"
			aria-label={$_('slow_server.dismiss')}
			onclick={() => ($dismissed = true)}
		>
			<IconMdiClose class="h-4 w-4" aria-hidden="true" />
		</button>
	</div>
{/if}
