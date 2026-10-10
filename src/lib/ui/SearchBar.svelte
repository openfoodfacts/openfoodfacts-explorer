<script lang="ts">
	import {
		createSearchApi,
		type AutocompleteOption,
		type AutocompleteResponse
	} from '#lib/api/search.js';
	import { _, getBrowserLocale } from '#lib/i18n/index.js';
	import { getLanguageCode } from '#lib/settings.js';
	import { onDestroy } from 'svelte';

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

	let autocompletePromise = $state<Promise<AutocompleteOption[]> | null>(null);
	let highlightedIndex = $state<number | null>(null);

	// debounce for autocomplete
	let debounceTimeoutId: ReturnType<typeof setTimeout> | undefined;
	const DEBOUNCE_DELAY_MS = 100;

	// used for aborting previously executing autocomplete requests
	let autocompleteAbortController: AbortController | null = null;

	function abortAutocompleteRequest() {
		const controller = autocompleteAbortController;
		autocompleteAbortController = null;
		controller?.abort();
	}

	async function fetchAutocomplete(query: string): Promise<AutocompleteOption[]> {
		abortAutocompleteRequest();

		if (query.trim().length < minQueryLength) return [];

		const controller = new AbortController();
		autocompleteAbortController = controller;

		const autocompleteQuery = {
			q: query,
			taxonomy_names: 'brands,categories,labels',
			lang: getLanguageCode(getBrowserLocale()),
			size: 5,
			fuzziness: null,
			index_id: null
		};

		try {
			const fetchWithSignal: typeof fetch = (input, init) =>
				fetch(input, { ...init, signal: controller.signal });
			const api = createSearchApi(fetchWithSignal);
			const { data, error } = await api.autocomplete(autocompleteQuery);
			if (controller.signal.aborted) return [];
			if (error) {
				console.error('Autocomplete error', error);
				return [];
			} else {
				const result = data as AutocompleteResponse | undefined;
				return Array.isArray(result?.options) ? result.options : [];
			}
		} catch (e) {
			if (!controller.signal.aborted && e instanceof Error && e.name !== 'AbortError') {
				console.error('Autocomplete error', e);
			}
			return [];
		} finally {
			if (autocompleteAbortController === controller) {
				autocompleteAbortController = null;
			}
		}
	}

	function debouncedFetchAutocomplete(query: string) {
		clearTimeout(debounceTimeoutId);
		abortAutocompleteRequest();
		autocompletePromise = null;

		if (query.trim().length < minQueryLength) return;

		debounceTimeoutId = setTimeout(() => {
			autocompletePromise = fetchAutocomplete(query);
		}, DEBOUNCE_DELAY_MS);
	}

	function fetchAutocompleteImmediately(query: string) {
		clearTimeout(debounceTimeoutId);
		autocompletePromise = fetchAutocomplete(query);
	}

	onDestroy(() => {
		clearTimeout(debounceTimeoutId);
		abortAutocompleteRequest();
	});

	function handleEnter() {
		if (searchQuery.trim() !== '') {
			onSearch?.(searchQuery);
		}
	}

	function handleSelect(item: AutocompleteOption) {
		searchQuery = item.text;
		autocompletePromise = null;
		highlightedIndex = null;
		onSearch?.(item.text);
	}

	async function handleKeyDown(e: KeyboardEvent) {
		if (loading) return; // prevent interactions while loading

		if (e.key === 'ArrowDown') {
			e.preventDefault();
			const promise = autocompletePromise;
			if (promise == null) return;
			const options = await promise;
			if (promise !== autocompletePromise || options.length === 0) return;

			if (highlightedIndex === null || highlightedIndex === options.length - 1) {
				highlightedIndex = 0;
			} else {
				highlightedIndex = highlightedIndex + 1;
			}
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			const promise = autocompletePromise;
			if (promise == null) return;
			const options = await promise;
			if (promise !== autocompletePromise || options.length === 0) return;

			if (highlightedIndex === null || highlightedIndex === 0) {
				highlightedIndex = options.length - 1;
			} else {
				highlightedIndex = highlightedIndex - 1;
			}
		} else if (e.key === 'Enter') {
			if (highlightedIndex !== null && autocompletePromise !== null) {
				e.preventDefault();
				const promise = autocompletePromise;
				const options = await promise;
				if (promise === autocompletePromise && options[highlightedIndex]) {
					handleSelect(options[highlightedIndex]);
				}
			} else if (searchQuery.trim() !== '') {
				e.preventDefault();
				onSearch?.(searchQuery);
			}
		} else if (e.key === 'Escape') {
			highlightedIndex = null;
			autocompletePromise = null;
			abortAutocompleteRequest();
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
						fetchAutocompleteImmediately(searchQuery);
					}
				}}
			/>
			{#if autocompletePromise !== null}
				<div
					class="menu dropdown-content z-1 mt-1 w-full min-w-0 rounded-box bg-base-100 p-2 shadow-sm"
				>
					{#await autocompletePromise}
						<div class="flex justify-center">
							<span class="loading loading-lg loading-spinner"></span>
						</div>
					{:then autocompleteList}
						{#if autocompleteList.length === 0}
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
					{:catch}
						<div class="flex justify-center">
							<span class="text-sm text-base-content">{$_('search.no_results')}</span>
						</div>
					{/await}
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
