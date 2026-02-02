<script lang="ts">
	import { onMount } from 'svelte';

	import Card from '$lib/ui/Card.svelte';
	import { compareStore } from '$lib/stores/compareStore';
	import ComparisonDisplay from '$lib/ui/ComparisonDisplay.svelte';

	import IconMdiShareVariant from '@iconify-svelte/mdi/share-variant';
	import { getToastCtx } from '$lib/stores/toasts';
	import { SvelteURLSearchParams } from 'svelte/reactivity';

	type ComparisonMode = 'absolute' | 'relative-first' | 'relative-best';

	let comparisonMode = $state<ComparisonMode>('relative-first');
	let mounted = $state(false);

	onMount(() => {
		mounted = true;
	});

	let comparisonTitle = $state('');
	let isEditingTitle = $state(false);
	let titleInput: HTMLInputElement | null = $state(null);

	function generateShareUrl(): string {
		const barcodes = $compareStore.map((p) => p.code).join(',');
		const params = new SvelteURLSearchParams();
		params.set('barcodes', barcodes);
		if (comparisonTitle.trim()) {
			params.set('title', comparisonTitle.trim());
		}
		return `${window.location.origin}/compare/shared?${params.toString()}`;
	}

	const toastCtx = getToastCtx();

	async function shareComparison() {
		const url = generateShareUrl();

		// If on chrome-based browser, use share API
		const ua = navigator.userAgent;
		const isChromeBrowser = ua.includes('Chrome') && !ua.includes('Edg') && !ua.includes('OPR');

		const data = {
			title: 'Product Comparison',
			text: 'Check out this product comparison I made!',
			url
		};

		if (isChromeBrowser && navigator.share && navigator.canShare(data)) {
			try {
				await navigator.share(data);
				return;
			} catch (err) {
				console.error('Share failed:', err);
				toastCtx.error('Sharing failed.');
			}
		}

		try {
			await navigator.clipboard.writeText(url);
			toastCtx.success('Comparison link copied to clipboard!');
		} catch (err) {
			console.error('Failed to copy:', err);
			toastCtx.error('Failed to copy link to clipboard.');
		}
	}

	function startEditingTitle() {
		isEditingTitle = true;
		setTimeout(() => titleInput?.focus(), 0);
	}

	function finishEditingTitle() {
		isEditingTitle = false;
		comparisonTitle = comparisonTitle.trim();
	}
</script>

<svelte:head>
	<title>Compare Products</title>
	<meta name="description" content="Compare nutritional information of food products" />
</svelte:head>

<div class="mx-4">
	<Card>
		<div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex-1">
				{#if isEditingTitle}
					<input
						bind:this={titleInput}
						bind:value={comparisonTitle}
						type="text"
						placeholder="Enter comparison title..."
						class="input input-bordered input-lg w-full max-w-md text-2xl font-bold"
						onblur={finishEditingTitle}
						onkeydown={(e) => {
							if (e.key === 'Enter') finishEditingTitle();
							if (e.key === 'Escape') {
								comparisonTitle = '';
								finishEditingTitle();
							}
						}}
					/>
				{:else}
					<button
						class="group hover:text-primary text-left transition-colors"
						onclick={startEditingTitle}
					>
						<h1 class="text-2xl font-bold">
							{comparisonTitle || 'Compare Products'}
							<span class="ml-2 text-sm opacity-0 transition-opacity group-hover:opacity-50"
								>✏️</span
							>
						</h1>
						<p class="text-base-content/50 text-xs">Click to edit title</p>
					</button>
				{/if}
			</div>
			<div class="flex flex-wrap items-center gap-2">
				{#if $compareStore.length > 0}
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
					<button class="btn btn-sm btn-primary" onclick={shareComparison}>
						<IconMdiShareVariant class="h-4 w-4" />
						Share
					</button>
					<button class="btn btn-sm btn-outline" onclick={() => compareStore.clear()}>
						Clear All
					</button>
				{/if}
			</div>
		</div>

		{#if $compareStore.length === 0}
			{#if !mounted}
				<div class="py-8 text-center">
					<span class="loading loading-spinner loading-lg text-primary"></span>
				</div>
			{:else}
				<div class="py-8 text-center">
					<p class="mb-4 text-lg">No products selected for comparison</p>
					<p class="mb-4 text-sm text-gray-600">
						Add products from their detail pages to start comparing nutritional values
					</p>
					<a href="/products/search?q=chocolate" class="btn btn-primary">Browse Products</a>
				</div>
			{/if}
		{:else}
			<ComparisonDisplay
				products={$compareStore}
				{comparisonMode}
				onRemoveProduct={(code) => compareStore.removeProduct(code)}
				onReorderProduct={(from, to) => compareStore.reorder(from, to)}
			/>
		{/if}
	</Card>
</div>
