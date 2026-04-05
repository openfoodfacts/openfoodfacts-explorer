<script lang="ts">
	import WcProductCard from '$lib/ui/WcProductCard.svelte';
	import { _, getNumberFormatter } from 'svelte-i18n';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let { contributor, editor, user } = $derived(data);

	import ShoppingCartIcon from './shopping-cart.svg';
	import ScaleIcon from './scale.svg';

	let { contributorAvailable, editorAvailable, contributorError, editorError } = $derived(data);

	let contributorCount = $derived(contributor?.count ?? 0);
	let editorCount = $derived(editor?.count ?? 0);
	let contributorProducts = $derived(contributor?.products ?? []);
	let editorProducts = $derived(editor?.products ?? []);

	let cards = $derived([
		{
			title: $_('dashboard.products_created', { default: 'Products Created' }),
			count: contributorCount,
			icon: ShoppingCartIcon
		},
		{
			title: $_('dashboard.products_edited', { default: 'Products Edited' }),
			count: editorCount,
			icon: ScaleIcon
		}
	]);

	const formatNumber = (n: number) => getNumberFormatter().format(n);
</script>

<svelte:head>
	<title>{$_('dashboard.html_title', { values: { user }, default: 'Dashboard for ' + user })}</title
	>
</svelte:head>

<h1 class="my-8 text-3xl font-bold">
	{$_('dashboard.title', { values: { user }, default: 'Dashboard for ' + user })}
</h1>

<div class="mb-8 flex flex-wrap gap-4 max-md:flex-col md:grid-cols-2">
	{#each cards as card (card.title)}
		<div class="card bg-base-100 border-secondary border-1">
			<div class="card-body flex-row items-center gap-4 text-center">
				<img src={card.icon} alt={card.title} class="w-10" />
				<div class="flex-1">
					<h2 class="card-title justify-center">{card.title}</h2>
					<p class="w-full text-4xl font-bold">{formatNumber(card.count)}</p>
				</div>
			</div>
		</div>
	{/each}
</div>

<section class="mb-8">
	<h2 class="my-4 text-xl font-bold">{$_('dashboard.has_created', { default: 'Has Created' })}</h2>
	{#if !contributorAvailable}
		<div class="alert alert-warning mb-4">
			{$_('errors.api_unavailable', { default: 'The requested data is temporarily unavailable.' })}
			{#if contributorError}
				<span class="text-sm">{contributorError}</span>
			{/if}
		</div>
	{/if}
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each contributorProducts.slice(0, 6) as product (product.code)}
			<WcProductCard {product} />
		{/each}
	</div>

	<a href={`/facets/contributors/${user}`} class="btn btn-outline mt-4 w-full">
		{$_('dashboard.view_all_contributions', { default: 'View all contributions' })}
	</a>
</section>

<section class="mb-8">
	<h2 class="my-4 text-xl font-bold">{$_('dashboard.has_edited', { default: 'Has Edited' })}</h2>
	{#if !editorAvailable}
		<div class="alert alert-warning mb-4">
			{$_('errors.api_unavailable', { default: 'The requested data is temporarily unavailable.' })}
			{#if editorError}
				<span class="text-sm">{editorError}</span>
			{/if}
		</div>
	{/if}
	<div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each editorProducts.slice(0, 6) as product (product.code)}
			<WcProductCard {product} />
		{/each}
	</div>

	<a href={`/facets/editors/${user}`} class="btn btn-outline mt-4 w-full"
		>{$_('dashboard.view_all_edits', { default: 'View all edits' })}</a
	>
</section>
