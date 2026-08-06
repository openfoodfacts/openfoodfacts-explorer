<script lang="ts">
	import type { WebsiteFlavor } from '$lib/flavor';
	import { WEBSITE_FLAVOR_METADATA } from '$lib/flavor';
	import { _ } from '$lib/i18n';
	import Metadata from '$lib/Metadata.svelte';
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
		<h1 class="text-3xl font-bold md:text-4xl">{$_('landing.xfacts_title', name)}</h1>

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
