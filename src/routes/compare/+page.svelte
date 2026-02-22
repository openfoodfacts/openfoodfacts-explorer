<script lang="ts">
	import { onMount } from 'svelte';

	import Card from '$lib/ui/Card.svelte';
	import { compareStore } from '$lib/stores/compareStore';
	import ComparisonDisplay from '$lib/ui/ComparisonDisplay.svelte';
	import { _ } from '$lib/i18n';

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
			title: $_('compare.share.title'),
			text: $_('compare.share.text'),
			url
		};

		if (isChromeBrowser && navigator.share && navigator.canShare(data)) {
			try {
				await navigator.share(data);
				return;
			} catch (err) {
				console.error('Share failed:', err);
				toastCtx.error($_('compare.share.failed'));
			}
		}

		try {
			await navigator.clipboard.writeText(url);
			toastCtx.success($_('compare.share.copy_success'));
		} catch (err) {
			console.error('Failed to copy:', err);
			toastCtx.error($_('compare.share.copy_failed'));
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
	<title>{$_('compare.meta_title')}</title>
	<meta name="description" content={$_('compare.meta_description')} />
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
						placeholder={$_('compare.title_placeholder')}
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
							{comparisonTitle || $_('compare.title_default')}
							<span class="ml-2 text-sm opacity-0 transition-opacity group-hover:opacity-50"
								>✏️</span
							>
						</h1>
						<p class="text-base-content/50 text-xs">{$_('compare.title_edit_hint')}</p>
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
							{$_('compare.mode.absolute')}
						</button>
						<button
							class="join-item btn btn-sm"
							class:btn-active={comparisonMode === 'relative-first'}
							onclick={() => (comparisonMode = 'relative-first')}
						>
							{$_('compare.mode.relative_first')}
						</button>
						<button
							class="join-item btn btn-sm"
							class:btn-active={comparisonMode === 'relative-best'}
							onclick={() => (comparisonMode = 'relative-best')}
						>
							{$_('compare.mode.relative_best')}
						</button>
					</div>
					<button class="btn btn-sm btn-primary" onclick={shareComparison}>
						<IconMdiShareVariant class="h-4 w-4" />
						{$_('compare.share.button')}
					</button>
					<button class="btn btn-sm btn-outline" onclick={() => compareStore.clear()}>
						{$_('compare.clear.button')}
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
					<p class="mb-4 text-lg">{$_('compare.empty.title')}</p>
					<p class="mb-4 text-sm text-gray-600">{$_('compare.empty.description')}</p>
					<a href="/products/search?q=chocolate" class="btn btn-primary">
						{$_('compare.empty.cta')}
					</a>
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
