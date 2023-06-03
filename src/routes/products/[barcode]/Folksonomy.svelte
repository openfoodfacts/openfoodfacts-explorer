<script lang="ts">
	import { putProductTag, type ProductTag, createProductTag, deleteProductTag } from '$lib/api';
	import { preferences } from '$lib/settings';

	export let tags: ProductTag[];
	export let barcode: string;

	$: editable = $preferences.folksonomy.authToken != null;

	let newButton: HTMLButtonElement;

	async function updateTag(
		event: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		},
		idx: number
	) {
		const oldTag = tags[idx];
		const newValue = event.currentTarget.value;

		const newTag: ProductTag = {
			...oldTag,
			last_edit: new Date().toISOString(),
			version: (oldTag.version ?? 0) + 1,
			v: newValue
		};

		const res = await putProductTag(newTag, fetch);
		if (res) {
			console.debug('Updated tag', oldTag, 'to', newTag);
			tags[idx] = newTag;
			tags = [...tags];
		}
	}

	let newKey: string = '';
	let newValue: string = '';

	async function createNewTag() {
		newButton.classList.add('loading');
		newButton.disabled = true;

		if (newKey !== '' && newValue != '') {
			const newTag: ProductTag = {
				k: newKey,
				v: newValue,
				product: barcode,
				version: 1
			};

			const ok = await createProductTag(newTag, fetch);

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

<table class="table w-full">
	<thead>
		<tr>
			<th>Key</th>
			<th>Value</th>
		</tr>
	</thead>
	<tbody>
		{#each tags as tag, i}
			<tr>
				<td>{tag.k}</td>
				<td class="flex gap-2">
					<input
						type="text"
						class="input grow"
						value={tag.v}
						readonly={!editable}
						on:change={(e) => updateTag(e, i)}
					/>
					<button
						class="btn btn-error"
						on:click={() => {
							tags = tags.filter((t) => t.k !== tag.k);
							deleteProductTag(tag, fetch);
						}}
					>
						Delete
					</button>
				</td>
			</tr>
		{/each}

		<tr>
			<td>
				<input
					type="text"
					class="input w-full"
					placeholder="Key"
					readonly={!editable}
					bind:value={newKey}
				/>
			</td>
			<td class="flex gap-2">
				<input
					type="text"
					class="input grow"
					placeholder="Value"
					readonly={!editable}
					bind:value={newValue}
				/>
				<button class="btn btn-primary" bind:this={newButton} on:click={createNewTag}>Create</button
				>
			</td>
		</tr>
	</tbody>
</table>
