<script lang="ts">
	import {
		createSearchApi,
		type AutocompleteOption,
		type AutocompleteResponse
	} from '$lib/api/search';
	import { _, getBrowserLocale } from '$lib/i18n';
	import { getLanguageCode } from '$lib/settings';
	import { onDestroy } from 'svelte';

	import IconMdiBarcodeScan from '@iconify-svelte/mdi/barcode-scan';
	import TagMiniature from '$lib/ui/TagMiniature.svelte';
	import { getTagMiniatureUrl } from '$lib/ui/tagUtils';

	let {
		searchQuery = $bindable(''),
		minQueryLength = 3,
		loading = false,
		onSearch
	}: {
		searchQuery?: string;
		minQueryLength?: number;
		loading?: boolean;
		onSearch: (query: string) => void;
	} = $props();

	// null = hidden
	let autocompleteLoading = $state(false);
	let autocompleteList = $state<AutocompleteOption[] | null>(null);
	let highlightedIndex = $state<number | null>(null);

	// debounce for autocomplete
	let debounceTimeoutId: ReturnType<typeof setTimeout> | undefined;
	const DEBOUNCE_DELAY_MS = 100;

	// used for aborting previously executing autocomplete requests
	let autocompleteAbortController: AbortController | null = null;

	const MOCK_TAG_FALLBACKS: AutocompleteOption[] = [
		{
			id: 'en:organic',
			text: 'Organic',
			taxonomy_name: 'labels',
			icon_url: 'https://static.openfoodfacts.org/images/icons/dist/organic.svg'
		},
		{
			id: 'en:fair-trade',
			text: 'Fair Trade',
			taxonomy_name: 'labels',
			icon_url: 'https://static.openfoodfacts.org/images/icons/dist/fair-trade.svg'
		},
		{
			id: 'en:vegan',
			text: 'Vegan',
			taxonomy_name: 'labels',
			icon_url: 'https://static.openfoodfacts.org/images/icons/dist/vegan.svg'
		},
		{
			id: 'en:beverages',
			text: 'Beverages',
			taxonomy_name: 'categories',
			icon_url: 'https://static.openfoodfacts.org/images/icons/dist/beverages.svg'
		},
		{
			id: 'en:gluten-free',
			text: 'Gluten-Free',
			taxonomy_name: 'labels',
			icon_url: 'https://static.openfoodfacts.org/images/icons/dist/gluten-free.svg'
		}
	];

	async function fetchAutocomplete(query: string) {
		autocompleteAbortController?.abort();

		if (query.trim().length < minQueryLength) {
			autocompleteLoading = false;
			autocompleteList = null;
			return;
		}

		autocompleteAbortController = new AbortController();

		const autocompleteQuery = {
			q: query,
			taxonomy_names: 'brands,categories,labels',
			lang: getLanguageCode(getBrowserLocale()),
			size: 5
		};

		autocompleteLoading = true;
		const qLower = query.toLowerCase();
		const getMockItems = () =>
			MOCK_TAG_FALLBACKS.filter(
				(opt) => opt.text.toLowerCase().includes(qLower) || opt.id.toLowerCase().includes(qLower)
			);

		try {
			const api = createSearchApi(fetch);
			const { data, error } = await api.autocomplete(autocompleteQuery);
			if (error) {
				autocompleteList = getMockItems();
			} else {
				const result = data as AutocompleteResponse | undefined;
				const options = Array.isArray(result?.options) ? result.options : [];
				autocompleteList = options.length > 0 ? options : getMockItems();
			}
		} catch (e) {
			if (e instanceof Error && e.name !== 'AbortError') {
				autocompleteList = getMockItems();
			}
		} finally {
			autocompleteLoading = false;
		}
	}

	function debouncedFetchAutocomplete(query: string) {
		clearTimeout(debounceTimeoutId);
		debounceTimeoutId = setTimeout(() => fetchAutocomplete(query), DEBOUNCE_DELAY_MS);
	}

	onDestroy(() => {
		clearTimeout(debounceTimeoutId);
		autocompleteAbortController?.abort();
	});

	function handleEnter() {
		if (searchQuery.trim() !== '') {
			onSearch?.(searchQuery);
		}
	}

	function handleSelect(item: AutocompleteOption) {
		searchQuery = item.text;
		onSearch?.(item.text);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (loading) return; // prevent interactions while loading

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (autocompleteList == null || autocompleteList.length === 0) return;

			if (highlightedIndex === null || highlightedIndex === autocompleteList.length - 1) {
				highlightedIndex = 0;
			} else {
				highlightedIndex = highlightedIndex + 1;
			}
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (autocompleteList == null || autocompleteList.length === 0) return;

			if (highlightedIndex === null || highlightedIndex === 0) {
				highlightedIndex = autocompleteList.length - 1;
			} else {
				highlightedIndex = highlightedIndex - 1;
			}
		} else if (e.key === 'Enter') {
			if (highlightedIndex !== null && autocompleteList !== null) {
				e.preventDefault();
				handleSelect(autocompleteList[highlightedIndex]);
				highlightedIndex = null;
			} else if (searchQuery.trim() !== '') {
				e.preventDefault();
				onSearch?.(searchQuery);
			}
		} else if (e.key === 'Escape') {
			highlightedIndex = null;
			autocompleteList = null;
		}
	}
