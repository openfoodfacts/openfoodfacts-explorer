<script lang="ts">
	import { autocomplete, type AutocompleteOption } from '$lib/api/search';
	import { _ } from '$lib/i18n';

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

	// used for aborting previously executing autocomplete requests
	let autocompleteAbortController: AbortController | null = null;

	async function fetchAutocomplete(query: string) {
		if (query == null || query.trim().length < minQueryLength) {
			autocompleteLoading = false;
			autocompleteList = null;
			return;
		}
		if (autocompleteAbortController) {
			autocompleteAbortController.abort();
		}
		autocompleteAbortController = new AbortController();

		const autocompleteQuery = {
			q: query,
			taxonomy_names: 'brand,category',
			lang: 'en',
			size: 5,
			fuzziness: null,
			index_id: null
		};

		try {
			autocompleteLoading = true;
			const response = await autocomplete(autocompleteQuery, fetch);
			if (response && Array.isArray(response.options)) {
				autocompleteList = response.options;
			} else {
				autocompleteList = [];
			}
		} catch (e) {
			if (e instanceof Error && e.name !== 'AbortError') {
				console.error('Autocomplete error', e);
			}
		}
		autocompleteLoading = false;
	}

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
		if (loading || autocompleteList == null) return;

		if (autocompleteList.length == 0) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			if (highlightedIndex === null || highlightedIndex === autocompleteList.length - 1) {
				highlightedIndex = 0;
			} else {
				highlightedIndex = highlightedIndex + 1;
			}
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			if (highlightedIndex === null || highlightedIndex === 0) {
				highlightedIndex = autocompleteList.length - 1;
			} else {
				highlightedIndex = highlightedIndex - 1;
			}
		} else if (e.key === 'Enter' && highlightedIndex !== null) {
			e.preventDefault();
			handleSelect(autocompleteList[highlightedIndex]);
			highlightedIndex = null;
		} else if (e.key === 'Enter' && searchQuery.trim() !== '') {
			e.preventDefault();
			onSearch?.(searchQuery);
		} else if (e.key === 'Escape') {
			highlightedIndex = null;
		}
	}
</script>

<div class="form-control">
	<div>
		<div class="join dropdown dropdown-bottom dropdown-center md:w-98">
			<input
				type="text"
				bind:value={searchQuery}
				class="input join-item input-bordered xl:w-full"
				placeholder={$_('search.placeholder')}
				disabled={loading}
				aria-label={$_('search.placeholder')}
				onkeydown={handleKeyDown}
				oninput={() => {
					fetchAutocomplete(searchQuery);
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
					class="dropdown-content menu bg-base-100 rounded-box z-1 mt-1 w-full min-w-0 p-2 shadow-sm"
				>
					{#if autocompleteList == null && autocompleteLoading}
						<div class="flex justify-center">
							<span class="loading loading-spinner loading-lg"></span>
						</div>
					{:else if autocompleteList == null || autocompleteList.length === 0}
						<div class="flex justify-center">
							<span class="text-base-content text-sm">{$_('search.no_results')}</span>
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
											<p class=" text-base-content text-xs">{item.taxonomy_name}</p>
										</div>
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			{/if}
			<button
				class="btn btn-secondary join-item px-10"
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
			class="btn btn-secondary join-item ms-2 text-lg"
		>
			<span class="icon-[mdi--barcode-scan] h-6 w-6"></span>
		</a>
	</div>
</div>
