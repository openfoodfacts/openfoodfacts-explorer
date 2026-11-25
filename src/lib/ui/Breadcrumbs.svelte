<script lang="ts">
	import { page } from '$app/state';
	import JsonLd from '#lib/JsonLd.svelte';
	import { _ } from '#lib/i18n/index.js';

	type Breadcrumb = { name: string; href?: string };
	let { breadcrumbs }: { breadcrumbs: Breadcrumb[] } = $props();

	const breadcrumbStructuredData = $derived({
		itemListElement: breadcrumbs.map(({ name, href }, index) => ({
			'@type': 'ListItem',
			position: index + 1,
			name,
			item: href ? new URL(href, page.url.href).href : undefined
		}))
	});
</script>

<JsonLd type="BreadcrumbList" data={breadcrumbStructuredData} />

<nav
	aria-label={$_('navigation.breadcrumb', { default: 'Breadcrumb' })}
	class="mt-6 mb-2 text-sm font-medium text-base-content"
>
	<ol class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
		{#each breadcrumbs as { name, href }, index (index)}
			<li class="flex min-w-0 items-baseline gap-2">
				{#if index > 0}
					<span aria-hidden="true">›</span>
				{/if}
				{#if href}
					<a
						class="badge h-auto badge-ghost text-base-content/70 transition-colors hover:badge-soft hover:text-base-content focus-visible:outline-2 focus-visible:outline-offset-2"
						{href}>{name}</a
					>
				{:else}
					<span aria-current="page" class="badge h-auto badge-ghost wrap-anywhere">
						{name}
					</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