</script>

<div class="form-control">
	<div class="flex w-full items-center gap-2">
		<div class="dropdown dropdown-center dropdown-bottom join min-w-0 flex-1 md:w-98 md:flex-none">
			<input
				type="text"
				bind:value={searchQuery}
				class="input-bordered input join-item w-full"
				placeholder={$_('search.placeholder')}
				disabled={loading}
				aria-label={$_('search.placeholder')}
				onkeydown={handleKeyDown}
				oninput={() => {
					debouncedFetchAutocomplete(searchQuery);
					highlightedIndex = null;
				}}
				onfocus={() => {
					if (searchQuery.trim().length >= minQueryLength) {
						fetchAutocomplete(searchQuery);
					}
				}}
			/>
			{#if autocompleteLoading || autocompleteList != null}
				<div
					class="menu dropdown-content z-1 mt-1 w-full min-w-0 rounded-box bg-base-100 p-2 shadow-sm"
				>
					{#if autocompleteList == null && autocompleteLoading}
						<div class="flex justify-center">
							<span class="loading loading-lg loading-spinner"></span>
						</div>
					{:else if autocompleteList == null || autocompleteList.length === 0}
						<div class="flex justify-center">
							<span class="text-sm text-base-content">{$_('search.no_results')}</span>
						</div>
					{:else}
						<ul>
							{#each autocompleteList as item, i (item.id)}
								<li>
									<button
										onmousedown={() => handleSelect(item)}
										class:bg-base-300={highlightedIndex === i}
									>
										<div class="flex items-center gap-2">
											{#if getTagMiniatureUrl(item)}
												<TagMiniature src={getTagMiniatureUrl(item)} alt={item.text} size="md" />
											{/if}
											<div class="flex flex-col gap-0.5">
												<p class="">{item.text}</p>
												<p class="text-xs text-base-content">{item.taxonomy_name}</p>
											</div>
										</div>
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}
			<button
				class="btn join-item px-10 btn-secondary"
				onclick={handleEnter}
				class:btn-loading={loading}
				disabled={searchQuery == null || searchQuery.trim() === '' || loading}
			>
				{#if loading}
					<span class="loading loading-spinner"></span>
				{:else}
					<span>{$_('search.go')}</span>
				{/if}
			</button>
		</div>
		<a
			href="/qr"
			title={$_('search.scan')}
			aria-label={$_('search.scan')}
			class="btn join-item text-lg btn-secondary"
		>
			<IconMdiBarcodeScan class="h-6 w-6" />
		</a>
	</div>
</div>
