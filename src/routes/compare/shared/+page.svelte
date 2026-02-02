<script lang="ts">
	import { goto } from '$app/navigation';
	import Card from '$lib/ui/Card.svelte';
	import ComparisonDisplay from '$lib/ui/ComparisonDisplay.svelte';
	import { compareStore } from '$lib/stores/compareStore';
	import IconMdiDownload from '@iconify-svelte/mdi/download';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import type { PageData } from './$types';

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
	<title>{data.title ? `${data.title} - ` : ''}Shared Comparison</title>
	<meta name="description" content="Shared product comparison" />
</svelte:head>

<div class="mx-4">
	<Card>
		<div class="mb-4 flex flex-col gap-4">
			<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div class="flex-1">
					{#if data.title}
						<h1 class="text-2xl font-bold">{data.title}</h1>
					{:else}
						<h1 class="text-2xl font-bold">Shared Product Comparison</h1>
					{/if}
					<p class="text-base-content/70 text-sm">Read-only comparison</p>
				</div>
				<div class="flex flex-wrap items-center gap-2">
					{#if data.products.length > 0}
						<button class="btn btn-sm btn-primary" onclick={showImportDialog}>
							<IconMdiDownload class="h-4 w-4" />
							Import to My Comparison
						</button>
						<div class="join">
							<button
								class="join-item btn btn-sm"
								class:btn-active={comparisonMode === 'absolute'}
								onclick={() => (comparisonMode = 'absolute')}
							>
								Absolute
							</button>
							<button
								class="join-item btn btn-sm"
								class:btn-active={comparisonMode === 'relative-first'}
								onclick={() => (comparisonMode = 'relative-first')}
							>
								vs First
							</button>
							<button
								class="join-item btn btn-sm"
								class:btn-active={comparisonMode === 'relative-best'}
								onclick={() => (comparisonMode = 'relative-best')}
							>
								vs Best
							</button>
						</div>
					{/if}
				</div>
			</div>
		</div>

		{#if data.products.length === 0}
			<div class="py-8 text-center">
				<p class="mb-4 text-lg">No products to compare</p>
				<p class="mb-4 text-sm text-gray-600">
					This link doesn't contain any valid products to compare
				</p>
				<a href="/products/search?q=chocolate" class="btn btn-primary">Browse Products</a>
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
			<h3 id="import-dialog-title" class="text-lg font-bold">Import Comparison</h3>
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
			This will replace your current comparison with {data.products.length} product{data.products
				.length !== 1
				? 's'
				: ''}. Continue?
		</p>

		<div class="flex justify-end gap-2">
			<button type="button" class="btn btn-outline" onclick={closeDialog}> Cancel </button>
			<button type="button" class="btn btn-primary" onclick={confirmImport}> Import </button>
		</div>
	</div>
</dialog>
