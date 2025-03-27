<script lang="ts">
	import { FolksonomyApi, type FolksonomyTag } from '$lib/api/folksonomy';
	import { preferences } from '$lib/settings';

	interface Props {
		tags: FolksonomyTag[];
		barcode: string;
		keys: readonly string[];
	}

	let { tags = $bindable(), barcode, keys }: Props = $props();

	async function refreshTags() {
		const res = await new FolksonomyApi(fetch).getProduct(barcode);
		if (res.error) {
			console.error(res.error);
		} else {
			tags = res.data;
		}
	}

	function getFilteredKeys(keys: readonly string[], newKey: string) {
		if (newKey === '') {
			return keys;
		}
		return keys.filter((key) => key.includes(newKey) && key !== newKey);
	}

	async function updateTag(newValue: string, idx: number) {
		const oldTag = tags[idx];

		const newTag: FolksonomyTag = {
			...oldTag,
			last_edit: new Date().toISOString(),
			version: (oldTag.version ?? 0) + 1,
			v: newValue
		};

		const ok = await new FolksonomyApi(fetch).putTag(newTag);
		if (!ok) {
			console.error('Failed to update tag', oldTag, 'to', newTag);
			return;
		}

		console.debug('Updated tag', oldTag, 'to', newTag);
		await refreshTags();
	}

	async function removeTag(tag: FolksonomyTag) {
		tags = tags.filter((t) => t.k !== tag.k);
		const version = tag.version;
		if (version == null) {
			throw new Error('Tag value is null');
		}
		// otherwise ts complains about version possibly being null
		new FolksonomyApi(fetch).removeTag({ ...tag, version });
	}

	let newKey = $state('');
	let newValue = $state('');

	let creatingNewTag: boolean = $state(false);

	async function createNewTag() {
		creatingNewTag = true;
		if (newKey == '' || newValue == '') {
			creatingNewTag = false;
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

		const created = await new FolksonomyApi(fetch).addTag(newTag);

		if (created) {
			tags = [...tags, newTag];
			newKey = '';
			newValue = '';
		}

		creatingNewTag = false;
	}
	let filteredNewKeys = $derived(getFilteredKeys(keys, newKey));
	let loggedIn = $derived($preferences.folksonomy.authToken != null);
</script>

<table class="table-compact table w-full">
	<thead>
		<tr>
			<th>Key</th>
			<th>Value</th>
			{#if loggedIn}
				<th></th>
			{/if}
		</tr>
	</thead>
	<tbody>
		{#each tags as tag, i (tag.k)}
			<tr>
				<td aria-label="Key">
					<div class="flex w-full">
						<a href="/folksonomy/{tag.k}" class="link grow pl-2 font-mono max-sm:w-20" type="text">
							{tag.k}
						</a>
					</div>
				</td>
				<td class="flex gap-2" aria-label="Value">
					<input
						type="text"
						class="input grow max-sm:w-20"
						value={tag.v}
						readonly={!loggedIn}
						onchange={(e) => updateTag(e.currentTarget.value, i)}
					/>
				</td>
				{#if loggedIn}
					<td>
						<button
							class="btn btn-error"
							disabled={!loggedIn}
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
					<div class="dropdown dropdown-top flex w-full">
						<input
							type="text"
							class="input grow max-sm:w-20"
							placeholder="New key"
							readonly={!loggedIn}
							bind:value={newKey}
						/>

						<div class="dropdown-content max-h-52 overflow-y-auto">
							<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
							<ul tabindex="0" class=" menu rounded-box bg-base-100 p-2 shadow-sm">
								{#each filteredNewKeys as key (key)}
									<li>
										<button
											onclick={() => {
												newKey = key;
											}}
										>
											{key}
										</button>
									</li>
								{/each}
							</ul>
						</div>
					</div>
				</td>
				<td class="flex gap-2">
					<input
						type="text"
						class="input grow max-sm:w-20"
						placeholder="New value"
						readonly={!loggedIn}
						bind:value={newValue}
					/>
				</td>
				<td>
					<button
						class="btn btn-primary"
						onclick={createNewTag}
						disabled={creatingNewTag}
						class:loading={creatingNewTag}
					>
						Create
					</button>
				</td>
			</tr>
		{/if}
	</tbody>
</table>
