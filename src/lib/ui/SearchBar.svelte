<script lang="ts">
	import {
		createSearchApi,
		type AutocompleteOption,
		type AutocompleteResponse
	} from '$lib/api/search';
	import { getTaxonomySuggestions } from '$lib/api';
	import { _, getBrowserLocale } from '$lib/i18n';
	import { onDestroy } from 'svelte';
	import { deduplicateAutocompleteOptions } from './searchbar';

	import IconMdiBarcodeScan from '@iconify-svelte/mdi/barcode-scan';

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

	// track the current query and request ID to prevent stale results from overwriting newer queries
	let currentQuery = $state('');
	let requestId = 0;

	async function fetchAutocomplete(query: string) {
		autocompleteAbortController?.abort();

		if (query.trim().length < minQueryLength) {
			autocompleteLoading = false;
			autocompleteList = null;
			currentQuery = '';
			return;
		}

		autocompleteAbortController = new AbortController();
		currentQuery = query;
		const currentRequestId = ++requestId;

		autocompleteLoading = true;

		try {
			// TODO: When search-a-licious supports brand autocomplete, remove the classic taxonomy
			// fallback and use search-a-licious for all taxonomy types (brands, categories, labels).
			// Currently, search-a-licious does not return brand suggestions, so we use the classic
			// taxonomy suggester for brands while search-a-licious handles categories and labels.

			// Fetch brand suggestions from classic taxonomy suggester
			const brandSuggestionsPromise = getTaxonomySuggestions(fetch, 'brands', query, 5).then(
				(result: { data?: { suggestions?: string[] }; error?: unknown }) => {
					if (result.error || !result.data) {
						console.warn('Brand taxonomy suggestions error:', result.error);
						return [];
					}
					return result.data.suggestions ?? [];
				}
			);

			// Fetch category/label suggestions from search-a-licious (excluding brands)
			const searchApi = createSearchApi(fetch);
			const searchQuery = {
				q: query,
				taxonomy_names: 'categories,labels',
				lang: getBrowserLocale(),
				size: 5,
				fuzziness: null,
				index_id: null
			};

			const searchSuggestionsPromise = searchApi.autocomplete(searchQuery).then((result) => {
				if (result.error || !result.data) {
					console.warn('Search-a-licious autocomplete error:', result.error);
					return [];
				}
				const data = result.data as AutocompleteResponse | undefined;
				return Array.isArray(data?.options) ? data.options : [];
			});

			// Run both requests in parallel
			const [brandSuggestions, searchSuggestions] = await Promise.allSettled([
				brandSuggestionsPromise,
				searchSuggestionsPromise
			]);

			const brands = brandSuggestions.status === 'fulfilled' ? brandSuggestions.value : [];
			const categoriesLabels =
				searchSuggestions.status === 'fulfilled' ? searchSuggestions.value : [];

			// Convert brand suggestions to AutocompleteOption format
			const brandOptions: AutocompleteOption[] = brands.map((brand: string) => ({
				id: `brand-${brand}`,
				text: brand,
				taxonomy_name: 'brands'
			}));

			// Merge results, preferring brands first, then deduplicate by text (case-insensitive)
			const mergedOptions = [...brandOptions, ...categoriesLabels];
			const deduplicatedOptions = deduplicateAutocompleteOptions(mergedOptions);

			// Only update if this is still the current request (prevent stale results)
			if (currentRequestId === requestId) {
				autocompleteList = deduplicatedOptions;
			}
		} catch (e) {
			if (e instanceof Error && e.name !== 'AbortError') {
				console.error('Autocomplete error', e);
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
										<div class="flex flex-col gap-1">
											<p class="">{item.text}</p>
											<p class=" text-xs text-base-content">{item.taxonomy_name}</p>
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
