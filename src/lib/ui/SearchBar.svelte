<script lang="ts">
	import { autocomplete, type AutocompleteOption } from '$lib/api/search';
	import { _ } from '$lib/i18n';

	let {
		searchQuery = $bindable(''),
		minAutocompleteLength = 3,
		onSearch
	} = $props<{
		searchQuery?: string;
		minAutocompleteLength?: number;
		onSearch: (query: string) => void;
	}>();

	let autocompleteList = $state<AutocompleteOption[]>([]);

	// used for aborting previously executing autocomplete requests
	let autocompleteAbortController: AbortController | null = null;

	async function fetchAutocomplete(query: string) {
		if (!query.trim() || query.length < minAutocompleteLength) {
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
</script>

<div class="form-control">
	<div>
		<div class="join dropdown dropdown-bottom dropdown-center md:w-98">
			<input
				type="text"
				bind:value={searchQuery}
				class="input join-item input-bordered xl:w-full"
				placeholder={$_('search.placeholder')}
				onkeydown={(e) => {
					if (e.key === 'Enter') handleEnter();
				}}
				oninput={() => fetchAutocomplete(searchQuery)}
				onblur={() => setTimeout(() => {}, 100)}
			/>
			{#if autocompleteList.length >= minAutocompleteLength}
				<ul
					class="dropdown-content menu bg-base-100 rounded-box z-1 mt-1 w-full min-w-0 p-2 shadow-sm"
				>
					{#each autocompleteList as item (item.id)}
						<li>
							<button onmousedown={() => handleSelect(item)}>
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
		<slot name="qr"></slot>
	</div>
</div>
