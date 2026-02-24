<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/ui/Card.svelte';
	import ComparisonDisplay from '$lib/ui/ComparisonDisplay.svelte';
	import { compareStore } from '$lib/stores/compareStore';
	import IconMdiDownload from '@iconify-svelte/mdi/download';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import type { PageData } from './$types';
	import { _ } from '$lib/i18n';

	type Props = {
		data: PageData;
	};

	let { data }: Props = $props();

	type ComparisonMode = 'absolute' | 'relative-first' | 'relative-best';

	let comparisonMode = $state<ComparisonMode>('relative-first');
	let confirmDialog: HTMLDialogElement;

	function showImportDialog() {
		confirmDialog?.showModal();
	}

	function closeDialog() {
		confirmDialog?.close();
	}

	async function confirmImport() {
		// Clear current store and add all products from this comparison
		compareStore.clear();
		for (const product of data.products) {
			compareStore.addProduct(product);
		}

		closeDialog();

		// Navigate to the main comparison page
		await goto('/compare');
	}
</script>

<svelte:head>
	<title>{data.title ? `${data.title} - ` : ''}{$_('compare.shared_comparison')}</title>
	<meta name="description" content={$_('compare.shared_description')} />
</svelte:head>

<div class="mx-4">
	<Card>
		<div class="mb-4 flex flex-col gap-4">
			<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex-1">
					{#if data.title}
						<h1 class="text-2xl font-bold">{data.title}</h1>
					{:else}
						<h1 class="text-2xl font-bold">{$_('compare.shared_product_comparison')}</h1>
					{/if}
					<p class="text-base-content/70 text-sm">{$_('compare.read_only')}</p>
				</div>
				<div class="flex flex-wrap items-center gap-2">
					{#if data.products.length > 0}
						<button class="btn btn-sm btn-primary" onclick={showImportDialog}>
							<IconMdiDownload class="h-4 w-4" />
							{$_('compare.import_to_my')}
						</button>
						<div class="join">
							<button
								class="join-item btn btn-sm"
								class:btn-active={comparisonMode === 'absolute'}
								onclick={() => (comparisonMode = 'absolute')}
							>
								{$_('compare.mode_absolute')}
							</button>
							<button
								class="join-item btn btn-sm"
								class:btn-active={comparisonMode === 'relative-first'}
								onclick={() => (comparisonMode = 'relative-first')}
							>
								{$_('compare.mode_vs_first')}
							</button>
							<button
								class="join-item btn btn-sm"
								class:btn-active={comparisonMode === 'relative-best'}
								onclick={() => (comparisonMode = 'relative-best')}
							>
								{$_('compare.mode_vs_best')}
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>

		{#if data.products.length === 0}
			<div class="py-8 text-center">
				<p class="mb-4 text-lg">{$_('compare.no_products_to_compare')}</p>
				<p class="mb-4 text-sm text-gray-600">
					{$_('compare.invalid_link_hint')}
				</p>
				<a href="/products/search?q=chocolate" class="btn btn-primary"
					>{$_('compare.browse_products')}</a
				>
			</div>
		{:else}
			<ComparisonDisplay products={data.products} {comparisonMode} readonly />
		{/if}
	</Card>
</div>

<dialog
	bind:this={confirmDialog}
	class="modal"
	aria-labelledby="import-dialog-title"
	aria-modal="true"
>
	<div class="modal-box">
		<div class="mb-4 flex items-center justify-between">
			<h3 id="import-dialog-title" class="text-lg font-bold">
				{$_('compare.import_dialog_title')}
			</h3>
			<button
				type="button"
				class="btn btn-sm btn-circle btn-ghost"
				onclick={closeDialog}
				aria-label="Close dialog"
			>
				<IconMdiClose class="h-5 w-5" aria-hidden="true" />
			</button>
		</div>

		<p class="mb-6">
			{$_('compare.replace_comparison', { values: { count: data.products.length } })}
		</p>

		<div class="flex justify-end gap-2">
			<button type="button" class="btn btn-outline" onclick={closeDialog}
				>{$_('common.cancel')}</button
			>
			<button type="button" class="btn btn-primary" onclick={confirmImport}
				>{$_('compare.import')}</button
			>
		</div>
	</div>
</dialog>
