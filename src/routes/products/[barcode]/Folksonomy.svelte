<script lang="ts">
	import { preferences } from '$lib/settings';

	import type { FolksonomyKey, FolksonomyTag } from '@openfoodfacts/openfoodfacts-nodejs';
	import { createFolksonomyApi, getFolksonomyValues } from '$lib/api/folksonomy';
	import { slide } from 'svelte/transition';

	interface Props {
		tags: FolksonomyTag[];
		barcode: string;
		keys: readonly FolksonomyKey[];
	}

	let { tags = $bindable(), barcode, keys }: Props = $props();

	async function refreshTags() {
		const folksonomyApi = createFolksonomyApi(fetch);
		const { data, error } = await folksonomyApi.getProductTags(barcode);
		if (!data) {
			console.error('Failed to fetch tags:', error);
			return;
		}

		tags = data;
	}

	function getFilteredArray<T>(
		arr: readonly T[],
		value: string,
		keyExtractor: (item: T) => string,
		{ excluded = [] }: { excluded?: readonly string[] } = {}
	) {
		if (value === '') {
			return arr;
		}

		const filtered = arr.filter((item) => {
			const key = keyExtractor(item);
			console.log('Filtering item:', item, 'with key:', key);
			return key.includes(value) && !excluded.includes(key);
		});

		if (filtered.length === 1 && keyExtractor(filtered[0]) === value) {
			// do not show the dropdown
			return null;
		}

		return filtered;
	}

	async function updateTag(newValue: string, idx: number) {
		isLoading = true;
		const oldTag = tags[idx];

		const newTag: FolksonomyTag = {
			...oldTag,
			last_edit: new Date().toISOString(),
			version: (oldTag.version ?? 0) + 1,
			v: newValue
		};

		const folksonomyApi = createFolksonomyApi(fetch);

		const ok = await folksonomyApi.putTag(newTag);
		if (!ok) {
			console.error('Failed to update tag', oldTag, 'to', newTag);
			isLoading = false;
			return;
		}

		console.debug('Updated tag', oldTag, 'to', newTag);
		await refreshTags();
		isLoading = false;
	}

	async function removeTag(tag: FolksonomyTag) {
		isLoading = true;
		console.debug('Removing tag', tag);

		tags = tags.filter((t) => t.k !== tag.k);
		const version = tag.version;
		if (version == null) {
			throw new Error('Tag value is null');
		}
		// otherwise ts complains about version possibly being null
		const folksonomyApi = createFolksonomyApi(fetch);
		const ok = await folksonomyApi.removeTag({ ...tag, version });
		if (ok != null) {
			console.error('Failed to remove tag', { tag, ok });
			isLoading = false;
			return;
		}

		console.debug('Removed tag', tag);
		await refreshTags();
		isLoading = false;
	}

	let newKey = $state('');
	let newValue = $state('');

	let possibleValues: { v: string; product_count: number }[] | null = $state(null);

	$effect(() => {
		// when newKey changes, fetch possible values
		const key = newKey;

		debounce(100, () => {
			if (key == '') {
				possibleValues = null;
				return;
			}
			console.debug('Fetching possible values for key:', key);

			getFolksonomyValues(fetch, key).then((values) => {
				console.debug('Possible values for key', key, ':', values);
				possibleValues = values;
			});
		});
	});

	function debounce(delay: number, fn: () => void) {
		let timeoutId: number | undefined;
		(() => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			timeoutId = window.setTimeout(fn, delay);
		})();
	}

	let isLoading: boolean = $state(false);

	async function createNewTag() {
		isLoading = true;
		console.debug('Creating new tag with key:', newKey, 'and value:', newValue);

		if (newKey == '' || newValue == '') {
			isLoading = false;
			throw new Error('New key or value is empty');
		}

		const newTag: FolksonomyTag = {
			k: newKey,
			v: newValue,
			product: barcode,
			version: 1,
			comment: '',
			owner: ''
		};

		const folksonomyApi = createFolksonomyApi(fetch);

		const created = await folksonomyApi.addTag(newTag);
		if (created) {
			tags = [...tags, newTag];
			newKey = '';
			newValue = '';
		}

		await refreshTags();

		newKey = '';
		newValue = '';

		isLoading = false;
	}

	let filteredKeys = $derived(
		getFilteredArray(keys, newKey, (item) => item.k, { excluded: tags.map((it) => it.k) })
	);

	let filteredValues = $derived.by(() => {
		return possibleValues == null
			? null
			: getFilteredArray(possibleValues, newValue, (item) => item.v);
	});

	let loggedIn = $derived($preferences.folksonomy.authToken != null);
