<script lang="ts">
	import { autocomplete, type AutocompleteOption } from '$lib/api/search';
	import { _ } from '$lib/i18n';

	let {
		searchQuery = $bindable(''),
		minQueryLength = 3,
		onSearch
	} = $props<{
		searchQuery?: string;
		minQueryLength?: number;
		onSearch: (query: string) => void;
	}>();

	let autocompleteList = $state<AutocompleteOption[]>([]);
	let highlightedIndex = $state<number | null>(null);

	// used for aborting previously executing autocomplete requests
	let autocompleteAbortController: AbortController | null = null;

	async function fetchAutocomplete(query: string) {
		if (!query.trim() || query.length < minQueryLength) {
			autocompleteList = [];
			return;
		}
		if (autocompleteAbortController) {
			autocompleteAbortController.abort();
		}
		autocompleteAbortController = new AbortController();
		try {
			const autocompleteQuery = {
				q: query,
				taxonomy_names: 'brand,category',
				lang: 'en',
				size: 5,
				fuzziness: null,
				index_id: null
			};
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
		if (!autocompleteList.length) return;
		if (e.key === 'ArrowDown') {
			e.preventDefault();
			highlightedIndex =
				highlightedIndex === null || highlightedIndex === autocompleteList.length - 1
					? 0
					: highlightedIndex + 1;
		} else if (e.key === 'ArrowUp') {
			e.preventDefault();
			highlightedIndex =
				highlightedIndex === null || highlightedIndex === 0
					? autocompleteList.length - 1
					: highlightedIndex - 1;
		} else if (e.key === 'Enter' && highlightedIndex !== null) {
			e.preventDefault();
			handleSelect(autocompleteList[highlightedIndex]);
			highlightedIndex = null;
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
			{#if autocompleteList.length > 0}
				<ul
					class="dropdown-content menu bg-base-100 rounded-box z-1 mt-1 w-full min-w-0 p-2 shadow-sm"
				>
					{#each autocompleteList as item, i (item.id)}
						<li>
							<button
								onmousedown={() => handleSelect(item)}
								class:bg-base-200={highlightedIndex === i}
							>
								<span class="flex flex-col gap-1">
									<span>{item.text}</span>
									<span class="block text-xs text-gray-500">{item.taxonomy_name}</span>
								</span>
							</button>
						</li>
					{/each}
				</ul>
			{/if}
			<button
				class="btn btn-square btn-secondary join-item px-10"
				onclick={handleEnter}
				disabled={searchQuery == null || searchQuery.trim() === ''}
			>
				{$_('search.go')}
			</button>
		</div>
		<a
			href="/qr"
			title={$_('search.scan')}
			aria-label={$_('search.scan')}
			class="btn btn-secondary join-item ms-2 hidden px-5 text-lg md:inline-flex"
		>
			<span class="icon-[mdi--barcode-scan] h-6 w-6"></span>
		</a>
	</div>
</div>
