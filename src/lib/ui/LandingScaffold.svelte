<script lang="ts">
	import type { WebsiteFlavor } from '$lib/flavor';
	import { WEBSITE_FLAVOR_METADATA } from '$lib/flavor';
	import { _ } from '$lib/i18n';
	import Metadata from '$lib/Metadata.svelte';
	import Logo from '$lib/ui/Logo.svelte';
	import IconMdiOpenInNew from '@iconify-svelte/mdi/open-in-new';

	let { flavor }: { flavor: WebsiteFlavor } = $props();
	const meta = $derived(WEBSITE_FLAVOR_METADATA[flavor]);
	const name = $derived({ values: { name: meta.displayName } });
</script>

<Metadata
	title={$_('landing.xfacts_title', name)}
	description={$_('landing.xfacts_description', name)}
/>

<section class="flex min-h-120 flex-col items-center justify-center px-4 pt-16 pb-12">
	<div
		class="flex w-full max-w-2xl flex-col items-center rounded-3xl border border-base-200/40 bg-white/90 p-8 shadow-xl backdrop-blur-md dark:bg-base-300/90"
	>
		<div class="mb-4 h-14 w-full scale-100 px-4 drop-shadow-lg md:h-20 lg:scale-110 lg:px-16">
			<Logo {flavor} class="h-full w-full" />
		</div>

		<p class="mt-4 max-w-lg text-center text-lg text-base-content/70">
			{$_('landing.xfacts_coming_soon', name)}
		</p>

		<a
			href={meta.apiBaseUrl}
			target="_blank"
			rel="noopener noreferrer"
			class="btn mt-8 gap-2 shadow-md transition-transform btn-primary hover:scale-105"
		>
			{$_('landing.xfacts_visit', name)}
			<IconMdiOpenInNew class="h-5 w-5" />
		</a>
	</div>
</section>