</script>

<table class="table-compact table w-full">
	<thead>
		<tr class="bg-base-200">
			<th>Key</th>
			<th>Value</th>
			<th></th>
		</tr>
	</thead>
	<tbody>
		{#if tags.length === 0}
			<tr>
				<td colspan="3" class="text-center">
					<p class="mb-4">No tags found</p>
					{#if loggedIn}
						<p class="mb-4">You can create a new tag below</p>
					{/if}
				</td>
			</tr>
		{/if}
		{#each tags as tag, i (tag.k)}
			<tr transition:slide>
				<td aria-label="Key">
					<div class="flex w-full">
						<a href="/folksonomy/{tag.k}" class="link grow pl-2 font-mono max-sm:w-20" type="text">
							{tag.k}
						</a>
					</div>
				</td>
				<td class="flex gap-2" aria-label="Value">
					<textarea
						class="textarea grow break-words whitespace-pre-wrap max-sm:w-20"
						readonly={!loggedIn || isLoading}
						value={tag.v}
						onchange={(e) => updateTag(e.currentTarget.value, i)}
					></textarea>
				</td>
				{#if loggedIn}
					<td>
						<button
							class="btn btn-error"
							disabled={!loggedIn || isLoading}
							onclick={() => {
								removeTag(tag);
							}}
						>
							Delete
						</button>
					</td>
				{/if}
			</tr>
		{/each}

		{#if loggedIn}
			<tr>
				<td>
					<div class="dropdown dropdown-bottom dropdown-start flex w-full">
						<input
							type="text"
							class="input grow max-sm:w-20"
							placeholder="New key"
							readonly={!loggedIn}
							bind:value={newKey}
						/>

						{#if filteredKeys != null}
							<div class="dropdown-content max-h-52 overflow-y-auto">
								<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
								<ul tabindex="0" class="menu rounded-b-box bg-base-100 p-2 shadow-sm">
									{#if filteredKeys.length === 0}
										<li>No results found</li>
									{:else}
										{#each filteredKeys as key (key)}
											<li>
												<button
													onclick={() => {
														newKey = key.k;
													}}
												>
													{key.k} ({key.count})
												</button>
											</li>
										{/each}
									{/if}
								</ul>
							</div>
						{/if}
					</div>
				</td>
				<td class="flex gap-2">
					<div class="dropdown dropdown-bottom dropdown-start flex w-full">
						<input
							type="text"
							class="input grow max-sm:w-20"
							placeholder="New value"
							readonly={!loggedIn}
							bind:value={newValue}
						/>
						<div class="dropdown-content max-h-52 overflow-y-auto">
							<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
							{#if filteredValues != null}
								<ul tabindex="0" class="menu rounded-b-box bg-base-100 p-2 shadow-sm">
									{#if filteredValues.length > 0}
										{#each filteredValues as value (value)}
											<li>
												<button
													onclick={() => {
														newValue = value.v;
													}}
												>
													{value.v} ({value.product_count})
												</button>
											</li>
										{/each}
									{:else}
										<li>No results found</li>
									{/if}
								</ul>
							{/if}
						</div>
					</div></td
				>
				<td>
					<button
						class="btn btn-primary"
						onclick={createNewTag}
						disabled={isLoading || !loggedIn}
						title={!loggedIn
							? 'Please log in to create new tags and contribute to food transparency'
							: isLoading
								? 'Creating...'
								: undefined}
						class:loading={isLoading}
					>
						Create
					</button>
				</td>
			</tr>
		{:else}
			<tr>
				<td colspan="3" class="text-center">
					<p class="mb-4">
						To create new tags and contribute to food transparency, please log in to your Open Food
						Facts account
					</p>
					<a href="/settings" class="btn btn-primary w-1/4">Login</a>
				</td>
			</tr>
		{/if}
	</tbody>
</table>
