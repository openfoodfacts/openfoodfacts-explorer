<script lang="ts">
	import { page } from '$app/state';
	import JsonLd from '#lib/JsonLd.svelte';
	import { _ } from '#lib/i18n/index.js';
	import { resolve } from '#lib/paths.js';

	let { facet, value }: { facet: string; value?: string } = $props();

	const breadcrumbs = $derived([
		{
			name: $_('navigation.explore_by', { default: 'Explore by' }),
			href: resolve('facets')
		},
		{
			name: $_(`facets.names.${facet}`, { default: facet }),
			href: value !== undefined ? resolve('/facets/[facet]', { facet }) : undefined
		},
		...(value !== undefined ? [{ name: value }] : [])
	]);
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
	class="mt-6 mb-2 text-sm text-base-content/70"
>
	<ol class="flex flex-wrap items-baseline gap-x-2 gap-y-1">
		{#each breadcrumbs as { name, href }, index (index)}
			<li class="flex min-w-0 items-baseline gap-2">
				{#if index > 0}
					<span aria-hidden="true">›</span>
				{/if}
				{#if href}
					<a class="link py-1 link-hover" {href}>{name}</a>
				{:else}
					<span aria-current="page" class="font-medium wrap-anywhere text-base-content">
						{name}
					</span>
				{/if}
			</li>
		{/each}
	</ol>
</nav>
