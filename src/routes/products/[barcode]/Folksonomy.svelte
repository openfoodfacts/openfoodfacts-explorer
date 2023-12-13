<script lang="ts">
	import { FolksonomyApi, type FolksonomyTag } from '$lib/api/folksonomy';
	import { preferences } from '$lib/settings';

	export let tags: FolksonomyTag[];
	export let barcode: string;
	export let keys: readonly string[];

	function getFilteredKeys(newKey: string, keys: readonly string[]) {
		if (newKey === '') {
			return keys;
		} else {
			return keys.filter((key) => key.includes(newKey) && key !== newKey);
		}
	}

	$: editable = $preferences.folksonomy.authToken != null;
	$: filteredKeys = getFilteredKeys(newKey, keys);

	let newButton: HTMLButtonElement;

	async function updateTag(
		event: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		},
		idx: number
	) {
		const oldTag = tags[idx];
		const newValue = event.currentTarget.value;

		const newTag: FolksonomyTag = {
			...oldTag,
			last_edit: new Date().toISOString(),
			version: (oldTag.version ?? 0) + 1,
			v: newValue
		};

		const res = await new FolksonomyApi(fetch).putTag(newTag);
		if (res) {
			console.debug('Updated tag', oldTag, 'to', newTag);
			tags[idx] = newTag;
			tags = [...tags];
		}
	}

	let newKey = '';
	let newValue = '';

	async function createNewTag() {
		newButton.classList.add('loading');
		newButton.disabled = true;

		if (newKey !== '' && newValue != '') {
			const newTag: FolksonomyTag = {
				k: newKey,
				v: newValue,
				product: barcode,
				version: 1
			};

			const ok = await new FolksonomyApi(fetch).addTag(newTag);

			if (ok) {
				tags = [...tags, newTag];
				newKey = '';
				newValue = '';
			}
		}
		newButton.classList.remove('loading');
		newButton.disabled = false;
	}
</script>

<table class="table-compact table w-full">
	<thead>
		<tr>
			<th>Key</th>
			<th>Value</th>
		</tr>
	</thead>
	<tbody>
		{#each tags as tag, i}
			<tr>
				<td aria-label="Key">
					<div class="flex w-full">
						<input class="input grow max-sm:w-20" type="text" readonly value={tag.k} />
					</div>
				</td>
				<td class="flex gap-2" aria-label="Value">
					<input
						type="text"
						class="input grow max-sm:w-20"
						value={tag.v}
						readonly={!editable}
						on:change={(e) => updateTag(e, i)}
					/>
					<button
						class="btn btn-error"
						on:click={() => {
							tags = tags.filter((t) => t.k !== tag.k);

							if (tag.version == null) {
								throw new Error('Tag value is null');
							} else {
								new FolksonomyApi(fetch).removeTag(tag);
							}
						}}
					>
						Delete
					</button>
				</td>
			</tr>
		{/each}

		<tr>
			<td>
				<div class="dropdown dropdown-top flex w-full">
					<input
						type="text"
						class="input grow max-sm:w-20"
						placeholder="New key"
						readonly={!editable}
						bind:value={newKey}
					/>

					<div class="dropdown-content max-h-52 overflow-y-auto">
						<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
						<ul tabindex="0" class=" menu rounded-box bg-base-100 p-2 shadow">
							{#each filteredKeys as key}
								<li>
									<button
										on:click={() => {
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
					readonly={!editable}
					bind:value={newValue}
				/>
				<button class="btn btn-primary" bind:this={newButton} on:click={createNewTag}>
					Create
				</button>
			</td>
		</tr>
	</tbody>
</table>
